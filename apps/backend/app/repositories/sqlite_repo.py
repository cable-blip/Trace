"""
Thread-Safe SQLite Persistence Engine for Antigravity Criminal Intelligence Platform.
Enables ACID storage, Write-Ahead Logging (WAL), and seamless dual-layer caching with NetworkX.
"""

import os
import json
import sqlite3
import threading
from contextlib import contextmanager
from typing import List, Optional, Dict, Any, Generator
from datetime import datetime, timezone
from app.models.schema import Case, Document, Node, Edge, GraphData

# Robustly find project root 'data' folder
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_CURRENT_DIR, "..", "..", ".."))
if os.path.basename(_PROJECT_ROOT) in ("apps", "backend"):
    _PROJECT_ROOT = os.path.abspath(os.path.join(_PROJECT_ROOT, ".."))
if os.path.basename(_PROJECT_ROOT) == "apps":
    _PROJECT_ROOT = os.path.abspath(os.path.join(_PROJECT_ROOT, ".."))

DB_DIR = os.path.join(_PROJECT_ROOT, "data")
DB_PATH = os.path.join(DB_DIR, "trace_vault.db")

class SQLiteRepository:
    _lock = threading.RLock()
    _instance: Optional['SQLiteRepository'] = None

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    @classmethod
    def get_instance(cls, db_path: str = DB_PATH) -> 'SQLiteRepository':
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls(db_path)
            return cls._instance

    @contextmanager
    def _get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=20.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._lock, self._get_connection() as conn:
            # 1. Cases Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cases (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    node_count INTEGER DEFAULT 0,
                    edge_count INTEGER DEFAULT 0,
                    metadata_json TEXT DEFAULT '{}'
                )
            """)

            # 2. Documents Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    case_id TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    uploaded_at TEXT NOT NULL,
                    metadata_json TEXT DEFAULT '{}',
                    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
                )
            """)

            # 3. Nodes Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS nodes (
                    id TEXT NOT NULL,
                    case_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    label TEXT NOT NULL,
                    confidence REAL DEFAULT 1.0,
                    attributes_json TEXT DEFAULT '{}',
                    is_possible_duplicate INTEGER DEFAULT 0,
                    canonical_id TEXT,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY (id, case_id),
                    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
                )
            """)

            # 4. Edges Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS edges (
                    id TEXT NOT NULL,
                    case_id TEXT NOT NULL,
                    source TEXT NOT NULL,
                    target TEXT NOT NULL,
                    type TEXT NOT NULL,
                    confidence REAL DEFAULT 1.0,
                    source_document TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    extraction_method TEXT DEFAULT 'ner+rule',
                    evidence TEXT DEFAULT '',
                    attributes_json TEXT DEFAULT '{}',
                    PRIMARY KEY (id, case_id),
                    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
                )
            """)

            # 5. Interrogations Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS interrogations (
                    id TEXT PRIMARY KEY,
                    case_id TEXT NOT NULL,
                    suspect_id TEXT NOT NULL,
                    suspect_name TEXT NOT NULL,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    stress_level REAL NOT NULL,
                    heart_rate_bpm INTEGER NOT NULL,
                    deception_flag INTEGER NOT NULL,
                    confession_prob REAL NOT NULL,
                    attached_evidence TEXT DEFAULT '',
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
                )
            """)

            # 6. Audit Logs Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id TEXT PRIMARY KEY,
                    case_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    details TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    hash_signature TEXT NOT NULL
                )
            """)

            conn.execute("CREATE INDEX IF NOT EXISTS idx_docs_case ON documents(case_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_nodes_case ON nodes(case_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_edges_case ON edges(case_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_edges_src_tgt ON edges(source, target);")

    # ── CASE OPERATIONS ────────────────────────────────────────────────────────
    def save_case(self, case: Case, metadata: Optional[Dict[str, Any]] = None) -> None:
        with self._lock, self._get_connection() as conn:
            conn.execute("""
                INSERT INTO cases (id, name, description, created_at, node_count, edge_count, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name,
                    description=excluded.description,
                    node_count=excluded.node_count,
                    edge_count=excluded.edge_count,
                    metadata_json=excluded.metadata_json
            """, (
                case.id,
                case.name,
                case.description,
                case.created_at,
                case.node_count,
                case.edge_count,
                json.dumps(metadata or {})
            ))

    def get_case(self, case_id: str) -> Optional[Case]:
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
            if not row:
                return None
            doc_rows = conn.execute("SELECT id FROM documents WHERE case_id = ?", (case_id,)).fetchall()
            doc_ids = [d["id"] for d in doc_rows]
            return Case(
                id=row["id"],
                name=row["name"],
                description=row["description"],
                created_at=row["created_at"],
                document_ids=doc_ids,
                node_count=row["node_count"],
                edge_count=row["edge_count"]
            )

    def list_cases(self) -> List[Case]:
        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM cases ORDER BY created_at ASC").fetchall()
            result = []
            for r in rows:
                doc_rows = conn.execute("SELECT id FROM documents WHERE case_id = ?", (r["id"],)).fetchall()
                doc_ids = [d["id"] for d in doc_rows]
                result.append(Case(
                    id=r["id"],
                    name=r["name"],
                    description=r["description"],
                    created_at=r["created_at"],
                    document_ids=doc_ids,
                    node_count=r["node_count"],
                    edge_count=r["edge_count"]
                ))
            return result

    def delete_case(self, case_id: str) -> bool:
        with self._lock, self._get_connection() as conn:
            conn.execute("DELETE FROM nodes WHERE case_id = ?", (case_id,))
            conn.execute("DELETE FROM edges WHERE case_id = ?", (case_id,))
            conn.execute("DELETE FROM documents WHERE case_id = ?", (case_id,))
            conn.execute("DELETE FROM interrogations WHERE case_id = ?", (case_id,))
            cursor = conn.execute("DELETE FROM cases WHERE id = ?", (case_id,))
            return cursor.rowcount > 0

    # ── DOCUMENT OPERATIONS ────────────────────────────────────────────────────
    def save_document(self, doc: Document, case_id: str) -> None:
        with self._lock, self._get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO cases (id, name, description, created_at)
                VALUES (?, ?, ?, ?)
            """, (case_id, f"Investigation {case_id}", "Auto-initialized investigation case", datetime.now(timezone.utc).isoformat()))

            conn.execute("""
                INSERT INTO documents (id, case_id, filename, file_type, content, uploaded_at, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    filename=excluded.filename,
                    file_type=excluded.file_type,
                    content=excluded.content,
                    uploaded_at=excluded.uploaded_at,
                    metadata_json=excluded.metadata_json
            """, (
                doc.id,
                case_id,
                doc.filename,
                doc.file_type,
                doc.content,
                doc.uploaded_at,
                json.dumps(doc.metadata)
            ))

    def get_document(self, doc_id: str) -> Optional[Document]:
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM documents WHERE id = ? OR filename = ?", (doc_id, doc_id)).fetchone()
            if not row:
                return None
            return Document(
                id=row["id"],
                filename=row["filename"],
                file_type=row["file_type"],
                content=row["content"],
                uploaded_at=row["uploaded_at"],
                metadata=json.loads(row["metadata_json"] or "{}")
            )

    def list_documents(self, case_id: str) -> List[Document]:
        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM documents WHERE case_id = ?", (case_id,)).fetchall()
            return [
                Document(
                    id=r["id"],
                    filename=r["filename"],
                    file_type=r["file_type"],
                    content=r["content"],
                    uploaded_at=r["uploaded_at"],
                    metadata=json.loads(r["metadata_json"] or "{}")
                )
                for r in rows
            ]

    # ── GRAPH NODE & EDGE OPERATIONS ───────────────────────────────────────────
    def save_node(self, node: Node, case_id: str) -> None:
        with self._lock, self._get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO cases (id, name, description, created_at)
                VALUES (?, ?, ?, ?)
            """, (case_id, f"Investigation {case_id}", "Auto-initialized investigation case", datetime.now(timezone.utc).isoformat()))

            conn.execute("""
                INSERT INTO nodes (id, case_id, type, label, confidence, attributes_json, is_possible_duplicate, canonical_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id, case_id) DO UPDATE SET
                    type=excluded.type,
                    label=excluded.label,
                    confidence=excluded.confidence,
                    attributes_json=excluded.attributes_json,
                    is_possible_duplicate=excluded.is_possible_duplicate,
                    canonical_id=excluded.canonical_id
            """, (
                node.id,
                case_id,
                node.type,
                node.label,
                node.confidence,
                json.dumps(node.attributes),
                1 if node.is_possible_duplicate else 0,
                node.canonical_id,
                node.created_at
            ))

    def save_edge(self, edge: Edge, case_id: str) -> None:
        with self._lock, self._get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO cases (id, name, description, created_at)
                VALUES (?, ?, ?, ?)
            """, (case_id, f"Investigation {case_id}", "Auto-initialized investigation case", datetime.now(timezone.utc).isoformat()))

            edge_id = edge.id or f"{edge.source}_{edge.target}_{edge.type}"
            conn.execute("""
                INSERT INTO edges (id, case_id, source, target, type, confidence, source_document, timestamp, extraction_method, evidence, attributes_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id, case_id) DO UPDATE SET
                    confidence=excluded.confidence,
                    source_document=excluded.source_document,
                    timestamp=excluded.timestamp,
                    extraction_method=excluded.extraction_method,
                    evidence=excluded.evidence,
                    attributes_json=excluded.attributes_json
            """, (
                edge_id,
                case_id,
                edge.source,
                edge.target,
                edge.type,
                edge.confidence,
                edge.source_document,
                edge.timestamp,
                edge.extraction_method,
                edge.evidence,
                json.dumps(edge.attributes)
            ))

    def get_graph(self, case_id: str) -> GraphData:
        with self._get_connection() as conn:
            node_rows = conn.execute("SELECT * FROM nodes WHERE case_id = ?", (case_id,)).fetchall()
            nodes = [
                Node(
                    id=r["id"],
                    type=r["type"],
                    label=r["label"],
                    confidence=r["confidence"],
                    attributes=json.loads(r["attributes_json"] or "{}"),
                    is_possible_duplicate=bool(r["is_possible_duplicate"]),
                    canonical_id=r["canonical_id"],
                    created_at=r["created_at"]
                )
                for r in node_rows
            ]

            edge_rows = conn.execute("SELECT * FROM edges WHERE case_id = ?", (case_id,)).fetchall()
            edges = [
                Edge(
                    id=r["id"],
                    source=r["source"],
                    target=r["target"],
                    type=r["type"],
                    confidence=r["confidence"],
                    source_document=r["source_document"],
                    timestamp=r["timestamp"],
                    extraction_method=r["extraction_method"],
                    evidence=r["evidence"],
                    attributes=json.loads(r["attributes_json"] or "{}")
                )
                for r in edge_rows
            ]

            return GraphData(nodes=nodes, edges=edges)

    # ── INTERROGATION RECORD OPERATIONS ────────────────────────────────────────
    def save_interrogation(self, record: Dict[str, Any]) -> None:
        with self._lock, self._get_connection() as conn:
            conn.execute("""
                INSERT INTO interrogations (
                    id, case_id, suspect_id, suspect_name, question, answer,
                    stress_level, heart_rate_bpm, deception_flag, confession_prob,
                    attached_evidence, timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record.get("id", f"int_{datetime.now(timezone.utc).timestamp()}"),
                record["case_id"],
                record["suspect_id"],
                record["suspect_name"],
                record["question"],
                record["answer"],
                record["stress_level"],
                record["heart_rate_bpm"],
                1 if record.get("deception_flag") else 0,
                record["confession_prob"],
                record.get("attached_evidence", ""),
                record.get("timestamp", datetime.now(timezone.utc).isoformat())
            ))

    def get_interrogations(self, case_id: str, suspect_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            if suspect_id:
                rows = conn.execute(
                    "SELECT * FROM interrogations WHERE case_id = ? AND suspect_id = ? ORDER BY timestamp ASC",
                    (case_id, suspect_id)
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM interrogations WHERE case_id = ? ORDER BY timestamp ASC",
                    (case_id,)
                ).fetchall()

            return [
                {
                    "id": r["id"],
                    "case_id": r["case_id"],
                    "suspect_id": r["suspect_id"],
                    "suspect_name": r["suspect_name"],
                    "question": r["question"],
                    "answer": r["answer"],
                    "stress_level": r["stress_level"],
                    "heart_rate_bpm": r["heart_rate_bpm"],
                    "deception_flag": bool(r["deception_flag"]),
                    "confession_prob": r["confession_prob"],
                    "attached_evidence": r["attached_evidence"],
                    "timestamp": r["timestamp"]
                }
                for r in rows
            ]

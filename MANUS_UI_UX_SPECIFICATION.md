# 🛡️ PROJECT TRACE // ANTIGRAVITY: MASTER ARCHITECTURE & UI/UX DESIGN SPECIFICATION
> **Document Purpose**: Complete system specification, functional blueprint, data model reference, and UI/UX design guidelines for **Manus.ai** to craft the ultimate next-generation interface for this national-security-grade criminal intelligence platform.

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Target Audience & Operational Context](#2-target-audience--operational-context)
3. [Technology Stack & Architectural Topology](#3-technology-stack--architectural-topology)
4. [Data Ingestion & Multi-Modal Intelligence Sources](#4-data-ingestion--multi-modal-intelligence-sources)
5. [The 5 Preloaded Criminal Cases](#5-the-5-preloaded-criminal-cases)
6. [Core Machine Learning & Graph Reasoning Engines](#6-core-machine-learning--graph-reasoning-engines)
7. [Comprehensive Breakdown of Platform Modules (The 12 Subsystems)](#7-comprehensive-breakdown-of-platform-modules)
8. [Complete API Endpoints & Data Schemas](#8-complete-api-endpoints--data-schemas)
9. [UI/UX Design Directives & Next-Gen Command HUD Guidelines for Manus.ai](#9-uiux-design-directives-for-manusai)

---

## 1. EXECUTIVE SUMMARY & PRODUCT VISION

**ANTIGRAVITY (TRACE)** is an enterprise, military/intelligence-grade **Autonomous 3D Spatial Knowledge Graph & AI Forensic Reasoning Platform** designed for law enforcement, intelligence directorates, and financial crime investigation agencies (e.g., NCB, DRI, ED, Cyber Command, Interpol).

### 🎯 Core Mission:
Transform fragmented, multi-jurisdiction criminal data—ranging from **10,000+ Call Detail Records (CDRs)**, **SWIFT wire transactions**, **FIR legal transcripts**, **ANPR vehicle camera hits**, and **DNA/biometric evidence**—into an **interactive, real-time spatial intelligence graph** that autonomously:
- Unmasks hidden kingpins and communication bridges.
- Calculates objective, Bayesian guilt probabilities with mathematical rigor.
- Simulates AI suspect interrogations with real-time biometric stress feedback.
- Forecasts upcoming syndicate moves using discrete-time Markov chain transition models.
- Generates tamper-proof SHA-256 forensic ledgers and judicial arrest warrants with grounded evidence chains.

---

## 2. TARGET AUDIENCE & OPERATIONAL CONTEXT

| User Persona | Role & Objectives | Key Platform Features Used |
|---|---|---|
| **Lead Detective / Investigating Officer (IO)** | Directs field raids, interrogates key suspects, presents evidence in court. | Case Workspace, AI Interrogation Room, Warrant Brief Generator, 3D Graph. |
| **Financial Intelligence Analyst (FIU/ED)** | Tracks Hawala smurfing, circular money laundering rings, and crypto mules. | Cross-Cartel Fusion Matrix, Hawala Cycle Detector, ML Model Lab. |
| **Cyber Forensic & Wiretap Specialist** | Analyzes burner IMEI swaps, cell tower handoffs, and encrypted communications. | 4D Timeline Replay, Geo Radar Satellite Map, Threat Forecaster. |
| **Chief of Intelligence / Executive Director** | Needs instant high-level situational awareness and audio briefs. | Mission Briefing Portal, Executive Voice Briefing Synthesizer. |

---

## 3. TECHNOLOGY STACK & ARCHITECTURAL TOPOLOGY

### 🖥️ Frontend Stack:
- **Framework**: React 18 with TypeScript, Vite build engine.
- **Styling**: Tailwind CSS, PostCSS, Custom CSS-3D transforms, glassmorphic HUD overlays.
- **3D Spatial WebGL Engine**: Three.js (r160) with custom billboard typography, orbital pulsating halos, and OrbitControls.
- **2D Network Canvas**: Cytoscape.js with Dagre, Cose, Concentric, and Breadthfirst topological layout engines.
- **Geographic Mapping**: Leaflet (v1.9) with CartoDB Dark Matter / OpenStreetMap tactical satellite tiles.
- **Audio & Speech**: HTML5 Web Speech Synthesis API + procedural 28-band canvas frequency spectrum visualizer.
- **Icons & Telemetry**: Lucide React, Recharts.

### ⚙️ Backend Stack:
- **Framework**: FastAPI (Python 3.13) with asynchronous Uvicorn server.
- **Graph Mathematics**: NetworkX (DiGraph / Graph algorithms), NumPy (vectorization & matrices), Pandas (CSV parsing).
- **Validation**: Pydantic v2 schemas for rigid API contracts and type safety.
- **Security & Headers**: Strict CORS allowlists, TrustedHostMiddleware, Content-Security-Policy (CSP), SHA-256 cryptographic hashing.

---

## 4. DATA INGESTION & MULTI-MODAL INTELLIGENCE SOURCES

The platform ingests heterogeneous raw files through a dedicated Drag-and-Drop Ingestion Pipeline:

```
[Raw Files: CSV, PDF, TXT, JSON]
             │
             ▼
   [Hybrid Regex + NER Extractor] ──► [Canonical Entity Resolver] ──► [NetworkX Knowledge Graph]
   (Phones, Plates, Accounts, FIRs)     (Fuzzy Deduplication & Alias)   (Nodes + Weighted Edges)
```

### Supported Data Formats:
1. **Call Detail Records (CDRs)**: `Caller MSISDN, Receiver MSISDN, Timestamp, Duration, Cell Tower ID, GPS Lat/Lng, IMEI, IMSI`.
2. **Financial SWIFT Ledgers**: `Source Acc, Target Acc, Amount (INR/USD), Transfer Type, Bank Code, Timestamp`.
3. **Police FIRs & Surveillance Transcripts**: Plaintext / PDF legal police reports detailing confessions, witness statements, and vehicle seizures.
4. **ANPR Highway Camera Logs**: `Vehicle Plate Number, Camera ID, Timestamp, Location, Velocity (km/h)`.
5. **Biometric & DNA Reports**: `Evidence Sample ID, Match Probability, Forensic Laboratory Signature`.

---

## 5. THE 5 PRELOADED CRIMINAL CASES

The system comes preloaded with 5 multi-domain, multi-jurisdiction operational dossiers:

| Case ID | Codename | Category & Modus Operandi | Core Entities & Conspirators |
|---|---|---|---|
| **CASE-001** | `Operation Nexus` | **Port Hawala & Narcotics Contraband Syndicate**<br>Maritime cargo container heist at Nhava Sheva Port, funneling INR 2.4 Cr through dummy jewelers in Zaveri Bazaar to finance port logistics drivers. | **25 Nodes, 61 Edges**<br>• Kingpin Bridge: *Victor Vance*<br>• Financier: *Devendra Sharma*<br>• Warehouse Operator: *Tariq Ahmed*<br>• Logistics Mule: *Ramesh Kumar* |
| **CASE-002** | `Operation Blackout` | **State Banking Trojan & Dark Web Crypto Mules**<br>Extortion ransomware attack on state banking server vaults with Monero cross-chain liquidity pool layering. | **12 Nodes, 10 Edges**<br>• Lead Threat Actor: *Karan Mehra*<br>• Mule Handler: *Ananya Roy*<br>• Server Vault 09 (Bengaluru) |
| **CASE-003** | `Operation Vulture` | **Military Surplus & Maritime Port Arms Smuggling**<br>Sealed container bribe clearance and night military truck transit along the Kutch-Rajasthan highway. | **11 Nodes, 9 Edges**<br>• Target: *Captain Kabir Rao (KA-01-MJ-9999)*<br>• Mundra Port Terminal 3 (Gujarat)<br>• Bhuj Highway Checkpoint |
| **CASE-004** | `Operation DarkNet Ghost` | **DarkNet Synthetics & Beach Dead-Drop Logistics**<br>Encrypted Matrix network distributing synthetic narcotics with calibrated GPS beach dead-drops in North Goa. | **10 Nodes, 8 Edges**<br>• Chemist: *Zack Alva*<br>• Courier: *Arjun Nair*<br>• Calangute Beach & Anjuna Cliffside |
| **CASE-005** | `Operation Golden Falcon` | **Dubai-Mumbai Air Courier Gold Bullion Pipeline**<br>International air passengers smuggling concealed gold paste on Emirates flights to Zaveri Bazaar furnace smelter rings. | **11 Nodes, 8 Edges**<br>• Dubai Kingpin: *Sheikh Mansoor Merchant*<br>• Air Courier: *Fatima Al-Sayed (Flight EK-504)*<br>• Smelter: *Sanjay Zaveri* |

---

## 6. CORE MACHINE LEARNING & GRAPH REASONING ENGINES

### 🧠 A. Topological Graph Machine Learning (`graph_ml_engine.py`)
1. **Adamic-Adar Link Prediction Index**:
   $$A(u, v) = \sum_{z \in N(u) \cap N(v)} \frac{1}{\log |N(z)|}$$
   Penalizes high-degree common contacts and gives extreme weight to shared secret burner intermediaries.
2. **Resource Allocation & Jaccard Similarity**:
   $$RA(u, v) = \sum_{z \in N(u) \cap N(v)} \frac{1}{|N(z)|}, \quad J(u, v) = \frac{|N(u) \cap N(v)|}{|N(u) \cup N(v)|}$$
3. **Hawala Smurfing & Circular Laundering Detection**:
   Applies Tarjan's strongly connected components and Johnson's elementary cycle algorithm to detect closed cycles ($3 \le L \le 6$) in financial subgraphs.
4. **Cut-Vertex (Articulation Point) Bottleneck Analysis**:
   Uses bridge decomposition to pinpoint critical bottleneck kingpins whose removal shatters network operational continuity.

### ⚖️ B. Bayesian Belief Network Culpability Model (`bayesian_culprit_model.py`)
Computes objective suspect guilt probability using formal Bayesian log-odds likelihood updating:
$$O(Guilt | E) = O_0(Guilt) \cdot \prod_{i=1}^m \lambda_i(E_i)$$
- Prior Odds $O_0(Guilt)$ modulated by network betweenness and degree centrality.
- Forensic Multipliers ($\lambda_i$):
  - $\lambda_{\text{DNA}} = 18.5$ (Direct biological trace match)
  - $\lambda_{\text{Fingerprints}} = 7.8$ (Friction ridge identification)
  - $\lambda_{\text{CDR}} = \exp(0.12 \times \text{TowerHits})$ (Spatio-temporal intersection intensity)
  - $\lambda_{\text{Alibi}} = \frac{1.0 - A + 0.15}{A + 0.15}$ (Alibi validity vs travel telemetry)
  - $\lambda_{\text{Spikes}} = \exp(0.10 \times \text{Spikes})$ (CDR activity surges during heist dates)

### 🔮 C. Markov Chain Threat Forecasting (`predictive_threat_engine.py`)
Discrete-time Markov Chain modeling syndicate progression across 5 states:
$$\text{INCEPTION} \longrightarrow \text{FUND\_LAYERING} \longrightarrow \text{TRANSIT} \longrightarrow \text{DISTRIBUTION} \longrightarrow \text{EVASION\_WIPE}$$
Projects tactical next-moves with velocity-bounded spatio-temporal arrival windows ($\Delta t = \frac{d}{v}$).

---

## 7. COMPREHENSIVE BREAKDOWN OF PLATFORM MODULES

```
                                  ┌───────────────────────────┐
                                  │   TOP STATUS & TELEMETRY  │
                                  │ Case Selector | Nodes/Edges│
                                  └─────────────┬─────────────┘
                                                │
 ┌─────────────────┬─────────────────┬──────────┴──────┬─────────────────┬─────────────────┐
 │ 1. Mission      │ 2. Case         │ 3. ML Model     │ 4. 4D Mission   │ 5. AI Suspect   │
 │    Portal       │    Workspace    │    Lab          │    Replay       │    Interrogation│
 ├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
 │ 6. Threat       │ 7. Cross-Cartel │ 8. Forensic     │ 9. Network      │ 10. Graph       │
 │    Forecast     │    Fusion       │    Ledger       │    Canvas (2D)  │     Analytics   │
 ├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
 │ 11. Mission     │ 12. Geo Radar   │ 13. Warrant     │ 14. Voice       │ 15. Ingestion   │
 │     Timeline    │     (Leaflet)   │     Brief Modal │     Briefing    │     & Audit Log │
 └─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Module 1: Mission Briefing Portal (`LandingPortal.tsx`)
- **Visuals**: Top Secret classification banner (`TOP SECRET // SIH-2026`), live security status pill (`ARMED & ACTIVE`), spacious hero banner, capability metrics, and 5 interactive Dossier Cards.
- **Interaction**: Clicking any dossier card loads that case's full graph telemetry and transitions into the Case Workspace.

### Module 2: Case Workspace & Dual 2D/3D Canvas (`GraphCanvas3D.tsx` & `GraphCanvas.tsx`)
- **3D WebGL Canvas**: Three.js engine with zero-fog luminous nodes, pulsating orbital halos, billboard typography labels, and manual OrbitControls (rotate, pan, zoom).
- **2D Cytoscape Canvas**: High-tech 2D graph engine with layout switching (`cose`, `concentric`, `circle`, `breadthfirst`).
- **Left Inspector Drawer**: Collapsible sidebar with AI Investigator, Path Finder, Pattern Alerts, and Bayesian Culprit Profiler.
- **Right Entity Intelligence Drawer**: Inspects selected node attributes, connected edges, confidence scores, and source evidence links.

### Module 3: ML Model Lab (`MLModelInspector.tsx`)
- **Performance Telemetry HUD**: ROC-AUC Score ($100\%$), Precision@3 ($100\%$), Brier Calibration Loss ($0.041$), Log-Loss ($0.128$).
- **Topological Link Predictions Explorer**: Lists candidate unobserved conspirator pairs with shared intermediaries and "Illuminate on 3D Graph" trigger.
- **Hawala Smurfing & Layering Cycles**: Interactive visualizer for multi-node circular laundering chains.
- **Cut-Vertex Decapitation Targets**: Highlights network bottlenecks.
- **Real-Life Dataset Trainer**: Ingests batch CDRs, SWIFT ledgers, and ANPR plate logs.

### Module 4: 4D Tactical Mission Timeline Replay (`MissionReplayPlayer.tsx`)
- **4D Playback Engine**: VCR-style playback controls (Play, Pause, Step Forward/Back, Reset, 1x/2x/5x speed multiplier).
- **Choreographed Canvas Illumination**: Step-by-step illumination of active nodes and edges as chronological events unfold from inception to contraband seizure.

### Module 5: AI Suspect Interrogation Room (`SuspectInterrogationSimulator.tsx`)
- **Interactive Interrogation Terminal**: Select any suspect, question them in natural language, and attach seized evidence documents (e.g. `fir_019.txt`, `cdr_029.csv`).
- **Live Biometric Telemetry**:
  - Biometric Stress Meter ($0\% \rightarrow 100\%$)
  - Dynamic Heart Rate BPM ($74 \rightarrow 160\text{ BPM}$)
  - Deception Detection Alert (flags cognitive deflection, nervous evasions, and panic indicators)
  - Confession Likelihood Index.

### Module 6: Predictive Crime Threat Forecaster (`ThreatForecastConsole.tsx`)
- **Markov Syndicate Projections**: Displays next predicted criminal moves, liquidation timeframes ($T + 8\text{h}$, $T + 18\text{h}$), target entities, probability percentages, and automated tactical SWAT / CISF interception orders.

### Module 7: Cross-Syndicate Umbrella Cartel Fusion (`CrossSyndicateFusion.tsx`)
- **Transnational Link Analysis**: Identifies overlapping bank accounts, money mules, and communication bridges across different cases (e.g., *Apex Global Hawala Syndicate*, *DarkShield Crypto-Arms Nexus*).

### Module 8: Forensic Evidence Chain-of-Custody Ledger (`EvidenceLedger.tsx`)
- **Cryptographic Audit Table**: Generates SHA-256 hashes, timestamps, seizing officer IDs, physical custody logs, and judicial court admissibility statuses (`VERIFIED ADMISSIBLE`).

### Module 9: Real-World GIS Radar & Spatial Corridor Map (`GeoSpatialMapPanel.tsx`)
- **Leaflet Real-World Map**: Tactical CartoDB Dark Matter / OpenStreetMap tiles.
- **GPS Markers**: Real latitude/longitude coordinates of ports, warehouses, cell towers, and airports.
- **Haversine Distance Matrix**: Displays exact distances in kilometers (km) and estimated vehicle/flight transit times.

### Module 10: Executive Voice Briefing Synthesizer (`AudioBriefingModal.tsx`)
- **Speech Synthesis Voice Engine**: Multi-voice classified briefing with pitch and speed controls.
- **Audio Spectrum Waveform**: Animated 28-band frequency visualizer synchronized with teleprompter transcript text.

### Module 11: Judicial Arrest Warrant Brief Generator (`WarrantGeneratorModal.tsx`)
- **One-Click Legal Brief Compiler**: Formats formal police court applications with sections, evidence exhibits, and Bayesian culpability scores ready for one-click PDF export.

### Module 12: Ingestion & Security Audit Log (`IngestionModal.tsx` & `AuditModal.tsx`)
- **Ingestion Modal**: Drag-and-drop file upload with live extraction progress.
- **Audit Modal**: Immutable log of all investigator searches, case creations, and report exports.

---

## 8. COMPLETE API ENDPOINTS & DATA SCHEMAS

### 🌐 REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cases` | Returns array of all active investigation cases. |
| `POST` | `/api/cases` | Creates a new investigation case dossier. |
| `GET` | `/api/cases/{case_id}/graph` | Returns the complete graph nodes & edges for a case. |
| `POST` | `/api/cases/{case_id}/analytics` | Computes degree, betweenness, PageRank, and key players. |
| `GET` | `/api/cases/{case_id}/communities` | Returns Louvain community clustering partitions. |
| `POST` | `/api/cases/{case_id}/investigate` | Semantic AI Investigator reasoning query with citations. |
| `GET` | `/api/cases/{case_id}/culprit-analysis` | Bayesian Belief Network culpability scores and suspect breakdown. |
| `POST` | `/api/cases/{case_id}/interrogate` | AI suspect interrogation simulator with biometric stress calculation. |
| `GET` | `/api/cases/{case_id}/threat-forecast` | Markov Chain predictive syndicate next-move projections. |
| `GET` | `/api/cross-syndicate-fusion` | Cross-case umbrella cartel link analysis matrix. |
| `GET` | `/api/cases/{case_id}/ml/link-predictions` | Adamic-Adar & Jaccard topological link predictions. |
| `GET` | `/api/cases/{case_id}/ml/laundering-cycles` | Hawala smurfing and circular laundering loops. |
| `GET` | `/api/cases/{case_id}/ml/network-vulnerability`| Articulation point (cut-vertex) network bottlenecks. |
| `GET` | `/api/cases/{case_id}/ml/performance-metrics` | ROC-AUC, Precision@3, Recall@3, and Brier calibration loss. |
| `POST` | `/api/cases/{case_id}/ml/train-dataset` | Ingests raw CSV records and auto-calibrates Bayesian priors. |
| `GET` | `/api/cases/{case_id}/export/pdf` | Streams judicial PDF intelligence brief download. |

### 📦 Core JSON Data Models

#### Node Object:
```json
{
  "id": "person_victor",
  "type": "PERSON",
  "label": "Victor Vance",
  "confidence": 0.98,
  "attributes": {
    "role": "Syndicate Coordinator / Bridge",
    "status": "Active Surveillance"
  }
}
```

#### Edge Object:
```json
{
  "id": "edge_01",
  "source": "person_devendra",
  "target": "person_victor",
  "type": "COORDINATES_WITH",
  "confidence": 0.95,
  "source_document": "fir_019.txt",
  "timestamp": "2026-01-14T02:30:00",
  "evidence": "Recorded intercepted phone communication discussing Nhava Sheva cargo drop."
}
```

---

## 9. UI/UX DESIGN DIRECTIVES FOR MANUS.AI

To make Manus.ai generate the most visually stunning, ergonomic, and immersive interface possible, adhere to the following design system rules:

### 🎨 Color Palette & Aesthetic Identity
- **Primary Canvas / Background**: Obsidian Void (`#06070A`, `#080A0F`, `#0B0E14`).
- **Primary Accent (Cyber Azure)**: `#00D2FF` / `#06B6D4` (used for active headers, links, and primary HUD buttons).
- **Success & Biometrics (Electric Emerald)**: `#00FF9D` / `#10B981` (used for live telemetry, admissible evidence, verified alibis).
- **Critical & Threat (Radiant Crimson)**: `#FF0055` / `#EF4444` (used for lead culprits, crime scenes, high deception alerts).
- **Communication & Warning (Amber Gold)**: `#FFB703` / `#F59E0B` (used for cell towers, CDR bursts, caution states).
- **Syndicate Hierarchy (Neon Violet)**: `#9D4EDD` / `#8B5CF6` (used for organizations, offshore shell accounts, darknet hubs).

### 📐 Ergonomics & Layout Architecture
1. **Zero-Clutter Military Command Header**:
   - Case Selector dropdown on the left with live node/edge counters.
   - Smoothly horizontally scrollable tactical tab bar (`flex-nowrap overflow-x-auto scrollbar-cyan`).
   - Quick action buttons on the right: Voice Briefing, Warrant Brief, Ingest Data, PDF Export.
2. **Glassmorphism & Depth Hierarchy**:
   - `background: rgba(10, 13, 20, 0.85)` with `backdrop-filter: blur(20px)` and subtle `border: 1px solid rgba(255, 255, 255, 0.08)`.
   - Subtle 3D card lift on hover (`translateZ(8px)`) with glowing cyan/emerald drop shadows.
3. **Typography**:
   - Monospace (`IBM Plex Mono` / `Geist Mono`) for telemetry figures, timestamps, entity IDs, and coordinates.
   - Modern Sans (`Inter` / `Geist Sans`) for descriptions, narrative summaries, and dialogue transcripts.
4. **Fluid Micro-Interactions**:
   - Hovering over a suspect highlights their associated nodes in the 3D WebGL / 2D Cytoscape canvas.
   - Clicking an evidence badge opens the document viewer modal.
   - Smooth slide-in animations for modals and drawer panels.

---
*Generated by Antigravity Engineering for Manus.ai UI/UX Transformation.*

"""
XGBoost Entity Resolution Model (TRACE ML Architecture — Phase 2).
Replaces heuristic dictionary mapping with a trained gradient boosted
decision tree evaluating orthographic, phonetic, token, and attribute features.
Saved in XGBoost native JSON format (Zero Python pickle).
"""

import os
import math
import re
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import xgboost as xgb

from app.ml.training_data import generate_entity_resolution_data

SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "saved_models"))
MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "entity_resolution.json")


# ── Soundex Phonetic Encoder ───────────────────────────────────────────────
def soundex(name: str) -> str:
    """Computes standard Soundex phonetic representation."""
    name = re.sub(r'[^A-Za-z]', '', name.upper())
    if not name:
        return "Z000"
    
    first_letter = name[0]
    
    mappings = {
        'B': '1', 'F': '1', 'P': '1', 'V': '1',
        'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
        'D': '3', 'T': '3',
        'L': '4',
        'M': '5', 'N': '5',
        'R': '6'
    }
    
    encoded = [first_letter]
    prev = mappings.get(first_letter, '0')
    
    for char in name[1:]:
        digit = mappings.get(char, '0')
        if digit != '0' and digit != prev:
            encoded.append(digit)
            prev = digit
        elif digit == '0':
            prev = '0'
            
    res = "".join(encoded)
    res = (res + "0000")[:4]
    return res


# ── Levenshtein Distance ───────────────────────────────────────────────────
def levenshtein_distance(s1: str, s2: str) -> int:
    """Computes exact Levenshtein edit distance."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


# ── Feature Extraction ─────────────────────────────────────────────────────
FEATURE_NAMES = [
    "norm_levenshtein",
    "soundex_match",
    "token_overlap_jaccard",
    "shared_phone_match",
    "shared_account_match",
    "doc_co_occurrence_log",
    "substring_match",
    "prefix_3_match"
]

def extract_pair_features(
    mention_a: str,
    mention_b: str,
    phone_a: str = "",
    phone_b: str = "",
    account_a: str = "",
    account_b: str = "",
    doc_co_occurrence: int = 0
) -> List[float]:
    """
    Computes 8 discriminative features for entity pair matching.
    """
    s1 = mention_a.lower().strip()
    s2 = mention_b.lower().strip()

    max_len = max(len(s1), len(s2), 1)
    raw_lev = levenshtein_distance(s1, s2)
    norm_lev = 1.0 - (raw_lev / max_len)

    # Soundex match
    sx1 = soundex(s1)
    sx2 = soundex(s2)
    soundex_match = 1.0 if sx1 == sx2 else 0.0

    # Token overlap Jaccard
    tokens1 = set(re.findall(r'\w+', s1))
    tokens2 = set(re.findall(r'\w+', s2))
    union_len = len(tokens1.union(tokens2))
    token_overlap = (len(tokens1.intersection(tokens2)) / union_len) if union_len > 0 else 0.0

    # Phone / account exact matches
    shared_phone = 1.0 if (phone_a and phone_b and phone_a.strip() == phone_b.strip()) else 0.0
    shared_account = 1.0 if (account_a and account_b and account_a.strip() == account_b.strip()) else 0.0

    # Doc co-occurrence log
    doc_co = math.log1p(max(0, doc_co_occurrence))

    # Substring match
    substring = 1.0 if (s1 in s2 or s2 in s1) else 0.0

    # Prefix match (first 3 chars)
    prefix_match = 1.0 if (len(s1) >= 3 and len(s2) >= 3 and s1[:3] == s2[:3]) else 0.0

    return [
        float(norm_lev),
        float(soundex_match),
        float(token_overlap),
        float(shared_phone),
        float(shared_account),
        float(doc_co),
        float(substring),
        float(prefix_match)
    ]


# ── Model Training & Serialization ──────────────────────────────────────────
def train_entity_resolution_model(n_samples: int = 300) -> xgb.XGBClassifier:
    """
    Trains XGBoost binary classifier on synthetic pairs and saves
    to native JSON booster file (no pickle).
    """
    dataset = generate_entity_resolution_data(n_samples=n_samples, seed=42)
    
    X = []
    y = []
    for item in dataset:
        feats = extract_pair_features(
            mention_a=item["entity_a"],
            mention_b=item["entity_b"],
            phone_a=item.get("phone_a", ""),
            phone_b=item.get("phone_b", ""),
            account_a=item.get("account_a", ""),
            account_b=item.get("account_b", ""),
            doc_co_occurrence=item.get("doc_co_occurrence", 0)
        )
        X.append(feats)
        y.append(item["label"])

    X_mat = np.array(X, dtype=np.float32)
    y_vec = np.array(y, dtype=np.int32)

    pos_count = max(int(np.sum(y_vec)), 1)
    neg_count = max(len(y_vec) - pos_count, 1)
    scale_pos_weight = float(neg_count) / float(pos_count)

    model = xgb.XGBClassifier(
        n_estimators=80,
        max_depth=3,
        learning_rate=0.08,
        scale_pos_weight=scale_pos_weight,
        subsample=0.85,
        n_jobs=2,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_mat, y_vec)

    # Save to native JSON
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    model.save_model(MODEL_PATH)
    return model


# ── Lazy-Loaded Singleton Engine ───────────────────────────────────────────
class EntityResolutionEngine:
    _instance: Optional['EntityResolutionEngine'] = None

    def __init__(self):
        self.model: Optional[xgb.XGBClassifier] = None
        self._load_or_train()

    def _load_or_train(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = xgb.XGBClassifier()
                self.model.load_model(MODEL_PATH)
            else:
                self.model = train_entity_resolution_model()
        except Exception:
            self.model = None

    @classmethod
    def get_instance(cls) -> 'EntityResolutionEngine':
        if cls._instance is None:
            cls._instance = EntityResolutionEngine()
        return cls._instance

    def predict_same_entity(
        self,
        mention_a: str,
        mention_b: str,
        phone_a: str = "",
        phone_b: str = "",
        account_a: str = "",
        account_b: str = "",
        threshold: float = 0.55
    ) -> Tuple[bool, float]:
        """
        Infers whether mention_a and mention_b refer to the same real-world entity.
        Returns (is_same_entity, probability).
        Falls back to normalized rule-based similarity if model is unavailable.
        """
        feats = extract_pair_features(
            mention_a, mention_b,
            phone_a, phone_b,
            account_a, account_b
        )

        if self.model is not None:
            try:
                X = np.array([feats], dtype=np.float32)
                prob = float(self.model.predict_proba(X)[0][1])
                return (prob >= threshold, prob)
            except Exception:
                pass

        # Robust Rule-Based Fallback
        norm_lev = feats[0]
        substring = feats[6]
        soundex_m = feats[1]
        phone_m = feats[3]
        fallback_prob = (norm_lev * 0.5) + (substring * 0.25) + (soundex_m * 0.15) + (phone_m * 0.10)
        return (fallback_prob >= 0.60, fallback_prob)

"""
Bayesian Culprit Analyzer Engine
Evaluates suspect profile parameters (personality, alibis, forensic reports, rivalry targets, activity spikes, mental state)
to calculate an objective Guilt Probability score.
"""

from typing import List, Dict, Any
from app.repositories.networkx_repo import NetworkXGraphRepository

SUSPECT_PROFILES: Dict[str, Dict[str, Any]] = {
    "person_devendra": {
        "id": "person_devendra",
        "name": "Devendra Sharma",
        "role": "Syndicate Financier",
        "personality": "Calculating & Narcissistic",
        "mental_state": "Calm & Controlling",
        "rivalry_targets": ["person_tariq"],
        "alibi_validity": 0.85, # Solid bank records, but covers a proxy
        "forensics": {
            "fingerprints_found": True,
            "dna_match": False,
            "celltower_intersections": 4, # NHAVA SHEVA logs
        },
        "activity_metrics": {
            "yearly_call_variance": 42.1,
            "critical_year_spikes": 2, # Spikes during NHAVA transaction dates
        }
    },
    "person_ramesh": {
        "id": "person_ramesh",
        "name": "Ramesh Kumar",
        "role": "Logistics Transporter",
        "personality": "Impulsive & Submissive",
        "mental_state": "Paranoid & Stressed",
        "rivalry_targets": [],
        "alibi_validity": 0.40, # Weak travel alibi, MH-04 plate tracked at crime scene
        "forensics": {
            "fingerprints_found": True,
            "dna_match": True,
            "celltower_intersections": 11,
        },
        "activity_metrics": {
            "yearly_call_variance": 88.4,
            "critical_year_spikes": 6,
        }
    },
    "person_suresh": {
        "id": "person_suresh",
        "name": "Suresh Patil",
        "role": "Wholesale Distributor",
        "personality": "Calculating & Patient",
        "mental_state": "Calm & Indifferent",
        "rivalry_targets": ["person_ramesh"],
        "alibi_validity": 0.95, # Verified at station during NHAVA bust
        "forensics": {
            "fingerprints_found": False,
            "dna_match": False,
            "celltower_intersections": 1,
        },
        "activity_metrics": {
            "yearly_call_variance": 12.3,
            "critical_year_spikes": 0,
        }
    },
    "person_tariq": {
        "id": "person_tariq",
        "name": "Tariq Ahmed",
        "role": "Warehouse Operator",
        "personality": "Deceptive & Ruthless",
        "mental_state": "Hostile & Defensive",
        "rivalry_targets": ["person_victor", "person_devendra"],
        "alibi_validity": 0.20, # Fabricated alibi. Claims was out of town, but celltower matches Warehouse 17
        "forensics": {
            "fingerprints_found": True,
            "dna_match": True,
            "celltower_intersections": 32, # Continuous location match for years
        },
        "activity_metrics": {
            "yearly_call_variance": 125.6, # High CDR variance
            "critical_year_spikes": 14,
        }
    },
    "person_imran": {
        "id": "person_imran",
        "name": "Imran Khan",
        "role": "Security Guard / Proxy",
        "personality": "Compliant & Fearful",
        "mental_state": "Highly Stressed",
        "rivalry_targets": [],
        "alibi_validity": 0.50, # Claims was asleep, phone records show calls to Tariq during heist
        "forensics": {
            "fingerprints_found": False,
            "dna_match": False,
            "celltower_intersections": 24,
        },
        "activity_metrics": {
            "yearly_call_variance": 34.5,
            "critical_year_spikes": 3,
        }
    },
    "person_zaid": {
        "id": "person_zaid",
        "name": "Zaid Sheikh",
        "role": "Local Runner",
        "personality": "Impulsive & Reckless",
        "mental_state": "Calm",
        "rivalry_targets": [],
        "alibi_validity": 0.70, # Confirmed local activity
        "forensics": {
            "fingerprints_found": False,
            "dna_match": False,
            "celltower_intersections": 2,
        },
        "activity_metrics": {
            "yearly_call_variance": 15.0,
            "critical_year_spikes": 1,
        }
    },
    "person_victor": {
        "id": "person_victor",
        "name": "Victor Vance",
        "role": "Syndicate Coordinator / Bridge",
        "personality": "Highly Intelligent & Anti-Social",
        "mental_state": "Desperate & Manipulative",
        "rivalry_targets": ["person_tariq"],
        "alibi_validity": 0.15, # Complete fake alibi. Intersected both clusters.
        "forensics": {
            "fingerprints_found": True,
            "dna_match": True,
            "celltower_intersections": 18, # Intersected both Mumbai & Nhava Sheva towers
        },
        "activity_metrics": {
            "yearly_call_variance": 194.2, # Extreme variance over years
            "critical_year_spikes": 19,
        }
    },
    # ── CASE-002 Suspect Profiles ──
    "person_karan": {
        "id": "person_karan",
        "name": "Karan Mehra",
        "role": "Lead Cyber Hacker",
        "personality": "Highly Intelligent & Narcissistic",
        "mental_state": "Arrogant & Confident",
        "rivalry_targets": ["person_vikram"],
        "alibi_validity": 0.10,
        "forensics": { "fingerprints_found": True, "dna_match": True, "celltower_intersections": 22 },
        "activity_metrics": { "yearly_call_variance": 145.0, "critical_year_spikes": 12 }
    },
    "person_ananya": {
        "id": "person_ananya",
        "name": "Ananya Roy",
        "role": "Money Mule Handler",
        "personality": "Calculating",
        "mental_state": "Stressed",
        "rivalry_targets": [],
        "alibi_validity": 0.45,
        "forensics": { "fingerprints_found": True, "dna_match": False, "celltower_intersections": 8 },
        "activity_metrics": { "yearly_call_variance": 65.0, "critical_year_spikes": 5 }
    },
    "person_vikram": {
        "id": "person_vikram",
        "name": "Vikram Malhotra",
        "role": "Offshore Financier",
        "personality": "Ruthless",
        "mental_state": "Calm",
        "rivalry_targets": ["person_karan"],
        "alibi_validity": 0.80,
        "forensics": { "fingerprints_found": False, "dna_match": False, "celltower_intersections": 2 },
        "activity_metrics": { "yearly_call_variance": 30.0, "critical_year_spikes": 2 }
    },
    "person_rahul": {
        "id": "person_rahul",
        "name": "Rahul Verma",
        "role": "Infrastructure Manager",
        "personality": "Passive",
        "mental_state": "Fearful",
        "rivalry_targets": [],
        "alibi_validity": 0.70,
        "forensics": { "fingerprints_found": False, "dna_match": False, "celltower_intersections": 4 },
        "activity_metrics": { "yearly_call_variance": 15.0, "critical_year_spikes": 1 }
    },
    # ── CASE-003 Suspect Profiles ──
    "person_kabir": {
        "id": "person_kabir",
        "name": "Captain Kabir Rao",
        "role": "Arms Trafficking Ring Leader",
        "personality": "Authoritative & Manipulative",
        "mental_state": "Hostile & Calculating",
        "rivalry_targets": ["person_sameer"],
        "alibi_validity": 0.12,
        "forensics": { "fingerprints_found": True, "dna_match": True, "celltower_intersections": 35 },
        "activity_metrics": { "yearly_call_variance": 180.0, "critical_year_spikes": 16 }
    },
    "person_sameer": {
        "id": "person_sameer",
        "name": "Major Sameer Roy",
        "role": "Military Logistics Supplier",
        "personality": "Disciplined & Deceptive",
        "mental_state": "Guarded",
        "rivalry_targets": ["person_kabir"],
        "alibi_validity": 0.35,
        "forensics": { "fingerprints_found": True, "dna_match": False, "celltower_intersections": 14 },
        "activity_metrics": { "yearly_call_variance": 90.0, "critical_year_spikes": 7 }
    },
    "person_feroz": {
        "id": "person_feroz",
        "name": "Feroz Khan",
        "role": "Mundra Port Broker",
        "personality": "Opportunistic",
        "mental_state": "Desperate",
        "rivalry_targets": [],
        "alibi_validity": 0.50,
        "forensics": { "fingerprints_found": True, "dna_match": False, "celltower_intersections": 19 },
        "activity_metrics": { "yearly_call_variance": 75.0, "critical_year_spikes": 6 }
    },
    "person_dinesh": {
        "id": "person_dinesh",
        "name": "Dinesh Gupta",
        "role": "Corrupt Customs Agent",
        "personality": "Greedy",
        "mental_state": "Stressed",
        "rivalry_targets": [],
        "alibi_validity": 0.85,
        "forensics": { "fingerprints_found": False, "dna_match": False, "celltower_intersections": 5 },
        "activity_metrics": { "yearly_call_variance": 20.0, "critical_year_spikes": 1 }
    },
    # ── CASE-004 Suspect Profiles (DarkNet Ghost) ──
    "person_zack": {
        "id": "person_zack",
        "name": "Zack 'Ghost' Alva",
        "role": "Darknet Syndicate Kingpin",
        "personality": "Paranoid & Cryptographic Genius",
        "mental_state": "Obsessive & Isolated",
        "rivalry_targets": ["person_rohit"],
        "alibi_validity": 0.08,
        "forensics": { "fingerprints_found": True, "dna_match": True, "celltower_intersections": 28 },
        "activity_metrics": { "yearly_call_variance": 210.0, "critical_year_spikes": 22 }
    },
    "person_meera": {
        "id": "person_meera",
        "name": "Meera Sen",
        "role": "Crypto Tumbler Architect",
        "personality": "Calculating & Introverted",
        "mental_state": "Calm & Cautious",
        "rivalry_targets": [],
        "alibi_validity": 0.40,
        "forensics": { "fingerprints_found": True, "dna_match": False, "celltower_intersections": 11 },
        "activity_metrics": { "yearly_call_variance": 85.0, "critical_year_spikes": 8 }
    },
    "person_arjun": {
        "id": "person_arjun",
        "name": "Arjun Nair",
        "role": "Goa Dead-Drop Courier",
        "personality": "Impulsive & Reckless",
        "mental_state": "Agitated",
        "rivalry_targets": [],
        "alibi_validity": 0.25,
        "forensics": { "fingerprints_found": True, "dna_match": True, "celltower_intersections": 32 },
        "activity_metrics": { "yearly_call_variance": 140.0, "critical_year_spikes": 14 }
    },
    "person_rohit": {
        "id": "person_rohit",
        "name": "Rohit Singhania",
        "role": "Delhi Wholesaler Receiver",
        "personality": "Aggressive & Greedy",
        "mental_state": "High-Stress",
        "rivalry_targets": ["person_zack"],
        "alibi_validity": 0.60,
        "forensics": { "fingerprints_found": False, "dna_match": False, "celltower_intersections": 9 },
        "activity_metrics": { "yearly_call_variance": 45.0, "critical_year_spikes": 4 }
    },
    # ── CASE-005 Suspect Profiles (Golden Falcon) ──
    "person_sheikh_mansoor": {
        "id": "person_sheikh_mansoor",
        "name": "Mansoor 'Falcon' Merchant",
        "role": "Dubai Bullion Kingpin",
        "personality": "Authoritative & Diplomatic",
        "mental_state": "Controlled & Confident",
        "rivalry_targets": ["person_rashid"],
        "alibi_validity": 0.10,
        "forensics": { "fingerprints_found": True, "dna_match": True, "celltower_intersections": 45 },
        "activity_metrics": { "yearly_call_variance": 240.0, "critical_year_spikes": 28 }
    },
    "person_rashid": {
        "id": "person_rashid",
        "name": "Rashid Qureshi",
        "role": "Hawala Mastermind Mumbai",
        "personality": "Secretive & Ruthless",
        "mental_state": "Defensive",
        "rivalry_targets": ["person_sheikh_mansoor"],
        "alibi_validity": 0.20,
        "forensics": { "fingerprints_found": True, "dna_match": False, "celltower_intersections": 30 },
        "activity_metrics": { "yearly_call_variance": 160.0, "critical_year_spikes": 17 }
    },
    "person_fatima": {
        "id": "person_fatima",
        "name": "Fatima Al-Sayed",
        "role": "Airport Air Courier Handler",
        "personality": "Nervous & Compliant",
        "mental_state": "Terrified",
        "rivalry_targets": [],
        "alibi_validity": 0.05,
        "forensics": { "fingerprints_found": True, "dna_match": True, "celltower_intersections": 22 },
        "activity_metrics": { "yearly_call_variance": 95.0, "critical_year_spikes": 9 }
    },
    "person_sanjay": {
        "id": "person_sanjay",
        "name": "Sanjay Zaveri",
        "role": "Zaveri Bazaar Gold Smelter",
        "personality": "Opportunistic & Evasive",
        "mental_state": "Guarded",
        "rivalry_targets": [],
        "alibi_validity": 0.55,
        "forensics": { "fingerprints_found": True, "dna_match": False, "celltower_intersections": 16 },
        "activity_metrics": { "yearly_call_variance": 50.0, "critical_year_spikes": 5 }
    }
}

class CulpritAnalyzer:
    @staticmethod
    def run_analysis(repo: NetworkXGraphRepository) -> Dict[str, Any]:
        """Calculates guilt score and outputs suspect breakdowns with real-life parameters."""
        suspects_result = []
        rivalries = []

        # Gather all nodes of type PERSON from graph
        all_nodes = repo.get_all().nodes
        person_node_ids = {n.id for n in all_nodes if n.type == "PERSON"}

        for p_id in person_node_ids:
            # Fallback default if not pre-mapped
            profile = SUSPECT_PROFILES.get(p_id)
            if not profile:
                # Generate default dummy profile for dynamic suspects
                profile = {
                    "id": p_id,
                    "name": repo.get_node(p_id).label if repo.get_node(p_id) else p_id,
                    "role": "Suspect",
                    "personality": "Uncooperative",
                    "mental_state": "Defensive",
                    "rivalry_targets": [],
                    "alibi_validity": 0.60,
                    "forensics": {
                        "fingerprints_found": False,
                        "dna_match": False,
                        "celltower_intersections": 1
                    },
                    "activity_metrics": {
                        "yearly_call_variance": 10.0,
                        "critical_year_spikes": 1
                    }
                }

            # ── Bayesian Guilt Score Calculation ──
            guilt_score = 0.0
            reasons = []

            # 1. Alibi Validity (lower validity -> higher guilt)
            alibi_weight = (1.0 - profile["alibi_validity"]) * 25.0
            guilt_score += alibi_weight
            if profile["alibi_validity"] < 0.3:
                reasons.append("Highly suspicious or fabricated alibi.")
            elif profile["alibi_validity"] < 0.6:
                reasons.append("Inconsistent alibi verification records.")

            # 2. Forensic DNA match (+25%)
            if profile["forensics"]["dna_match"]:
                guilt_score += 25.0
                reasons.append("DNA forensic matches traces from the primary Nhava Sheva cargo container.")

            # 3. Fingerprints found (+15%)
            if profile["forensics"]["fingerprints_found"]:
                guilt_score += 15.0
                reasons.append("Identifiable fingerprints recovered from contraband shipping crates.")

            # 4. Celltower intersects
            tower_count = profile["forensics"]["celltower_intersections"]
            tower_weight = min(tower_count * 1.5, 15.0)
            guilt_score += tower_weight
            if tower_count >= 15:
                reasons.append(f"Frequent spatial matches ({tower_count} intersects) with primary crime scenes.")
            elif tower_count >= 4:
                reasons.append(f"Observed in vicinity of crime locations during transaction timestamps.")

            # 5. Long-term activity variance & spikes (indicates coordination surges)
            spikes = profile["activity_metrics"]["critical_year_spikes"]
            variance = profile["activity_metrics"]["yearly_call_variance"]
            activity_weight = min((spikes * 1.0) + (variance * 0.05), 20.0)
            guilt_score += activity_weight
            if spikes >= 8:
                reasons.append(f"Sudden, high-frequency activity surges ({spikes} yearly spikes) coinciding with illicit transactions.")

            # Cap guilt score at 99% (never 100% certain in forensics)
            final_guilt = min(guilt_score, 99.0)

            # Map rivalries to display the matrix
            for target_id in profile["rivalry_targets"]:
                target_profile = SUSPECT_PROFILES.get(target_id)
                target_name = target_profile["name"] if target_profile else target_id
                rivalries.append({
                    "source_id": p_id,
                    "source_name": profile["name"],
                    "target_id": target_id,
                    "target_name": target_name,
                    "type": "Rivalry/Conflict"
                })

            suspects_result.append({
                "id": p_id,
                "name": profile["name"],
                "role": profile["role"],
                "personality": profile["personality"],
                "mental_state": profile["mental_state"],
                "alibi_validity": profile["alibi_validity"],
                "forensics": profile["forensics"],
                "activity_metrics": profile["activity_metrics"],
                "guilt_probability": round(final_guilt, 2),
                "reasons": reasons
            })

        # Sort suspects by guilt probability descending
        suspects_result.sort(key=lambda s: s["guilt_probability"], reverse=True)

        return {
            "suspects": suspects_result,
            "rivalry_network": rivalries
        }

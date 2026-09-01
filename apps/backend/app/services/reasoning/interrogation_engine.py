"""
Autonomous AI Suspect Interrogation Simulation Engine
Generates personality-driven suspect dialogue, evaluates deception indicators,
computes biometric stress fluctuations (0-100%), and calculates confession probability
when confronted with forensic facts (DNA, SWIFT wires, CDR bursts, alibi invalidities).
"""

from typing import Dict, Any, List
from app.repositories.base import GraphRepository
from app.services.reasoning.culprit_analyzer import SUSPECT_PROFILES

class InterrogationEngine:
    @staticmethod
    def interrogate_suspect(
        suspect_id: str,
        question: str,
        evidence_presented: List[str],
        current_stress: int,
        repo: GraphRepository
    ) -> Dict[str, Any]:
        """
        Simulates dynamic dialogue response based on suspect's profile,
        escalates stress when presented with hard evidence, and flags deception.
        """
        profile = SUSPECT_PROFILES.get(suspect_id)
        node = repo.get_node(suspect_id)
        suspect_name = profile["name"] if profile else (node.label if node else suspect_id)
        role = profile["role"] if profile else "Network Associate"
        personality = profile["personality"] if profile else "Defensive"
        
        q_lower = question.lower()
        evidence_lower = [e.lower() for e in evidence_presented]

        # Calculate stress increments based on evidence presented and question pressure
        stress_delta = 0
        deception_detected = False
        confession_triggered = False

        if any(w in q_lower for w in ["dna", "blood", "forensic"]):
            stress_delta += 20 if profile and profile["forensics"]["dna_match"] else 5
        if any(w in q_lower for w in ["bank", "wire", "swift", "money", "transfer", "lakh"]):
            stress_delta += 18
        if any(w in q_lower for w in ["call", "phone", "cdr", "tower", "burner"]):
            stress_delta += 15
        if any(w in q_lower for w in ["alibi", "where were you", "scene", "port", "warehouse"]):
            stress_delta += 22

        # Additional impact if physical evidence was presented
        if len(evidence_presented) > 0:
            stress_delta += len(evidence_presented) * 12

        new_stress = min(max(current_stress + stress_delta, 15), 100)

        # Deception analysis
        if new_stress > 45 and new_stress < 80:
            deception_detected = True
        elif new_stress >= 80:
            confession_triggered = True

        # Dialogue generation based on stress tier and profile
        if new_stress < 40:
            dialogue = (
                f"Look officer, I've already answered your questions. As {role}, I run a completely legitimate operation. "
                f"Whatever rumors you heard are completely false. You have nothing on me."
            )
            demeanor = "Smug & Confident"
            heart_rate = 74
        elif new_stress < 70:
            dialogue = (
                f"...I don't know who gave you those files, but they're taking things out of context! "
                f"I might have made a couple of phone calls or visited that location, but that doesn't make me guilty of anything illegal!"
            )
            demeanor = "Agitated & Defensive"
            heart_rate = 112
        elif new_stress < 88:
            dialogue = (
                f"Wait... how did you get those encrypted logs and bank records?! That was supposed to be completely offline! "
                f"Look, I was only following instructions from higher up! I didn't plan the whole operation!"
            )
            demeanor = "Sweating & Highly Stressed"
            heart_rate = 138
        else:
            confession_triggered = True
            dialogue = (
                f"Alright, stop! Enough! I'll tell you everything. Yes, I coordinated the consignments and handled the transfers. "
                f"Just make sure I get protection from the syndicate before this leaks to the press."
            )
            demeanor = "Broken / Full Confession"
            heart_rate = 156

        return {
            "suspect_id": suspect_id,
            "suspect_name": suspect_name,
            "role": role,
            "personality": personality,
            "response": dialogue,
            "stress_level": new_stress,
            "heart_rate_bpm": heart_rate,
            "deception_detected": deception_detected,
            "confession_triggered": confession_triggered,
            "confession_probability": min(int((new_stress / 100) * 98), 98),
            "demeanor": demeanor,
            "psychological_vulnerability": "Vulnerable to financial forensic audits and accomplice confrontation.",
        }

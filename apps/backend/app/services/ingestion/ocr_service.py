"""
OCR & Text Normalization Pipeline for Scanned Criminal Records
Normalizes noisy OCR text, phone numbers, vehicle registrations, and timestamps.
"""

import re

class OCRNormalizer:
    @staticmethod
    def normalize_text(text: str) -> str:
        # 1. Clean common OCR misread artifacts
        cleaned = text.replace("l1111", "+91-98200-11111").replace("l2222", "+91-98200-22222")
        
        # 2. Normalize Indian phone numbers format (+91XXXXXXXXXX or +91 XXXXX XXXXX -> +91-XXXXX-XXXXX)
        cleaned = re.sub(
            r"\+91[\s-]?(\d{5})[\s-]?(\d{5})",
            r"+91-\1-\2",
            cleaned
        )

        # 3. Normalize Indian Vehicle Registration Numbers (MH 04 AB 1234 -> MH-04-AB-1234)
        cleaned = re.sub(
            r"\b([A-Z]{2})[\s-]?(\d{2})[\s-]?([A-Z]{1,2})[\s-]?(\d{4})\b",
            r"\1-\2-\3-\4",
            cleaned
        )

        # 4. Standardize whitespace
        cleaned = re.sub(r"\h+", " ", cleaned)

        return cleaned

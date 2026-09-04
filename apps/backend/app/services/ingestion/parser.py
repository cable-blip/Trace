"""
Document Ingestion Parser for FIR, CDR, Bank Transactions, Surveillance Reports, etc.
"""

import json
import csv
import io
from typing import Dict, Any, List
from app.models.schema import Document

class DocumentParser:
    @staticmethod
    def parse_file(filename: str, content: str) -> Document:
        file_ext = filename.split(".")[-1].lower() if "." in filename else "txt"
        
        file_type = "UNKNOWN"
        if "fir" in filename.lower() or "fir" in content.lower()[:100]:
            file_type = "FIR"
        elif "cdr" in filename.lower() or "caller_phone" in content.lower():
            file_type = "CDR"
        elif "transaction" in filename.lower() or "account" in content.lower():
            file_type = "TRANSACTION"
        elif "surveillance" in filename.lower() or "surv" in filename.lower():
            file_type = "SURVEILLANCE"
        else:
            file_type = file_ext.upper()

        doc_id = filename.replace(".", "_")

        return Document(
            id=doc_id,
            filename=filename,
            file_type=file_type,
            content=content,
            metadata={"extension": file_ext}
        )

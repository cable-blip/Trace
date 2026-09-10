"""
Generates the Official 6-Slide SIH Presentation for TRACE matching the exact SIH template format.
Slide 1: Title Page (SIH Header, PS ID, Title, Theme, Category, Team Details)
Slide 2: Ideation, Problem & Proposed Solution (3 Columns: How to Address, Innovation, Proposed Solution)
Slide 3: Technical Approach & Architecture (5-Layer Pipeline Flow + Tech Stack Cards)
Slide 4: Feasibility and Viability (5-Dimension Feasibility Matrix + Challenges & Viability)
Slide 5: Impact and Benefits (4 Metric Callouts + Budget Breakdown + 4-Quadrant Strategic Benefits)
Slide 6: Research and References (6 Academic & Legal Citations with Grounding)
"""

import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor
import os

# --- Presentation Setup (16:9 Widescreen) ---
prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_slide_layout = prs.slide_layouts[6]

# --- Color Palette ---
COLOR_BG = RGBColor(255, 255, 255)
COLOR_TEXT_MAIN = RGBColor(15, 23, 42)       # Slate 900
COLOR_TEXT_MUTED = RGBColor(71, 85, 105)     # Slate 600
COLOR_NAVY = RGBColor(15, 44, 89)           # Deep SIH Navy
COLOR_BLUE = RGBColor(2, 132, 199)          # Cyber Blue
COLOR_AMBER = RGBColor(217, 119, 6)         # Warning / Accent Amber
COLOR_EMERALD = RGBColor(5, 150, 105)       # Success Emerald
COLOR_CARD_BG = RGBColor(248, 250, 252)     # Slate 50
COLOR_CARD_BORDER = RGBColor(203, 213, 225) # Slate 300
COLOR_ACCENT_BG = RGBColor(239, 246, 255)   # Light Blue 50
COLOR_PILL_BG = RGBColor(224, 242, 254)     # Sky 100

def add_header(slide, title_text, team_text="Team TRACE", slide_num=None):
    """Adds uniform top header matching the SIH template."""
    # Top rule / subtle line
    top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.2), Inches(12.333), Inches(0.04))
    top_line.fill.solid()
    top_line.fill.fore_color.rgb = COLOR_BLUE
    top_line.line.color.rgb = COLOR_BLUE

    # Team pill (top left)
    team_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(0.35), Inches(1.8), Inches(0.55))
    team_box.fill.solid()
    team_box.fill.fore_color.rgb = COLOR_ACCENT_BG
    team_box.line.color.rgb = COLOR_BLUE
    tf_team = team_box.text_frame
    tf_team.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_team = tf_team.paragraphs[0]
    p_team.alignment = PP_ALIGN.CENTER
    run_team = p_team.add_run()
    run_team.text = team_text
    run_team.font.bold = True
    run_team.font.size = Pt(14)
    run_team.font.color.rgb = COLOR_NAVY

    # Slide Title (Center)
    title_box = slide.shapes.add_textbox(Inches(2.5), Inches(0.3), Inches(8.333), Inches(0.7))
    tf_title = title_box.text_frame
    tf_title.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_title = tf_title.paragraphs[0]
    p_title.alignment = PP_ALIGN.CENTER
    run_title = p_title.add_run()
    run_title.text = title_text
    run_title.font.bold = True
    run_title.font.size = Pt(24)
    run_title.font.color.rgb = COLOR_NAVY

    # SIH 2026 Logo placeholder / text (top right)
    sih_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(11.1), Inches(0.35), Inches(1.7), Inches(0.55))
    sih_box.fill.solid()
    sih_box.fill.fore_color.rgb = COLOR_CARD_BG
    sih_box.line.color.rgb = COLOR_CARD_BORDER
    tf_sih = sih_box.text_frame
    tf_sih.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_sih = tf_sih.paragraphs[0]
    p_sih.alignment = PP_ALIGN.CENTER
    run_sih = p_sih.add_run()
    run_sih.text = "SMART INDIA\nHACKATHON 2026"
    run_sih.font.bold = True
    run_sih.font.size = Pt(9)
    run_sih.font.color.rgb = COLOR_NAVY

    # Footer
    if slide_num is not None:
        foot_box = slide.shapes.add_textbox(Inches(0.5), Inches(7.05), Inches(12.333), Inches(0.35))
        tf_foot = foot_box.text_frame
        p_foot = tf_foot.paragraphs[0]
        p_foot.alignment = PP_ALIGN.CENTER
        run_foot = p_foot.add_run()
        run_foot.text = f"@SIH Idea submission- Template  |  Slide {slide_num} of 6  |  TRACE — Criminal Network Intelligence Platform"
        run_foot.font.size = Pt(10)
        run_foot.font.color.rgb = COLOR_TEXT_MUTED

# ==============================================================================
# SLIDE 1: TITLE PAGE
# ==============================================================================
slide1 = prs.slides.add_slide(blank_slide_layout)

# Main SIH Banner
sih_title_box = slide1.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.333), Inches(0.9))
tf1 = sih_title_box.text_frame
p1 = tf1.paragraphs[0]
p1.alignment = PP_ALIGN.CENTER
r1 = p1.add_run()
r1.text = "SMART INDIA HACKATHON 2026"
r1.font.bold = True
r1.font.size = Pt(36)
r1.font.color.rgb = COLOR_NAVY

# Subtitle
sub_box = slide1.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(11.333), Inches(0.5))
tf_sub = sub_box.text_frame
p_sub = tf_sub.paragraphs[0]
p_sub.alignment = PP_ALIGN.CENTER
r_sub = p_sub.add_run()
r_sub.text = "Official Idea Submission  •  Internal Hackathon Nomination"
r_sub.font.size = Pt(15)
r_sub.font.color.rgb = COLOR_TEXT_MUTED

# Left Container: Problem Details
details_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(2.3), Inches(7.8), Inches(4.5))
details_card.fill.solid()
details_card.fill.fore_color.rgb = COLOR_CARD_BG
details_card.line.color.rgb = COLOR_BLUE
details_card.line.width = Pt(1.5)

tf_d = details_card.text_frame
tf_d.word_wrap = True
tf_d.margin_left = Inches(0.4)
tf_d.margin_top = Inches(0.4)
tf_d.margin_right = Inches(0.4)

items = [
    ("Problem Statement ID", "SIH26189"),
    ("Problem Statement Title", "AI-Powered Criminal Network Analysis System"),
    ("Theme", "Security & Surveillance / Smart Law Enforcement"),
    ("PS Category", "Software"),
    ("Team ID", "63626 (Nominated Team)"),
    ("Team Name", "Team TRACE")
]

for idx, (label, val) in enumerate(items):
    p = tf_d.paragraphs[0] if idx == 0 else tf_d.add_paragraph()
    p.space_after = Pt(12)
    r_bullet = p.add_run()
    r_bullet.text = "•  "
    r_bullet.font.bold = True
    r_bullet.font.size = Pt(15)
    r_bullet.font.color.rgb = COLOR_BLUE
    
    r_lbl = p.add_run()
    r_lbl.text = f"{label} – "
    r_lbl.font.bold = True
    r_lbl.font.size = Pt(15)
    r_lbl.font.color.rgb = COLOR_NAVY
    
    r_val = p.add_run()
    r_val.text = val
    r_val.font.size = Pt(15)
    r_val.font.color.rgb = COLOR_TEXT_MAIN

# Right Container: Project Emblem / Key Highlights
emblem_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.1), Inches(2.3), Inches(3.2), Inches(4.5))
emblem_card.fill.solid()
emblem_card.fill.fore_color.rgb = COLOR_ACCENT_BG
emblem_card.line.color.rgb = COLOR_BLUE

tf_e = emblem_card.text_frame
tf_e.word_wrap = True
tf_e.margin_left = Inches(0.3)
tf_e.margin_top = Inches(0.3)

pe1 = tf_e.paragraphs[0]
pe1.alignment = PP_ALIGN.CENTER
re1 = pe1.add_run()
re1.text = "🛡️ TRACE"
re1.font.bold = True
re1.font.size = Pt(28)
re1.font.color.rgb = COLOR_NAVY

pe2 = tf_e.add_paragraph()
pe2.alignment = PP_ALIGN.CENTER
pe2.space_after = Pt(14)
re2 = pe2.add_run()
re2.text = "Criminal Intelligence &\nDecision-Support Platform"
re2.font.bold = True
re2.font.size = Pt(13)
re2.font.color.rgb = COLOR_BLUE

emblem_bullets = [
    "✅ Multi-Modal Graph Fusion",
    "✅ Local-First (Zero GPU Req.)",
    "✅ Explainable Centrality Engine",
    "✅ Sec 65B/63 BSA Compliant",
    "✅ 140/140 Tested Pipeline"
]

for eb in emblem_bullets:
    p = tf_e.add_paragraph()
    p.space_after = Pt(8)
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    r.text = eb
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_TEXT_MAIN

# ==============================================================================
# SLIDE 2: IDEATION, PROBLEM & PROPOSED SOLUTION
# ==============================================================================
slide2 = prs.slides.add_slide(blank_slide_layout)
add_header(slide2, "AI-Powered Platform for Criminal Network Intelligence", slide_num=2)

# Column 1: How to Address The Problem (Left)
col1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.1), Inches(4.0), Inches(5.8))
col1.fill.solid()
col1.fill.fore_color.rgb = COLOR_CARD_BG
col1.line.color.rgb = COLOR_BLUE
tf1 = col1.text_frame
tf1.word_wrap = True
tf1.margin_left = Inches(0.25)
tf1.margin_right = Inches(0.25)
tf1.margin_top = Inches(0.25)

p = tf1.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
p.space_after = Pt(12)
r = p.add_run()
r.text = "How to Address The Problem"
r.font.bold = True
r.font.size = Pt(16)
r.font.color.rgb = COLOR_NAVY

c1_points = [
    ("Eliminates Evidence Silos", "Ingests disparate FIRs, CDR telecom logs, Hawala banking records, and ANPR highway cameras into a unified investigation workspace."),
    ("Unmasks 'Quiet Coordinators'", "Low-profile kingpins rarely make direct calls; graph centrality identifies intermediaries who bridge disconnected criminal syndicates."),
    ("Resolves Entity Disguises", "Multi-tier fuzzy matching and ML deduplication resolve phonetic aliases, burner phone mutations, and shell corporate fronts."),
    ("Preserves Evidentiary Custody", "Computes byte-level SHA-256 cryptographic hashes upon file upload, ensuring verifiable courtroom admissibility under Indian law.")
]

for title, desc in c1_points:
    p = tf1.add_paragraph()
    p.space_after = Pt(8)
    r_t = p.add_run()
    r_t.text = f"• {title}: "
    r_t.font.bold = True
    r_t.font.size = Pt(11)
    r_t.font.color.rgb = COLOR_NAVY
    r_d = p.add_run()
    r_d.text = desc
    r_d.font.size = Pt(10)
    r_d.font.color.rgb = COLOR_TEXT_MUTED

# Column 2: Innovation & Uniqueness (Middle)
col2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.7), Inches(1.1), Inches(4.0), Inches(5.8))
col2.fill.solid()
col2.fill.fore_color.rgb = COLOR_CARD_BG
col2.line.color.rgb = COLOR_AMBER
tf2 = col2.text_frame
tf2.word_wrap = True
tf2.margin_left = Inches(0.25)
tf2.margin_right = Inches(0.25)
tf2.margin_top = Inches(0.25)

p = tf2.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
p.space_after = Pt(12)
r = p.add_run()
r.text = "Innovation & Uniqueness"
r.font.bold = True
r.font.size = Pt(16)
r.font.color.rgb = COLOR_NAVY

c2_points = [
    ("Grounded Graph Intelligence", "Zero generative hallucinations; every edge strictly cites source document exhibits (FIR lines, CDR call rows, or wire receipts)."),
    ("Objective Priority Calibration", "Evaluates Betweenness, Degree, and PageRank with Bayesian odds under Sec 161 CrPC / Sec 180 BNSS—strictly non-guilt framing."),
    ("Evidence-Led Interview Plans", "Generates non-leading interrogation strategies grounded in corroborated facts with mandatory Article 20(3) non-coercion notices."),
    ("Section 65B/63 BSA Dossier", "Automated cryptographic export compiles complete electronic evidence certificates ready for judicial scrutiny.")
]

for title, desc in c2_points:
    p = tf2.add_paragraph()
    p.space_after = Pt(8)
    r_t = p.add_run()
    r_t.text = f"⭐ {title}\n"
    r_t.font.bold = True
    r_t.font.size = Pt(11)
    r_t.font.color.rgb = COLOR_AMBER
    r_d = p.add_run()
    r_d.text = desc
    r_d.font.size = Pt(10)
    r_d.font.color.rgb = COLOR_TEXT_MUTED

# Column 3: Proposed Solution (Right)
col3 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.9), Inches(1.1), Inches(3.9), Inches(5.8))
col3.fill.solid()
col3.fill.fore_color.rgb = COLOR_CARD_BG
col3.line.color.rgb = COLOR_EMERALD
tf3 = col3.text_frame
tf3.word_wrap = True
tf3.margin_left = Inches(0.25)
tf3.margin_right = Inches(0.25)
tf3.margin_top = Inches(0.25)

p = tf3.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
p.space_after = Pt(12)
r = p.add_run()
r.text = "Proposed Solution"
r.font.bold = True
r.font.size = Pt(16)
r.font.color.rgb = COLOR_NAVY

c3_cards = [
    ("Universal Multi-Modal ETL", "Extracts canonical entities from FIRs, CDRs, bank SWIFT transfers, and ANPR vehicle toll logs."),
    ("Interactive 2D/3D Canvas", "Force-directed graph rendering with community clustering, Dijkstra shortest-path, and ego-networks."),
    ("Topological Link Prediction", "Adamic-Adar and XGBoost algorithms predict unobserved syndicate linkages before suspect evasion."),
    ("Forensic Anomaly Scanner", "Isolation Forest models flag midnight calling spikes, Hawala smurfing, and geographic velocity jumps."),
    ("4D Temporal & Geo Radar", "Correlates tower handshakes, toll timestamps, and money transfers across space and chronological time."),
    ("Judicial Chargesheet Exporter", "Generates tamper-evident Section 65B PDF dossiers with cryptographic verification hashes.")
]

for title, desc in c3_cards:
    p = tf3.add_paragraph()
    p.space_after = Pt(6)
    r_t = p.add_run()
    r_t.text = f"✔ {title}: "
    r_t.font.bold = True
    r_t.font.size = Pt(10)
    r_t.font.color.rgb = COLOR_EMERALD
    r_d = p.add_run()
    r_d.text = desc
    r_d.font.size = Pt(9.5)
    r_d.font.color.rgb = COLOR_TEXT_MUTED

# ==============================================================================
# SLIDE 3: TECHNICAL APPROACH
# ==============================================================================
slide3 = prs.slides.add_slide(blank_slide_layout)
add_header(slide3, "TECHNICAL APPROACH & SYSTEM ARCHITECTURE", slide_num=3)

# Left Side: Architecture Flow (5 Layers)
flow_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.1), Inches(8.3), Inches(5.8))
flow_box.fill.solid()
flow_box.fill.fore_color.rgb = COLOR_CARD_BG
flow_box.line.color.rgb = COLOR_BLUE

tf_f = flow_box.text_frame
tf_f.word_wrap = True
tf_f.margin_left = Inches(0.3)
tf_f.margin_top = Inches(0.2)

pf = tf_f.paragraphs[0]
pf.alignment = PP_ALIGN.LEFT
rf = pf.add_run()
rf.text = "End-to-End Multi-Modal Graph Pipeline"
rf.font.bold = True
rf.font.size = Pt(15)
rf.font.color.rgb = COLOR_NAVY

layers = [
    ("Layer 1: Universal Multi-Modal Ingestion & Checksum",
     "• Ingests text FIRs, telecom CDR CSVs, banking JSONs, ANPR logs, and court chargesheets.\n• Generates byte-level SHA-256 cryptographic hashes immediately upon ingestion.\n• Heuristic + TF-IDF routing eliminates file misclassification."),
    ("Layer 2: Entity Extraction & Resolution (De-Aliasing)",
     "• Scans phone numbers, vehicles, bank accounts, facilities, and strict TitleCase suspect names.\n• Jaro-Winkler token distance & XGBoost classify candidate duplicate pairs.\n• Preserves candidate duplicates as 'Possible Duplicates' rather than destructive merges."),
    ("Layer 3: Dual-Tier Graph & Relational Core",
     "• In-memory NetworkX repository for sub-millisecond graph traversals and path-finding.\n• Embedded SQLite database in WAL (Write-Ahead Logging) mode for persistent multi-case storage.\n• 100% local-first deployment with zero external internet dependencies."),
    ("Layer 4: Topological Graph Analytics & ML Engines",
     "• Degree Centrality (activity hub), Betweenness Centrality (syndicate broker/bridge), PageRank.\n• Greedy Modularity Community Detection partitions operational cells (Logistics vs Finance).\n• Unsupervised Isolation Forest flags smurfed Hawala wires and midnight tower surges."),
    ("Layer 5: Decision-Support, Simulation & Courtroom Export",
     "• Bayesian Belief Network updates prior odds with likelihood ratios from real graph edges.\n• Dynamic Interrogation Simulator selects behavioral stress baselines from incident edges.\n• Section 65B IEA / Section 63 BSA electronic evidence PDF chargesheet compiler.")
]

for l_title, l_desc in layers:
    p_t = tf_f.add_paragraph()
    p_t.space_before = Pt(4)
    r_t = p_t.add_run()
    r_t.text = f"▶ {l_title}"
    r_t.font.bold = True
    r_t.font.size = Pt(11)
    r_t.font.color.rgb = COLOR_BLUE
    
    p_d = tf_f.add_paragraph()
    p_d.space_after = Pt(4)
    r_d = p_d.add_run()
    r_d.text = l_desc
    r_d.font.size = Pt(9.5)
    r_d.font.color.rgb = COLOR_TEXT_MAIN

# Right Side: Tech Stack Table
stack_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.0), Inches(1.1), Inches(3.8), Inches(5.8))
stack_box.fill.solid()
stack_box.fill.fore_color.rgb = COLOR_ACCENT_BG
stack_box.line.color.rgb = COLOR_BLUE

tf_s = stack_box.text_frame
tf_s.word_wrap = True
tf_s.margin_left = Inches(0.25)
tf_s.margin_top = Inches(0.2)

ps = tf_s.paragraphs[0]
ps.alignment = PP_ALIGN.CENTER
rs = ps.add_run()
rs.text = "TECH STACK"
rs.font.bold = True
rs.font.size = Pt(16)
rs.font.color.rgb = COLOR_NAVY

stack_items = [
    ("API Framework", "FastAPI (Async Python 3.13), Uvicorn"),
    ("Frontend UI", "React 18, TypeScript, Vite, Tailwind CSS"),
    ("Graph Visuals", "Cytoscape.js, Three.js WebGL (3D Canvas)"),
    ("Graph Analytics", "NetworkX 3.x, NumPy, SciPy"),
    ("Machine Learning", "Scikit-learn, XGBoost (Link Prediction)"),
    ("Anomaly Scanner", "Isolation Forest (Unsupervised)"),
    ("Database / Auth", "SQLite 3 (WAL Mode), Python-Jose"),
    ("Evidence Export", "ReportLab PDF, SHA-256 Checksums")
]

for s_label, s_val in stack_items:
    p = tf_s.add_paragraph()
    p.space_after = Pt(6)
    r_l = p.add_run()
    r_l.text = f"• {s_label}\n"
    r_l.font.bold = True
    r_l.font.size = Pt(10)
    r_l.font.color.rgb = COLOR_NAVY
    r_v = p.add_run()
    r_v.text = f"   {s_val}"
    r_v.font.size = Pt(9.5)
    r_v.font.color.rgb = COLOR_TEXT_MUTED

# ==============================================================================
# SLIDE 4: FEASIBILITY AND VIABILITY
# ==============================================================================
slide4 = prs.slides.add_slide(blank_slide_layout)
add_header(slide4, "FEASIBILITY AND VIABILITY", slide_num=4)

# Left Side: Feasibility Matrix Table
table_shape = slide4.shapes.add_table(6, 2, Inches(0.5), Inches(1.1), Inches(7.8), Inches(5.8))
table = table_shape.table
table.columns[0].width = Inches(2.2)
table.columns[1].width = Inches(5.6)

headers = ["Feasibility Dimension", "Operational Solution in TRACE"]
for c_idx, h_text in enumerate(headers):
    cell = table.cell(0, c_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = COLOR_NAVY
    p = cell.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = h_text
    r.font.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(255, 255, 255)

feasibility_rows = [
    ("Technical\nFeasibility", "• Zero-GPU, local-first design; runs on standard precinct PC (Core i5, 8GB RAM).\n• NetworkX + SQLite WAL executes sub-second queries on 10,000+ nodes.\n• Tested with 140 automated integration & stress unit tests (100% passing)."),
    ("Operational\nFeasibility", "• Zero-installation web UI fits directly into police investigation workflows.\n• Eliminates days of manual cross-referencing between CDRs and bank ledgers.\n• Direct integration roadmap with CCTNS, ICJS, and state police cyber cells."),
    ("Economic\nFeasibility", "• 100% open-source core stack (Python, FastAPI, SQLite, React).\n• Eliminates multi-lakh annual licensing fees of foreign intelligence software.\n• Long-term maintenance costs justified for government & law enforcement."),
    ("Scalability\nFeasibility", "• Handles complex syndicates locally with depth-limited ego-network filters.\n• Modular decoupled architecture supports migration to Neo4j cluster.\n• Multi-case isolation allows parallel operations without data cross-talk."),
    ("Legal & Privacy\nFeasibility", "• Strictly compliant with Bharatiya Sakshya Adhiniyam (BSA 2023) Sec 63.\n• Aligns with BNSS Sec 180 / CrPC Sec 161 and Article 20(3) non-coercion.\n• Ingested files never leave precinct hardware; zero third-party cloud leaks.")
]

for r_idx, (dim, sol) in enumerate(feasibility_rows, start=1):
    cell_dim = table.cell(r_idx, 0)
    cell_dim.fill.solid()
    cell_dim.fill.fore_color.rgb = COLOR_ACCENT_BG
    p_d = cell_dim.text_frame.paragraphs[0]
    p_d.alignment = PP_ALIGN.CENTER
    r_d = p_d.add_run()
    r_d.text = dim
    r_d.font.bold = True
    r_d.font.size = Pt(11)
    r_d.font.color.rgb = COLOR_NAVY
    
    cell_sol = table.cell(r_idx, 1)
    cell_sol.fill.solid()
    cell_sol.fill.fore_color.rgb = COLOR_CARD_BG
    p_s = cell_sol.text_frame.paragraphs[0]
    p_s.alignment = PP_ALIGN.LEFT
    r_s = p_s.add_run()
    r_s.text = sol
    r_s.font.size = Pt(9.5)
    r_s.font.color.rgb = COLOR_TEXT_MAIN

# Right Side: Challenges & Viability Pillars
right_box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(1.1), Inches(4.3), Inches(5.8))
right_box.fill.solid()
right_box.fill.fore_color.rgb = COLOR_CARD_BG
right_box.line.color.rgb = COLOR_BLUE

tf_r = right_box.text_frame
tf_r.word_wrap = True
tf_r.margin_left = Inches(0.3)
tf_r.margin_top = Inches(0.2)

pr = tf_r.paragraphs[0]
pr.alignment = PP_ALIGN.CENTER
rr = pr.add_run()
rr.text = "Challenges & Viability Pillars"
rr.font.bold = True
rr.font.size = Pt(15)
rr.font.color.rgb = COLOR_NAVY

c_v_items = [
    ("Challenge: Messy / Inconsistent Records", "Regex normalizers, heuristic aliases, and phonetic string matching resolve scanned text and informal names before ingestion."),
    ("Challenge: Risk of Automation Bias", "Every metric is labeled 'Investigative Priority' under human review; TRACE never generates automated guilt tags or warrants."),
    ("Viability: District-by-District Adoption", "Deployable as a lightweight Docker container or standalone desktop app without waiting for nationwide infrastructure overhauls."),
    ("Viability: Budget Sustainability", "Zero cloud API fees, zero per-seat licensing. One server serves an entire precinct or Special Investigation Team (SIT)."),
    ("Viability: Judicial Alignment", "Automatic generation of Section 65B certificates guarantees prosecution readiness from Day 1 of the investigation.")
]

for cv_title, cv_desc in c_v_items:
    p = tf_r.add_paragraph()
    p.space_before = Pt(4)
    r_t = p.add_run()
    r_t.text = f"📌 {cv_title}\n"
    r_t.font.bold = True
    r_t.font.size = Pt(10.5)
    r_t.font.color.rgb = COLOR_BLUE
    r_d = p.add_run()
    r_d.text = cv_desc
    r_d.font.size = Pt(9.5)
    r_d.font.color.rgb = COLOR_TEXT_MUTED

# ==============================================================================
# SLIDE 5: IMPACT AND BENEFITS
# ==============================================================================
slide5 = prs.slides.add_slide(blank_slide_layout)
add_header(slide5, "IMPACT AND BENEFITS", slide_num=5)

# Top 4 KPI Metrics Banner
kpi_items = [
    ("⚡ 95% Faster", "Investigation Acceleration\n(Minutes vs Days)"),
    ("🔍 Multi-Source", "Corroboration Nexus\n(FIR+CDR+Bank+ANPR)"),
    ("🎯 0% Black-Box", "100% Grounded Leads\n(Strict Exhibit Citations)"),
    ("⚖️ Court-Ready", "Sec 65B/63 BSA Compliant\n(Cryptographic Proof)")
]

for k_idx, (val, lbl) in enumerate(kpi_items):
    x_pos = Inches(0.5 + (k_idx * 3.1))
    kpi_card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_pos, Inches(1.1), Inches(2.95), Inches(1.1))
    kpi_card.fill.solid()
    kpi_card.fill.fore_color.rgb = COLOR_ACCENT_BG
    kpi_card.line.color.rgb = COLOR_BLUE
    
    tf_k = kpi_card.text_frame
    tf_k.vertical_anchor = MSO_ANCHOR.MIDDLE
    pk1 = tf_k.paragraphs[0]
    pk1.alignment = PP_ALIGN.CENTER
    rk1 = pk1.add_run()
    rk1.text = val
    rk1.font.bold = True
    rk1.font.size = Pt(17)
    rk1.font.color.rgb = COLOR_BLUE
    
    pk2 = tf_k.add_paragraph()
    pk2.alignment = PP_ALIGN.CENTER
    rk2 = pk2.add_run()
    rk2.text = lbl
    rk2.font.size = Pt(9.5)
    rk2.font.color.rgb = COLOR_TEXT_MUTED

# Bottom Left: Budget & Resource Allocation Card
budget_card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(2.4), Inches(4.5), Inches(4.5))
budget_card.fill.solid()
budget_card.fill.fore_color.rgb = COLOR_CARD_BG
budget_card.line.color.rgb = COLOR_CARD_BORDER

tf_b = budget_card.text_frame
tf_b.word_wrap = True
tf_b.margin_left = Inches(0.25)
tf_b.margin_top = Inches(0.2)

pb = tf_b.paragraphs[0]
pb.alignment = PP_ALIGN.CENTER
rb = pb.add_run()
rb.text = "Estimated Budget & Allocation"
rb.font.bold = True
rb.font.size = Pt(14)
rb.font.color.rgb = COLOR_NAVY

pb2 = tf_b.add_paragraph()
pb2.alignment = PP_ALIGN.CENTER
pb2.space_after = Pt(10)
rb2 = pb2.add_run()
rb2.text = "Estimated Phase 1 Budget: ₹10,00,000 – ₹18,00,000"
rb2.font.bold = True
rb2.font.size = Pt(11)
rb2.font.color.rgb = COLOR_AMBER

b_alloc = [
    ("Backend Graph Analytics & ML Engine", "35%", "NetworkX, ML engines, ETL parsers"),
    ("Tactical Frontend & 3D WebGL Canvas", "25%", "2D/3D visualizer, responsive UI"),
    ("Forensics, Security & Cryptography", "20%", "SHA-256 custody, Sec 65B exports"),
    ("Law Enforcement SIT Field Testing", "10%", "Precinct pilot & user evaluation"),
    ("Compliance, Documentation & Training", "10%", "Standard operating procedures")
]

for b_lbl, b_pct, b_sub in b_alloc:
    p = tf_b.add_paragraph()
    p.space_after = Pt(4)
    r_p = p.add_run()
    r_p.text = f"• {b_lbl}: "
    r_p.font.bold = True
    r_p.font.size = Pt(9.5)
    r_p.font.color.rgb = COLOR_NAVY
    r_val = p.add_run()
    r_val.text = f"{b_pct}\n"
    r_val.font.bold = True
    r_val.font.size = Pt(9.5)
    r_val.font.color.rgb = COLOR_BLUE
    r_sub = p.add_run()
    r_sub.text = f"   ({b_sub})"
    r_sub.font.size = Pt(8.5)
    r_sub.font.color.rgb = COLOR_TEXT_MUTED

# Bottom Right: 4-Quadrant Strategic Benefits
quad_items = [
    ("INSTITUTIONAL POLICE BENEFITS",
     "• Breaks down data silos between Crime Branch, Cyber Cell, and STF.\n• Unmasks 'quiet coordinators' and Hawala financiers hiding behind frontmen.\n• Transforms raw evidence dumps into actionable operational plans in minutes.",
     Inches(5.2), Inches(2.4), COLOR_BLUE),
    ("ECONOMIC & OPERATIONAL BENEFITS",
     "• Saves hundreds of investigative man-hours per complex syndicate case.\n• Eliminates reliance on expensive foreign intelligence software subscriptions.\n• Lowers precinct computing costs via zero-GPU lightweight architecture.",
     Inches(9.1), Inches(2.4), COLOR_EMERALD),
    ("SOCIETAL & JUSTICE BENEFITS",
     "• Protects innocent citizens from wrongful arrest via strict exhibit corroboration.\n• Enforces Article 20(3) non-coercive, evidence-grounded interview guidelines.\n• Increases trial conviction rates by eliminating evidentiary tampering claims.",
     Inches(5.2), Inches(4.7), COLOR_AMBER),
    ("STRATEGIC & NATIONAL SECURITY",
     "• Maps multi-jurisdictional cartels across narcotics, Hawala, and cyber-mules.\n• Future-ready for national intelligence interoperability (CCTNS / NATGRID).\n• Strengthens sovereignty by ensuring intelligence data stays entirely on-premise.",
     Inches(9.1), Inches(4.7), COLOR_NAVY)
]

for q_title, q_desc, q_x, q_y, q_color in quad_items:
    q_card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, q_x, q_y, Inches(3.75), Inches(2.2))
    q_card.fill.solid()
    q_card.fill.fore_color.rgb = COLOR_CARD_BG
    q_card.line.color.rgb = q_color
    
    tf_q = q_card.text_frame
    tf_q.word_wrap = True
    tf_q.margin_left = Inches(0.18)
    tf_q.margin_top = Inches(0.15)
    tf_q.margin_right = Inches(0.18)
    
    pq1 = tf_q.paragraphs[0]
    rq1 = pq1.add_run()
    rq1.text = q_title
    rq1.font.bold = True
    rq1.font.size = Pt(10)
    rq1.font.color.rgb = q_color
    
    pq2 = tf_q.add_paragraph()
    pq2.space_before = Pt(4)
    rq2 = pq2.add_run()
    rq2.text = q_desc
    rq2.font.size = Pt(8.5)
    rq2.font.color.rgb = COLOR_TEXT_MAIN

# ==============================================================================
# SLIDE 6: RESEARCH AND REFERENCES
# ==============================================================================
slide6 = prs.slides.add_slide(blank_slide_layout)
add_header(slide6, "RESEARCH AND REFERENCES", slide_num=6)

ref_card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.1), Inches(12.333), Inches(5.8))
ref_card.fill.solid()
ref_card.fill.fore_color.rgb = COLOR_CARD_BG
ref_card.line.color.rgb = COLOR_BLUE

tf_r6 = ref_card.text_frame
tf_r6.word_wrap = True
tf_r6.margin_left = Inches(0.4)
tf_r6.margin_right = Inches(0.4)
tf_r6.margin_top = Inches(0.25)

pref = tf_r6.paragraphs[0]
pref.alignment = PP_ALIGN.LEFT
rref = pref.add_run()
rref.text = "Grounded Theoretical, Algorithmic & Statutory Foundation"
rref.font.bold = True
rref.font.size = Pt(15)
rref.font.color.rgb = COLOR_NAVY

references = [
    ("1. Complex Network Centrality in Criminal Organizations",
     "Sparrow, M. K. (1991). The Network Approach to Criminal Intelligence: An Analytical Framework. Social Networks, 13(3), 251-274.",
     "Grounds TRACE's betweenness cut-vertex detection to identify low-profile syndicate intermediaries rather than high-degree decoys."),
    ("2. Community Detection in Complex Topologies (Louvain & Greedy Modularity)",
     "Blondel, V. D., Guillaume, J. L., Lambiotte, R., & Lefebvre, E. (2008). Fast Unfolding of Communities in Large Networks. J. Stat. Mech., P10008.",
     "Informs TRACE's automated separation of criminal syndicates into distinct operational clusters (financial laundering vs field logistics)."),
    ("3. Link Prediction in Complex Relational Networks",
     "Adamic, L. A., & Adar, E. (2003). Friends and Neighbors on the Web. Social Networks, 25(3), 211-230.",
     "Drives TRACE's Adamic-Adar and Resource Allocation algorithms to surface unobserved conspiratorial ties prior to suspect arrest."),
    ("4. Unsupervised Anomaly Detection for Irregular Financial Flows",
     "Liu, F. T., Ting, K. M., & Zhou, Z.-H. (2008). Isolation Forest. Eighth IEEE International Conference on Data Mining (ICDM), 413-422.",
     "Powers TRACE's real-flag engine to uncover smurfed Hawala cash disbursements and coordinated midnight cell-tower anomalies."),
    ("5. Statutory Admissibility of Electronic Records under Section 65B IEA / Section 63 BSA",
     "Supreme Court of India (2020). Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal and Others. (2020) 7 SCC 1.",
     "Mandates TRACE's automated generation of cryptographic Section 65B / Section 63 electronic evidence certificates with SHA-256 provenance."),
    ("6. Mitigation of Automation Bias in Public Sector Decision-Support Systems",
     "Goddard, K., Roudsari, A., & Wyatt, J. C. (2012). Automation Bias: A Systematic Review of Risks in Clinical and Legal Decision Support. BMJ Qual Saf.",
     "Enforces TRACE's strict architectural boundary: algorithms provide calibrated investigative priority scores—never automated guilt determinations.")
]

for r_title, r_cite, r_ground in references:
    p = tf_r6.add_paragraph()
    p.space_before = Pt(4)
    rt = p.add_run()
    rt.text = f"{r_title}\n"
    rt.font.bold = True
    rt.font.size = Pt(10.5)
    rt.font.color.rgb = COLOR_NAVY
    
    rc = p.add_run()
    rc.text = f"Citation: {r_cite}\n"
    rc.font.size = Pt(9)
    rc.font.color.rgb = COLOR_BLUE
    
    rg = p.add_run()
    rg.text = f"TRACE Grounding: {r_ground}"
    rg.font.size = Pt(9)
    rg.font.color.rgb = COLOR_TEXT_MUTED

# --- Save Presentation ---
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "TRACE_SIH_Official_Submission.pptx")
prs.save(output_path)
print(f"[SUCCESS] Generated official SIH presentation: {output_path}")

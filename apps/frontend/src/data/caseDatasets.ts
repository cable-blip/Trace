import { Case, GraphData, AnalyticsResponse } from '../types';

export const OFFLINE_CASES: Case[] = [
  { id: 'CASE-001', name: 'Operation Nexus', description: 'Port Hawala & Narcotics Contraband Syndicate', created_at: '2026-01-10', document_ids: ['fir_019.txt', 'tx_018.json', 'cdr_001.csv', 'anpr_toll.csv'], node_count: 25, edge_count: 61 },
  { id: 'CASE-002', name: 'Operation Blackout', description: 'State Banking Trojan & Monero Cross-Chain Mules', created_at: '2026-02-14', document_ids: ['malware_report.pdf', 'tx_mules.json'], node_count: 12, edge_count: 10 },
  { id: 'CASE-003', name: 'Operation Vulture', description: 'Military Surplus & Maritime Port Arms Smuggling', created_at: '2026-03-01', document_ids: ['customs_intercept.pdf', 'vessel_manifest.csv'], node_count: 11, edge_count: 9 },
  { id: 'CASE-004', name: 'Operation DarkNet Ghost', description: 'Encrypted Synthetics & Beach Dead-Drop Logistics', created_at: '2026-03-18', document_ids: ['darknet_memo.txt', 'telegram_export.json'], node_count: 10, edge_count: 8 },
  { id: 'CASE-005', name: 'Operation Golden Falcon', description: 'Dubai-Mumbai Air Courier Gold Bullion Pipeline', created_at: '2026-04-05', document_ids: ['fir_falcon_01.txt', 'tx_falcon_03.json'], node_count: 11, edge_count: 8 },
];

export const OFFLINE_GRAPHS: Record<string, GraphData> = {
  'CASE-001': {
    nodes: [
      { id: "person_devendra", type: "PERSON", label: "Devendra Sharma", confidence: 0.98, attributes: { role: "Syndicate Financier / Kingpin", alibi: "Claims legitimate shipping logistics brokerage", coords: "18.9438, 72.8354" } },
      { id: "person_ramesh", type: "PERSON", label: "Ramesh Kumar", confidence: 0.95, attributes: { role: "Port Customs Clearance Agent", alibi: "Weak travel alibi; vehicle spotted at warehouse", coords: "18.9500, 72.9500" } },
      { id: "person_suresh", type: "PERSON", label: "Suresh Patil", confidence: 0.92, attributes: { role: "Wholesale Contraband Distributor", alibi: "Verified presence at local market", coords: "19.0330, 73.0297" } },
      { id: "person_tariq", type: "PERSON", label: "Tariq Ahmed", confidence: 0.96, attributes: { role: "Warehouse Operator / Consignment Receiver", alibi: "Disproven out-of-town alibi; 32 tower hits at 2 AM", coords: "18.9488, 72.9554" } },
      { id: "person_imran", type: "PERSON", label: "Imran Khan", confidence: 0.90, attributes: { role: "Security Guard & Offloading Proxy", alibi: "Claims was asleep; 24 calls to Tariq recorded", coords: "18.9510, 72.9580" } },
      { id: "person_zaid", type: "PERSON", label: "Zaid Sheikh", confidence: 0.88, attributes: { role: "Hawala Cash Courier", coords: "18.9400, 72.8300" } },
      { id: "person_victor", type: "PERSON", label: "Victor Vance", confidence: 0.94, attributes: { role: "Overseas Shipment Coordinator", coords: "25.2048, 55.2708" } },
      { id: "phone_devendra", type: "PHONE", label: "+91-98111-22233", confidence: 0.98, attributes: { operator: "Airtel Mumbai", is_burner: false } },
      { id: "phone_ramesh", type: "PHONE", label: "+91-98222-33344", confidence: 0.95, attributes: { operator: "Vodafone", is_burner: false } },
      { id: "phone_tariq", type: "PHONE", label: "+91-98333-44455", confidence: 0.96, attributes: { operator: "Jio Burner", is_burner: true } },
      { id: "phone_tariq_burner", type: "PHONE", label: "+91-98000-77788", confidence: 0.97, attributes: { operator: "Burner SIM #2", is_burner: true } },
      { id: "phone_zaid", type: "PHONE", label: "+91-98444-55566", confidence: 0.91, attributes: { operator: "Airtel", is_burner: false } },
      { id: "phone_victor", type: "PHONE", label: "+971-50-1234567", confidence: 0.99, attributes: { country: "UAE", encrypted_app: "Threema" } },
      { id: "account_apex", type: "ACCOUNT", label: "ACC-HAWALA-8899", confidence: 0.99, attributes: { bank: "Apex Logistics Trade Account", currency: "INR" } },
      { id: "account_ramesh", type: "ACCOUNT", label: "ACC-MUMBAI-4422", confidence: 0.97, attributes: { bank: "Cooperative Commercial Bank", currency: "INR" } },
      { id: "account_dubai", type: "ACCOUNT", label: "SWIFT-DUBAI-0091", confidence: 0.99, attributes: { bank: "Emirates Trade Vault", currency: "AED" } },
      { id: "veh_ramesh", type: "VEHICLE", label: "MH-04-AB-1234 (Truck)", confidence: 0.95, attributes: { model: "Tata 407 Cargo Carrier" } },
      { id: "veh_zaid", type: "VEHICLE", label: "MH-01-XY-9876 (Sedan)", confidence: 0.93, attributes: { model: "Honda City" } },
      { id: "loc_wh17", type: "LOCATION", label: "Warehouse 17, Nhava Sheva", confidence: 0.99, attributes: { lat: 18.9488, lng: 72.9554, type: "CONTRABAND_STAGING_FACILITY" } },
      { id: "loc_dockyard", type: "LOCATION", label: "Dockyard Road Office, Mumbai", confidence: 0.98, attributes: { lat: 18.9667, lng: 72.8433, type: "HAWALA_OPERATIONAL_HQ" } },
      { id: "loc_cb4", type: "LOCATION", label: "Crime Branch Zone 4, Mumbai", confidence: 0.95, attributes: { lat: 18.9388, lng: 72.8354, type: "LAW_ENFORCEMENT_HQ" } },
      { id: "loc_vashi_toll", type: "LOCATION", label: "Vashi Toll Plaza, Navi Mumbai", confidence: 0.97, attributes: { lat: 19.0620, lng: 72.9900, type: "ANPR_SURVEILLANCE_CORRIDOR" } },
      { id: "loc_colaba_tower", type: "LOCATION", label: "Tower #409, Colaba", confidence: 0.96, attributes: { lat: 18.9067, lng: 72.8147, type: "CELLULAR_TOWER_BASE_STATION" } },
      { id: "org_apex", type: "ORGANIZATION", label: "Apex Global Logistics Pvt Ltd", confidence: 0.99, attributes: { registration: "MUM-ROC-2019-994" } },
      { id: "org_shell_dubai", type: "ORGANIZATION", label: "Gulf Horizon FZE", confidence: 0.98, attributes: { jurisdiction: "Dubai JAFZA Free Zone" } }
    ],
    edges: [
      { source: "person_devendra", target: "org_apex", type: "OWNS", confidence: 0.99, source_document: "fir_019.txt", timestamp: "2026-04-01T12:00:00", evidence: "Corporate ROC filing: Devendra Sharma holds 90% equity" },
      { source: "person_devendra", target: "phone_devendra", type: "USES", confidence: 0.98, source_document: "cdr_001.csv", timestamp: "2026-04-05T00:00:00", evidence: "Telecom subscriber KYC form" },
      { source: "person_devendra", target: "account_apex", type: "OPERATES", confidence: 0.99, source_document: "tx_018.json", timestamp: "2026-04-10T10:00:00", evidence: "Authorized signatory on Hawala account" },
      { source: "person_devendra", target: "person_ramesh", type: "COORDINATES_WITH", confidence: 0.97, source_document: "fir_019.txt", timestamp: "2026-05-10T02:15:00", evidence: "Direct coordination for container clearance" },
      { source: "person_devendra", target: "person_victor", type: "CONTACTED", confidence: 0.96, source_document: "cdr_001.csv", timestamp: "2026-05-10T01:30:00", evidence: "Encrypted VoIP call during cargo dispatch" },
      { source: "person_ramesh", target: "phone_ramesh", type: "USES", confidence: 0.95, source_document: "cdr_001.csv", timestamp: "2026-04-01T00:00:00", evidence: "Telecom CAF verification" },
      { source: "person_ramesh", target: "veh_ramesh", type: "USES", confidence: 0.96, source_document: "anpr_toll.csv", timestamp: "2026-05-10T03:14:00", evidence: "ANPR camera log at Vashi Toll Gate" },
      { source: "person_ramesh", target: "loc_wh17", type: "TRAVELLED_TO", confidence: 0.98, source_document: "anpr_toll.csv", timestamp: "2026-05-10T03:45:00", evidence: "CCTV entry badge scan at gate" },
      { source: "person_ramesh", target: "account_ramesh", type: "OPERATES", confidence: 0.97, source_document: "tx_018.json", timestamp: "2026-05-11T09:30:00", evidence: "Beneficiary bank account" },
      { source: "account_apex", target: "account_ramesh", type: "TRANSFERRED_TO", confidence: 0.99, source_document: "tx_018.json", timestamp: "2026-05-11T10:00:00", evidence: "Hawala payoff INR 25,00,000 for clearance waiver" },
      { source: "person_tariq", target: "phone_tariq", type: "USES", confidence: 0.96, source_document: "cdr_001.csv", timestamp: "2026-05-01T00:00:00", evidence: "Burner SIM recovered from warehouse" },
      { source: "person_tariq", target: "phone_tariq_burner", type: "USES", confidence: 0.97, source_document: "cdr_001.csv", timestamp: "2026-05-08T00:00:00", evidence: "Secondary burner handset IMEI match" },
      { source: "person_tariq", target: "loc_wh17", type: "OPERATES_FROM", confidence: 0.99, source_document: "fir_019.txt", timestamp: "2026-05-10T02:00:00", evidence: "Warehouse manager lease agreement & biometric lock" },
      { source: "person_tariq", target: "person_imran", type: "COORDINATES_WITH", confidence: 0.94, source_document: "cdr_001.csv", timestamp: "2026-05-10T02:30:00", evidence: "24 rapid phone calls during offloading" },
      { source: "person_imran", target: "loc_wh17", type: "LOCATED_AT", confidence: 0.98, source_document: "fir_019.txt", timestamp: "2026-05-10T02:00:00", evidence: "Apprehended on site during Crime Branch raid" },
      { source: "person_zaid", target: "account_apex", type: "DEPOSITED_TO", confidence: 0.95, source_document: "tx_018.json", timestamp: "2026-05-09T16:00:00", evidence: "Cash smurfing deposit INR 18,50,000" },
      { source: "person_zaid", target: "veh_zaid", type: "USES", confidence: 0.93, source_document: "anpr_toll.csv", timestamp: "2026-05-10T03:15:10", evidence: "ANPR Convoy: Passed Vashi 70s after Ramesh" },
      { source: "veh_zaid", target: "loc_vashi_toll", type: "TRAVELLED_TO", confidence: 0.98, source_document: "anpr_toll.csv", timestamp: "2026-05-10T03:15:10", evidence: "Optical license plate camera log" },
      { source: "veh_ramesh", target: "loc_vashi_toll", type: "TRAVELLED_TO", confidence: 0.98, source_document: "anpr_toll.csv", timestamp: "2026-05-10T03:14:00", evidence: "Optical license plate camera log" },
      { source: "account_apex", target: "account_dubai", type: "TRANSFERRED_TO", confidence: 0.99, source_document: "tx_018.json", timestamp: "2026-05-08T18:00:00", evidence: "Offshore Hawala wire INR 2,40,00,000 to Gulf Horizon" },
      { source: "person_victor", target: "org_shell_dubai", type: "OWNS", confidence: 0.98, source_document: "fir_019.txt", timestamp: "2026-04-15T00:00:00", evidence: "Dubai Chamber of Commerce shareholding register" },
      { source: "person_suresh", target: "person_devendra", type: "COORDINATES_WITH", confidence: 0.91, source_document: "cdr_001.csv", timestamp: "2026-05-05T14:00:00", evidence: "Wholesale consignment distribution planning" },
      { source: "phone_devendra", target: "loc_colaba_tower", type: "LOCATED_AT", confidence: 0.95, source_document: "cdr_001.csv", timestamp: "2026-05-10T02:00:00", evidence: "Cellular base station ping during heist" }
    ]
  },
  'CASE-002': {
    nodes: [
      { id: "person_karan", type: "PERSON", label: "Karan Mehra", confidence: 0.98, attributes: { role: "Lead Exploit Developer / Trojan Admin" } },
      { id: "person_ananya", type: "PERSON", label: "Ananya Roy", confidence: 0.95, attributes: { role: "Money Mule Coordinator" } },
      { id: "person_vikram", type: "PERSON", label: "Vikram Malhotra", confidence: 0.97, attributes: { role: "Offshore Crypto Financier" } },
      { id: "person_rahul", type: "PERSON", label: "Rahul Verma", confidence: 0.91, attributes: { role: "Botnet Infrastructure Admin" } },
      { id: "loc_vault9", type: "LOCATION", label: "Server Vault 09, Bengaluru", confidence: 0.99, attributes: { lat: 12.9716, lng: 77.5946 } },
      { id: "account_monero", type: "ACCOUNT", label: "XMR-WALLET-8844", confidence: 0.99, attributes: { currency: "XMR" } }
    ],
    edges: [
      { source: "person_karan", target: "loc_vault9", type: "OPERATES_FROM", confidence: 0.99, source_document: "malware_report.pdf", timestamp: "2026-02-14T02:00:00", evidence: "SSH root key matched on C2 Command Server" },
      { source: "person_karan", target: "person_ananya", type: "COORDINATES_WITH", confidence: 0.96, source_document: "malware_report.pdf", timestamp: "2026-02-14T04:00:00", evidence: "Telegram handle 'CyberGh0st' money split messages" },
      { source: "person_ananya", target: "account_monero", type: "TRANSFERRED_TO", confidence: 0.98, source_document: "tx_mules.json", timestamp: "2026-02-15T11:00:00", evidence: "Cross-chain swap 14.5 BTC to privacy coin XMR" }
    ]
  },
  'CASE-003': {
    nodes: [
      { id: "person_captain_vlad", type: "PERSON", label: "Capt. Vladislav", confidence: 0.98, attributes: { role: "Vessel Captain / Arms Smuggler" } },
      { id: "person_salim", type: "PERSON", label: "Salim Ghouse", confidence: 0.96, attributes: { role: "Dock Pilot & Stevedore Boss" } },
      { id: "loc_kandla_port", type: "LOCATION", label: "Kandla Deep Sea Berth 04", confidence: 0.99, attributes: { lat: 23.0033, lng: 70.2194 } }
    ],
    edges: [
      { source: "person_captain_vlad", target: "loc_kandla_port", type: "TRAVELLED_TO", confidence: 0.99, source_document: "vessel_manifest.csv", timestamp: "2026-03-01T22:00:00", evidence: "Cargo vessel MV Sea Rover AIS transponder disabled" },
      { source: "person_captain_vlad", target: "person_salim", type: "COORDINATES_WITH", confidence: 0.97, source_document: "customs_intercept.pdf", timestamp: "2026-03-02T01:30:00", evidence: "VHF Channel 16 intercept: Coded offload instructions" }
    ]
  },
  'CASE-004': {
    nodes: [
      { id: "person_ghost", type: "PERSON", label: "Operator 'Phantom_404'", confidence: 0.97, attributes: { role: "Darknet Vendor Kingpin" } },
      { id: "person_neha", type: "PERSON", label: "Neha Singhania", confidence: 0.94, attributes: { role: "Dead-Drop Courier" } },
      { id: "loc_goa_beach", type: "LOCATION", label: "Anjuna Beach Safehouse, Goa", confidence: 0.99, attributes: { lat: 15.5733, lng: 73.7411 } }
    ],
    edges: [
      { source: "person_ghost", target: "person_neha", type: "DISPATCHED", confidence: 0.96, source_document: "telegram_export.json", timestamp: "2026-03-18T20:00:00", evidence: "PGP-encrypted GPS coordinates for coastal dead drop" },
      { source: "person_neha", target: "loc_goa_beach", type: "TRAVELLED_TO", confidence: 0.98, source_document: "darknet_memo.txt", timestamp: "2026-03-18T23:30:00", evidence: "Seized 4.2 kg synthetic narcotics in buried container" }
    ]
  },
  'CASE-005': {
    nodes: [
      { id: "person_sheikh_mansoor", type: "PERSON", label: "Sheikh Mansoor Al-Falasi", confidence: 0.99, attributes: { role: "Gold Smuggling Syndicate Head" } },
      { id: "person_fatima", type: "PERSON", label: "Fatima Noor", confidence: 0.97, attributes: { role: "Airport Air-Courier" } },
      { id: "loc_mumbai_airport", type: "LOCATION", label: "Chhatrapati Shivaji Maharaj Airport T2", confidence: 0.99, attributes: { lat: 19.0896, lng: 72.8656 } },
      { id: "loc_zaveri", type: "LOCATION", label: "Zaveri Bazaar Gold Refinery", confidence: 0.99, attributes: { lat: 18.9508, lng: 72.8317 } }
    ],
    edges: [
      { source: "person_sheikh_mansoor", target: "person_fatima", type: "DISPATCHED", confidence: 0.97, source_document: "fir_falcon_01.txt", timestamp: "2026-04-05T14:00:00", evidence: "Flight Emirates EK-504 ticket manifest booked by FZE account" },
      { source: "person_fatima", target: "loc_mumbai_airport", type: "INTERCEPTED_AT", confidence: 0.99, source_document: "fir_falcon_01.txt", timestamp: "2026-04-05T20:30:00", evidence: "Customs green channel search: 8.5 kg 24K gold paste seized" }
    ]
  }
};

export const OFFLINE_ANALYTICS: Record<string, AnalyticsResponse> = {
  'CASE-001': {
    centrality: {
      degree_centrality: { person_devendra: 0.85, person_ramesh: 0.72, person_tariq: 0.68, account_apex: 0.65, loc_wh17: 0.58 },
      betweenness_centrality: { person_devendra: 0.62, person_ramesh: 0.48, person_tariq: 0.41, account_apex: 0.35 },
      pagerank: { person_devendra: 0.18, person_ramesh: 0.14, person_tariq: 0.12, account_apex: 0.11 }
    },
    communities: [
      { community_id: 0, members: ["person_devendra", "account_apex", "org_apex", "account_dubai", "person_victor", "phone_devendra"] },
      { community_id: 1, members: ["person_ramesh", "veh_ramesh", "account_ramesh", "loc_vashi_toll", "phone_ramesh"] },
      { community_id: 2, members: ["person_tariq", "person_imran", "loc_wh17", "phone_tariq", "phone_tariq_burner"] }
    ],
    top_key_players: [
      { id: "person_devendra", label: "Devendra Sharma", type: "PERSON", composite_score: 0.98, degree_centrality: 0.85, betweenness_centrality: 0.62, pagerank: 0.18 },
      { id: "person_ramesh", label: "Ramesh Kumar", type: "PERSON", composite_score: 0.88, degree_centrality: 0.72, betweenness_centrality: 0.48, pagerank: 0.14 },
      { id: "person_tariq", label: "Tariq Ahmed", type: "PERSON", composite_score: 0.82, degree_centrality: 0.68, betweenness_centrality: 0.41, pagerank: 0.12 }
    ]
  }
};

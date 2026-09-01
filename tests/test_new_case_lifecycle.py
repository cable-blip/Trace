import urllib.request
import json

BASE = 'http://127.0.0.1:8000/api'

def run():
    # 1. Create a brand new case: 'Operation Tiger Claw'
    create_url = BASE + '/cases?name=Operation+Tiger+Claw&description=Cross-Border+Arms+and+Narcotics+Nexus'
    req = urllib.request.Request(create_url, method='POST')
    with urllib.request.urlopen(req) as res:
        new_case = json.loads(res.read().decode())
        new_case_id = new_case['id']
        print('[STEP 1] Created New Case:', new_case_id, new_case['name'])

    # 2. Check graph for new case: must be 0 nodes!
    with urllib.request.urlopen(BASE + '/cases/' + new_case_id + '/graph') as res:
        g = json.loads(res.read().decode())
        print('[STEP 2] Initial Graph Status:', len(g['nodes']), 'nodes (clean state)')

    # 3. Upload a realistic police FIR document with real suspect names, phones, accounts, vehicles
    fir_text = """FIRST INFORMATION REPORT (FIR No. 402/2026)
Special Crime Branch, Panvel Terminal.
Suspect Rajesh Goud operates covert hawala fund routing through ACC-992211.
He was intercepted using communication terminal +919876543210 contacting Suspect Harmeet Singh.
Vehicle MH-04-AB-1234 was identified transporting illegal consignments to Warehouse 9 at Panvel.
Suspect Rajesh Goud transferred INR 45,00,000 to ACC-992211 for logistics dispatch."""

    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        '--' + boundary + '\r\n'
        'Content-Disposition: form-data; name=file; filename=fir_panvel_402.txt\r\n'
        'Content-Type: text/plain\r\n\r\n'
        + fir_text + '\r\n'
        '--' + boundary + '--\r\n'
    ).encode('utf-8')

    upload_req = urllib.request.Request(
        BASE + '/cases/' + new_case_id + '/documents',
        data=body,
        headers={'Content-Type': 'multipart/form-data; boundary=' + boundary},
        method='POST'
    )
    with urllib.request.urlopen(upload_req) as res:
        doc = json.loads(res.read().decode())
        print('[STEP 3] Uploaded Document:', doc['filename'])

    # 4. Trigger Universal Ingestion & Entity Resolution
    ingest_req = urllib.request.Request(BASE + '/cases/' + new_case_id + '/ingest', method='POST')
    with urllib.request.urlopen(ingest_req) as res:
        ingested_g = json.loads(res.read().decode())
        print('[STEP 4] Ingestion Result: Extracted', len(ingested_g['nodes']), 'nodes and', len(ingested_g['edges']), 'edges:')
        for n in ingested_g['nodes']:
            print('  * [' + n['type'] + '] ' + n['label'])

    # 5. Run the Police Solutions Engine on the ingested case
    with urllib.request.urlopen(BASE + '/cases/' + new_case_id + '/police-solutions') as res:
        sol = json.loads(res.read().decode())
        print('[STEP 5] Police Tactical Solutions Generated on Ingested Data:')
        print('  - Status:', sol['status'])
        print('  - Total HVTs:', len(sol['hvt_priority_targets']))
        for h in sol['hvt_priority_targets']:
            print('  * HVT:', h['target_name'], '| Role:', h['operational_role'], '| Guilt:', str(h['culpability_score']) + '%')
            print('    Action Directive:', h['action_directive'])
            print('    Statutory Penal Sections:', h['applicable_statutory_sections'])

    # 6. Test Delete Case: clean up the test case
    del_req = urllib.request.Request(BASE + '/cases/' + new_case_id, method='DELETE')
    with urllib.request.urlopen(del_req) as res:
        del_res = json.loads(res.read().decode())
        print('[STEP 6] Case Expunged:', del_res['message'])

if __name__ == '__main__':
    run()

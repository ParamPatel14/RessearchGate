import requests
import sys
import json

BASE_URL = "http://localhost:8000"

def get_headers(token):
    return {"Authorization": f"Bearer {token}"}

def register_or_login(email, password, role, name):
    print(f"Authenticating {role} ({email})...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "role": role,
            "name": name
        })
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server.")
        sys.exit(1)
    
    if resp.status_code == 201 or (resp.status_code == 400 and "already registered" in resp.text):
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        if resp.status_code == 200:
            token = resp.json()["access_token"]
            user_resp = requests.get(f"{BASE_URL}/users/me", headers=get_headers(token))
            return token, user_resp.json()["id"]
    
    print(f"Auth failed for {email}: {resp.text}")
    sys.exit(1)

def run_tests():
    # 1. Auth
    mentor_token, mentor_id = register_or_login("mentor_phase7@test.com", "pass123", "mentor", "Mentor 7")
    student_token, student_id = register_or_login("student_phase7@test.com", "pass123", "student", "Student 7")
    
    print("\n--- PHASE 7 TESTS ---")

    # 2. Create Grant Opportunity
    print("Creating Grant Opportunity...")
    opp_resp = requests.post(f"{BASE_URL}/opportunities/", headers=get_headers(mentor_token), json={
        "title": "NSF Research Grant Collab",
        "description": "Collaborate on NSF proposal",
        "type": "grant_collaboration",
        "requirements": "Strong writing skills",
        "funding_amount": 5000.00,
        "currency": "USD",
        "grant_agency": "NSF"
    })
    
    if opp_resp.status_code in [200, 201]:
        opp_id = opp_resp.json()["id"]
        print(f"Grant Opportunity Created: ID {opp_id} (${opp_resp.json()['funding_amount']})")
    else:
        print(f"Failed to create grant: {opp_resp.text}")
        sys.exit(1)

    # 3. Generate Certificate (Mentor)
    print("Generating Certificate...")
    cert_resp = requests.post(f"{BASE_URL}/certificates/generate", headers=get_headers(mentor_token), json={
        "student_id": student_id,
        "opportunity_id": opp_id
    })
    
    if cert_resp.status_code == 200:
        cert_data = cert_resp.json()
        print(f"Certificate Generated: UUID {cert_data['uuid']}")
        
        # Verify Certificate (Public)
        verify_resp = requests.get(f"{BASE_URL}/certificates/{cert_data['uuid']}")
        if verify_resp.status_code == 200:
            print("Certificate Verified.")
        else:
            print(f"Certificate Verification Failed: {verify_resp.text}")
    else:
        print(f"Failed to generate certificate: {cert_resp.text}")

    # 4. Analytics
    print("Fetching Analytics...")
    analytics_resp = requests.get(f"{BASE_URL}/analytics/dashboard", headers=get_headers(mentor_token))
    if analytics_resp.status_code == 200:
        data = analytics_resp.json()
        print(f"Analytics: {data['users']['students']} Students, ${data['funding']['total_committed']} Funding")
    else:
        print(f"Failed to fetch analytics: {analytics_resp.text}")

    # 5. Language Tools
    print("Testing Language Tool...")
    tool_resp = requests.post(f"{BASE_URL}/tools/refine", json={
        "text": "This is a good project."
    })
    if tool_resp.status_code == 200:
        res = tool_resp.json()
        print(f"Refinement: '{res['original']}' -> '{res['refined']}'")
    else:
        print(f"Tool failed: {tool_resp.text}")

    print("\nPhase 7 Tests Completed.")

if __name__ == "__main__":
    run_tests()

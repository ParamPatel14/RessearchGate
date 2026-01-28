import requests
import sys
import json
import time

BASE_URL = "http://localhost:8000"

def get_headers(token):
    return {"Authorization": f"Bearer {token}"}

def register_or_login(email, password, role, name):
    print(f"Authenticating {role} ({email})...")
    # Try Register
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "role": role,
            "name": name
        })
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
        sys.exit(1)
    
    if resp.status_code == 201:
        print(f"Registered {role}.")
        # Login to get token
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        token = resp.json()["access_token"]
        # Get ID
        resp = requests.get(f"{BASE_URL}/users/me", headers=get_headers(token))
        return token, resp.json()["id"]
    elif resp.status_code == 400 and "already registered" in resp.text:
        print(f"User already exists. Logging in...")
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        if resp.status_code != 200:
            print(f"Login failed: {resp.text}")
            sys.exit(1)
        token = resp.json()["access_token"]
        # Get ID
        resp = requests.get(f"{BASE_URL}/users/me", headers=get_headers(token))
        return token, resp.json()["id"]
    else:
        print(f"Registration failed: {resp.text}")
        sys.exit(1)

def run_tests():
    # 1. Auth
    mentor_token, mentor_id = register_or_login("mentor_56@test.com", "password123", "mentor", "Mentor Test")
    student_token, student_id = register_or_login("student_56@test.com", "password123", "student", "Student Test")
    
    print("-" * 20)
    print("PHASE 5 TESTS")
    print("-" * 20)

    # 2. Create Opportunity (Mentor)
    print("Creating Opportunity...")
    opp_resp = requests.post(f"{BASE_URL}/opportunities/", headers=get_headers(mentor_token), json={
        "title": "Phase 5 Research Opp",
        "description": "Test description",
        "requirements": "Python",
        "type": "research_assistant",
        "is_open": True
    })
    
    if opp_resp.status_code in [200, 201]:
        opp_id = opp_resp.json()["id"]
        print(f"Opportunity Created: ID {opp_id}")
    else:
        print(f"Failed to create opportunity: {opp_resp.text}")
        # Try to find an existing one
        opps = requests.get(f"{BASE_URL}/opportunities/", headers=get_headers(mentor_token)).json()
        if opps:
            opp_id = opps[0]['id']
            print(f"Using existing opportunity: ID {opp_id}")
        else:
            print("No opportunities available. Exiting.")
            sys.exit(1)

    # 3. Create Research Project (Mentor)
    print("Creating Research Project...")
    proj_resp = requests.post(f"{BASE_URL}/research/", headers=get_headers(mentor_token), json={
        "title": "Test Research Project",
        "student_id": student_id,
        "opportunity_id": opp_id
    })
    if proj_resp.status_code == 200:
        print("Research Project Created.")
        project_id = proj_resp.json()["id"]
    else:
        print(f"Failed to create project: {proj_resp.text}")
        # Continue anyway

    # 4. Create Assignment (Mentor)
    print("Creating Assignment...")
    assign_resp = requests.post(f"{BASE_URL}/assignments/", headers=get_headers(mentor_token), json={
        "title": "Test Assignment 1",
        "description": "Do the work",
        "type": "code",
        "opportunity_id": opp_id
    })
    if assign_resp.status_code == 200:
        print("Assignment Created.")
        assign_id = assign_resp.json()["id"]
    else:
        print(f"Failed to create assignment: {assign_resp.text}")
        sys.exit(1)

    # 5. Submit Assignment (Student)
    print("Submitting Assignment...")
    sub_resp = requests.post(f"{BASE_URL}/assignments/{assign_id}/submit", headers=get_headers(student_token), json={
        "content": "print('Hello World')",
        "file_url": "http://github.com/test/repo"
    })
    if sub_resp.status_code == 200:
        print("Assignment Submitted.")
        submission_id = sub_resp.json()["id"]
    else:
        print(f"Failed to submit: {sub_resp.text}")
        sys.exit(1)

    # 6. Grade Submission (Mentor)
    print("Grading Submission...")
    grade_resp = requests.post(f"{BASE_URL}/assignments/submissions/{submission_id}/grade", headers=get_headers(mentor_token), json={
        "grade": 95.5,
        "feedback": "Great job!",
        "rubric_scores": "{'clarity': 10}"
    })
    if grade_resp.status_code == 200:
        print("Submission Graded.")
    else:
        print(f"Failed to grade: {grade_resp.text}")
        sys.exit(1)

    print("-" * 20)
    print("PHASE 6 TESTS")
    print("-" * 20)

    # 7. Send Message (Student -> Mentor)
    print("Sending Message...")
    msg_resp = requests.post(f"{BASE_URL}/comm/messages/", headers=get_headers(student_token), json={
        "receiver_id": mentor_id,
        "content": "Hello Mentor, I finished the work."
    })
    if msg_resp.status_code == 200:
        print("Message Sent.")
    else:
        print(f"Failed to send message: {msg_resp.text}")
        print(f"URL: {msg_resp.url}")
        sys.exit(1)

    # 8. Get Messages (Mentor)
    print("Retrieving Messages...")
    msgs_resp = requests.get(f"{BASE_URL}/comm/messages/{student_id}", headers=get_headers(mentor_token))
    if msgs_resp.status_code == 200:
        msgs = msgs_resp.json()
        print(f"Messages retrieved: {len(msgs)}")
        found = any(m["content"] == "Hello Mentor, I finished the work." for m in msgs)
        if found:
            print("Message verification successful.")
        else:
            print("Message not found in history.")
    else:
        print(f"Failed to get messages: {msgs_resp.text}")

    # 9. Schedule Meeting (Mentor)
    print("Scheduling Meeting...")
    meet_resp = requests.post(f"{BASE_URL}/comm/meetings/", headers=get_headers(mentor_token), json={
        "attendee_id": student_id,
        "title": "Weekly Sync",
        "start_time": "2025-12-01T10:00:00",
        "end_time": "2025-12-01T11:00:00",
        "link": "http://zoom.us/j/123456"
    })
    if meet_resp.status_code == 200:
        print("Meeting Scheduled.")
    else:
        print(f"Failed to schedule meeting: {meet_resp.text}")

    # 10. Create Reference (Mentor)
    print("Creating Reference...")
    ref_resp = requests.post(f"{BASE_URL}/references/", headers=get_headers(mentor_token), json={
        "student_id": student_id,
        "content": "This student is brilliant."
    })
    if ref_resp.status_code == 200:
        print("Reference Created.")
    else:
        print(f"Failed to create reference: {ref_resp.text}")

    print("\nAll Tests Completed Successfully.")

if __name__ == "__main__":
    run_tests()

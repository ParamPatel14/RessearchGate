from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import models
from app.core.security import hash_password
import sys

def seed_mentors():
    db = SessionLocal()
    
    mentors_data = [
        # Industry Mentor 1: Deep Shah
        {
            "name": "Deep Shah",
            "email": "deep.shah@google.com",
            "password": "Password123!",
            "role": "mentor",
            "profile": {
                "mentor_type": "industry_mentor",
                "company": "Google",
                "position": "Senior Software Engineer",
                "research_areas": "Distributed Systems, Scalability, Search Algorithms, C++, Python",
                "bio": "Senior Software Engineer at Google with 7+ years of experience in distributed systems and AI-driven search algorithms. I have interviewed over 100 candidates for internships and full-time roles. I can help with system design, coding interviews, and resume reviews.",
                "website_url": "https://linkedin.com/in/deepshah-demo",
                "lab_size": 0,
                "time_commitment": "5 hrs/week",
                "application_requirements": "Resume, GitHub Profile, LeetCode Profile",
                "accepting_phd_students": "No",
                "funding_available": "No",
                "is_verified": True,
                "outcome_count": 15,
                "reputation_score": 4.9,
                "preferred_backgrounds": "Computer Science, Software Engineering",
                "min_expectations": "Strong Data Structures & Algorithms knowledge, Proficiency in C++ or Java"
            },
            "publications": [],
            "trends": []
        },
        # Industry Mentor 2: Sarah Jenkins (Recruiter/Hiring Manager perspective)
        {
            "name": "Sarah Jenkins",
            "email": "sarah.jenkins@microsoft.com",
            "password": "Password123!",
            "role": "mentor",
            "profile": {
                "mentor_type": "industry_mentor",
                "company": "Microsoft",
                "position": "University Recruiting Manager",
                "research_areas": "Career Development, Interview Prep, Resume Building, Soft Skills",
                "bio": "University Recruiting Manager at Microsoft. I specialize in early-career talent acquisition and have a passion for helping students land their dream internships. I provide guidance on navigating the recruitment process, behavioral interviews, and negotiating offers.",
                "website_url": "https://careers.microsoft.com",
                "lab_size": 0,
                "time_commitment": "3 hrs/week",
                "application_requirements": "Resume, Cover Letter",
                "accepting_phd_students": "No",
                "funding_available": "No",
                "is_verified": True,
                "outcome_count": 42,
                "reputation_score": 4.8,
                "preferred_backgrounds": "Any Engineering Discipline, Business, Marketing",
                "min_expectations": "Strong communication skills, Leadership experience, Passion for technology"
            },
            "publications": [],
            "trends": []
        },
        # PhD Supervisor 1: Dr. Andrew Ng
        {
            "name": "Dr. Andrew Ng",
            "email": "andrew.ng@stanford.edu",
            "password": "Password123!",
            "role": "mentor",
            "profile": {
                "mentor_type": "academic_supervisor",
                "university": "Stanford University",
                "lab_name": "Stanford AI Lab (SAIL)",
                "position": "Adjunct Professor",
                "research_areas": "Machine Learning, Deep Learning, Robotics, AI in Healthcare",
                "bio": "Co-founder of Coursera, Adjunct Professor at Stanford University, and former head of Google Brain and Baidu AI Group. My research focuses on deep learning, reinforcement learning, and AI applications in healthcare and education.",
                "website_url": "https://www.andrewng.org",
                "lab_size": 25,
                "time_commitment": "40 hrs/week",
                "application_requirements": "CV, Statement of Purpose, 3 Letters of Recommendation, Transcripts",
                "accepting_phd_students": "Yes",
                "funding_available": "Yes",
                "research_methodology": "Computational & Experimental",
                "mentorship_style": "High Expectations, Visionary",
                "alumni_placement": "Google Brain, OpenAI, DeepMind, Tesla AI",
                "preferred_backgrounds": "Computer Science, Mathematics, Statistics",
                "min_expectations": "Strong Math Background, Python/PyTorch Proficiency, Published 1-2 workshop papers",
                "is_verified": True,
                "outcome_count": 85,
                "reputation_score": 5.0
            },
            "publications": [
                {
                    "title": "Latent Dirichlet Allocation",
                    "journal_conference": "Journal of Machine Learning Research (JMLR)",
                    "publication_date": "2003-01-01",
                    "url": "https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf",
                    "description": "We describe latent Dirichlet allocation (LDA), a generative probabilistic model for collections of discrete data such as text corpora."
                },
                {
                    "title": "Building High-level Features Using Large Scale Unsupervised Learning",
                    "journal_conference": "ICML",
                    "publication_date": "2012-06-01",
                    "url": "https://arxiv.org/abs/1112.6209",
                    "description": "The 'Cat Neuron' paper. We present a framework for large-scale unsupervised learning using a distributed CPU cluster."
                }
            ],
            "trends": [
                {"topic": "Deep Learning", "status": "Stable", "count": 120, "last_active": 2024},
                {"topic": "AI in Education", "status": "Rising", "count": 45, "last_active": 2025},
                {"topic": "Medical Imaging", "status": "Rising", "count": 30, "last_active": 2024}
            ]
        },
        # PhD Supervisor 2: Dr. Fei-Fei Li
        {
            "name": "Dr. Fei-Fei Li",
            "email": "feifei.li@stanford.edu",
            "password": "Password123!",
            "role": "mentor",
            "profile": {
                "mentor_type": "academic_supervisor",
                "university": "Stanford University",
                "lab_name": "Stanford Vision and Learning Lab (SVL)",
                "position": "Professor",
                "research_areas": "Computer Vision, Cognitive Neuroscience, Ambient Intelligence",
                "bio": "Professor of Computer Science at Stanford University, Co-Director of Stanford's Human-Centered AI Institute. Creator of ImageNet. Research interests include cognitively inspired AI, machine learning, deep learning, computer vision and AI for healthcare.",
                "website_url": "https://profiles.stanford.edu/fei-fei-li",
                "lab_size": 30,
                "time_commitment": "40 hrs/week",
                "application_requirements": "CV, Research Statement, GitHub, Publications",
                "accepting_phd_students": "Maybe",
                "funding_available": "Yes",
                "research_methodology": "Experimental & Data-Driven",
                "mentorship_style": "Supportive, Collaborative",
                "alumni_placement": "Stanford Faculty, Princeton, Apple, Meta AI",
                "preferred_backgrounds": "CS, Cognitive Science, Neuroscience",
                "min_expectations": "Experience with Vision Transformers, PyTorch, Large Scale Datasets",
                "is_verified": True,
                "outcome_count": 60,
                "reputation_score": 5.0
            },
            "publications": [
                {
                    "title": "ImageNet: A Large-Scale Hierarchical Image Database",
                    "journal_conference": "CVPR",
                    "publication_date": "2009-06-20",
                    "url": "https://ieeexplore.ieee.org/document/5206848",
                    "description": "We offer ImageNet, a large-scale ontology of images built upon the backbone of the WordNet structure."
                }
            ],
            "trends": [
                {"topic": "Computer Vision", "status": "Stable", "count": 200, "last_active": 2025},
                {"topic": "Ambient Intelligence", "status": "Rising", "count": 50, "last_active": 2024},
                {"topic": "Cognitive AI", "status": "Stable", "count": 80, "last_active": 2023}
            ]
        },
        # PhD Supervisor 3: Dr. Yoshua Bengio
        {
            "name": "Dr. Yoshua Bengio",
            "email": "yoshua.bengio@mila.quebec",
            "password": "Password123!",
            "role": "mentor",
            "profile": {
                "mentor_type": "academic_supervisor",
                "university": "University of Montreal / Mila",
                "lab_name": "Mila - Quebec AI Institute",
                "position": "Professor",
                "research_areas": "Deep Learning, Neural Networks, Causal Inference, AI Safety",
                "bio": "Professor at the Department of Computer Science and Operations Research at the Université de Montréal. Founder and Scientific Director of Mila. Recipient of the A.M. Turing Award. Focused on understanding the principles of learning that yield intelligence.",
                "website_url": "https://yoshuabengio.org",
                "lab_size": 40,
                "time_commitment": "20 hrs/week",
                "application_requirements": "Strong Math/Stats background, Previous Deep Learning research",
                "accepting_phd_students": "Yes",
                "funding_available": "Yes",
                "research_methodology": "Theoretical & Mathematical",
                "mentorship_style": "Intellectually Challenging, Hands-off",
                "alumni_placement": "Google Brain, Facebook AI Research, DeepMind, University Faculty",
                "preferred_backgrounds": "Mathematics, Physics, Computer Science",
                "min_expectations": "Mastery of Probability Theory, Linear Algebra, Optimization",
                "is_verified": True,
                "outcome_count": 120,
                "reputation_score": 5.0
            },
            "publications": [
                {
                    "title": "Deep Learning",
                    "journal_conference": "Nature",
                    "publication_date": "2015-05-27",
                    "url": "https://www.nature.com/articles/nature14539",
                    "description": "Deep learning allows computational models that are composed of multiple processing layers to learn representations of data with multiple levels of abstraction."
                },
                {
                    "title": "Generative Adversarial Nets",
                    "journal_conference": "NIPS",
                    "publication_date": "2014-12-01",
                    "url": "https://papers.nips.cc/paper/5423-generative-adversarial-nets",
                    "description": "We propose a new framework for estimating generative models via an adversarial process."
                }
            ],
            "trends": [
                {"topic": "Causal Inference", "status": "Rising", "count": 60, "last_active": 2025},
                {"topic": "Deep Learning", "status": "Stable", "count": 300, "last_active": 2024},
                {"topic": "AI Safety", "status": "Rising", "count": 25, "last_active": 2025}
            ]
        }
    ]

    print("Seeding Mentors...")
    for data in mentors_data:
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == data["email"]).first()
        
        if not user:
            print(f"Creating user: {data['name']}")
            user = models.User(
                email=data["email"],
                name=data["name"],
                password_hash=hash_password(data["password"]),
                role=data["role"],
                is_active=True,
                provider="local"
            )
            db.add(user)
            db.flush()
        else:
            print(f"Updating user: {data['name']}")
            user.role = "mentor"
            user.password_hash = hash_password(data["password"])
        
        # Create or Update Profile
        profile = db.query(models.MentorProfile).filter(models.MentorProfile.user_id == user.id).first()
        if not profile:
            profile = models.MentorProfile(user_id=user.id)
            db.add(profile)
            db.flush()
        
        # Update Profile Fields
        for key, value in data["profile"].items():
            setattr(profile, key, value)
            
        # Handle Publications
        # First, remove existing to avoid duplicates or complex merging for this seed script
        db.query(models.Publication).filter(models.Publication.mentor_profile_id == profile.id).delete()
        
        for pub_data in data["publications"]:
            pub = models.Publication(
                mentor_profile_id=profile.id,
                **pub_data
            )
            db.add(pub)
            
        # Handle Trends (Phase 3)
        if "trends" in data:
            # Clear existing trends
            db.query(models.MentorTopicTrend).filter(models.MentorTopicTrend.mentor_id == profile.id).delete()
            
            for trend_data in data["trends"]:
                # Check if topic exists
                topic = db.query(models.ResearchTopic).filter(models.ResearchTopic.name == trend_data["topic"]).first()
                if not topic:
                    topic = models.ResearchTopic(name=trend_data["topic"])
                    db.add(topic)
                    db.flush()
                
                trend = models.MentorTopicTrend(
                    mentor_id=profile.id,
                    topic_id=topic.id,
                    trend_status=trend_data["status"],
                    total_count=trend_data["count"],
                    last_active_year=trend_data["last_active"]
                )
                db.add(trend)

        db.commit()
        print(f"  - Profile updated for {data['name']}")

    db.close()
    print("Seeding Complete!")
    print("\nCredentials:")
    for data in mentors_data:
        print(f"Email: {data['email']} | Password: {data['password']}")

if __name__ == "__main__":
    seed_mentors()
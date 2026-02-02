from app.db.database import SessionLocal
from app.db.models import User, Opportunity
from datetime import datetime, timedelta

def seed_opportunities():
    db = SessionLocal()
    
    mentors = db.query(User).filter(User.role == "mentor").all()
    
    # Domain mappings for realistic data
    mentor_domains = {
        "Dr. Fei-Fei Li": {
            "domain": "Computer Vision",
            "topics": ["Visual Intelligence", "Human-centered AI", "Deep Learning for Vision", "Ambient Intelligence"],
            "lab": "Stanford Vision and Learning Lab"
        },
        "Dr. Andrew Ng": {
            "domain": "Machine Learning",
            "topics": ["AI for Healthcare", "Machine Learning Education", "Deep Learning Fundamentals", "AI Strategy"],
            "lab": "Stanford ML Group"
        },
        "Dr. Yoshua Bengio": {
            "domain": "Deep Learning",
            "topics": ["Causal Representation Learning", "Consciousness Priors", "Deep Generative Models", "Recurrent Neural Networks"],
            "lab": "Mila - Quebec AI Institute"
        },
        "Dr. David J. Malan": {
            "domain": "CS Education",
            "topics": ["Pedagogy in CS", "Scalable Education Tools", "Cloud-based Learning Environments", "Introductory CS Curriculum"],
            "lab": "Harvard CS50"
        },
        "Naveed Ahmed": {
            "domain": "Cloud Computing",
            "topics": ["Serverless Architectures", "Distributed Systems", "Cloud Security", "High Availability Systems"],
            "lab": "Amazon Web Services"
        },
        "Deep Shah": {
            "domain": "Search Algorithms",
            "topics": ["Information Retrieval", "Ranking Algorithms", "Large Scale Data Processing", "Knowledge Graphs"],
            "lab": "Google Search Team"
        },
        "Sarah Jenkins": {
            "domain": "Enterprise Software",
            "topics": ["Cloud Infrastructure", "Enterprise AI Solutions", "DevOps Best Practices", "Microservices"],
            "lab": "Microsoft Azure"
        }
    }
    
    generic_domains = [
        {"domain": "Software Engineering", "topics": ["Web Development", "Mobile Apps", "System Design"]},
        {"domain": "Data Science", "topics": ["Data Visualization", "Big Data Analytics", "Predictive Modeling"]}
    ]

    for mentor in mentors:
        print(f"Processing mentor: {mentor.name} (ID: {mentor.id})")
        
        # Get domain info
        domain_info = mentor_domains.get(mentor.name)
        if not domain_info:
            # Assign generic based on ID parity
            domain_info = generic_domains[mentor.id % len(generic_domains)]
            domain_info["lab"] = f"{mentor.name}'s Research Lab"
            
        # Check existing opportunities
        existing_opps = db.query(Opportunity).filter(Opportunity.mentor_id == mentor.id).all()
        phd_count = len([o for o in existing_opps if o.type == "phd_guidance"])
        intern_count = len([o for o in existing_opps if o.type == "internship"])
        
        print(f"  Existing - PhD: {phd_count}, Internship: {intern_count}")
        
        # Seed PhD Guidance (Target: 2)
        required_phd = 2 - phd_count
        for i in range(required_phd):
            topic = domain_info["topics"][i % len(domain_info["topics"])]
            title = f"PhD Guidance: {topic}"
            desc = (f"Seeking motivated PhD candidates to research {topic} at {domain_info['lab']}. "
                   f"Focus on novel approaches and publication in top-tier conferences. "
                   f"Candidates should have strong background in {domain_info['domain']}.")
            
            opp = Opportunity(
                mentor_id=mentor.id,
                title=title,
                description=desc,
                type="phd_guidance",
                requirements=f"Strong math background, Python, {domain_info['domain']} knowledge",
                is_open=True,
                deadline=datetime.utcnow() + timedelta(days=90),
                total_slots=1
            )
            db.add(opp)
            print(f"  Added PhD Opp: {title}")
            
        # Seed Internship (Target: 1)
        # Only add if 0, or if we want to ensure at least 1 (user said "reduce the Count of Internships", so 1 is good)
        if intern_count < 1:
            topic = domain_info["topics"][-1] # Use last topic
            title = f"{domain_info['domain']} Research Intern"
            desc = (f"Summer internship opportunity at {domain_info['lab']}. "
                   f"Work on cutting-edge {topic} projects. "
                   f"Great opportunity for undergrads/masters students.")
            
            opp = Opportunity(
                mentor_id=mentor.id,
                title=title,
                description=desc,
                type="internship",
                requirements=f"Python, C++, Basic {domain_info['domain']}",
                is_open=True,
                deadline=datetime.utcnow() + timedelta(days=60),
                total_slots=2
            )
            db.add(opp)
            print(f"  Added Internship: {title}")
            
    db.commit()
    print("Seeding completed.")

if __name__ == "__main__":
    seed_opportunities()

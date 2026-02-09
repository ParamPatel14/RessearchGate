# ResearchMatch - Deep Academia Platform

**ResearchMatch** is a comprehensive platform designed to bridge the gap between students and academic research opportunities. Built with a "Deep Academia" aesthetic (Ivy League Modern), it facilitates intelligent connections between students, mentors, and research labs using advanced AI matching, research intelligence, and streamlined application workflows.

## Key Features

###  Student Portal
*   **Smart Profile:** Comprehensive profile management including academic stats, skills, publications, and resume parsing.
*   **AI-Powered Matching:** "Smart Match" system uses a 3-Lens Architecture (Domain Filtering, Semantic Similarity, Profile Alignment) to recommend the best mentors and opportunities.
*   **Research Intelligence:**
    *   **Gap Discovery:** AI-driven analysis to identify research gaps in specific domains.
    *   **Proposal Guidance:** Structured assistance for drafting PhD proposals (Direction, Talking Points, Readiness Check).
*   **Opportunity Browsing:** Filter and search for Internships, PhD positions, and Grants.
*   **Real World & Beehive:** Access to Industrial Visits, "Honey Bee" mentorship events, and real-world projects.
*   **Application Management:** Track status of applications (Pending, Accepted, Rejected).

### 👨‍🏫 Mentor Portal
*   **Lab Management:** Showcase research methodology, mentorship style, and alumni placements.
*   **Opportunity Posting:** Create and manage research positions with detailed requirements.
*   **Application Review:** Review student applications with AI-enhanced insights (Match Score, Gap Analysis).
*   **Analytics:** Dashboard for tracking profile views and application statistics.

### 🛡️ Admin Portal
*   **System Overview:** centralized dashboard for managing users and platform content.
*   **Event Management:** Create and manage Beehive Events and Industrial Visits.
*   **Certificate Verification:** Generate and verify certificates for completed projects.

### 🤖 AI & Intelligence
*   **Gemini Integration:** Powered by Google Gemini for semantic embeddings, resume parsing, and content generation.
*   **3-Lens Matching Engine:** Sophisticated algorithm for high-quality student-mentor pairing.
*   **Resume Scoring:** Automated scoring of resumes against opportunity requirements.

### 💬 Communication
*   **WhatsApp Integration:** Twilio-powered notifications and updates.
*   **Meeting Scheduler:** Integrated tools for scheduling mentorship sessions.

##  Tech Stack

### Backend
*   **Framework:** FastAPI (Python)
*   **Database:** PostgreSQL (via SQLAlchemy ORM)
*   **AI/ML:** Google Generative AI (Gemini), Pandas, Scikit-learn (for similarity)
*   **Authentication:** JWT (Python-Jose), OAuth (Google/GitHub)
*   **Tools:** Pydantic, Uvicorn, Twilio SDK

### Frontend
*   **Framework:** React 19 (Vite)
*   **Styling:** TailwindCSS 4 (Deep Academia Theme)
*   **UI Components:** Framer Motion (Animations), React Icons, Lucide React
*   **Visualization:** Recharts (Analytics), React Three Fiber (3D Elements)
*   **State/Routing:** React Router DOM, Context API

## 🚀 Installation & Setup

### Prerequisites
*   Python 3.9+
*   Node.js 18+
*   PostgreSQL (or configured for SQLite)
*   Google Gemini API Key
*   Twilio Account (Optional, for SMS/WhatsApp)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

**Environment Configuration:**
Create a `.env` file in the `backend` directory with the following variables:
```env
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_EMAIL=admin@example.com
DATABASE_URL=postgresql://user:password@localhost/dbname
# Or for SQLite: sqlite:///./sql_app.db

# OAuth (Optional for local dev if not using login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=your_twilio_number
TWILIO_CONTACT_NUMBER=your_contact_number
```

**Initialize Database & Seed Data:**
```bash
# Create tables
python init_db.py

# Seed initial data (Mentors, Internships, Real World Events)
python seed_mentors.py
python seed_internships.py
python seed_realworld.py
```

Run the Server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the Development Server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```
c:\Projects\Project 1\
├── backend/
│   ├── app/
│   │   ├── api/          # API Endpoints (Auth, AI, Opportunities, etc.)
│   │   ├── core/         # Config & Security
│   │   ├── db/           # Database Models & Session
│   │   ├── services/     # Business Logic (Matching, Research, AI)
│   │   └── main.py       # App Entry Point
│   ├── init_db.py        # DB Initialization Script
│   ├── seed_*.py         # Data Seeding Scripts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI Components
│   │   ├── context/      # Auth & Global State
│   │   ├── pages/        # Main Page Views
│   │   ├── App.jsx       # Root Component
│   │   └── main.jsx      # Entry Point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🧠 Workflows

### 1. Smart Matching
The platform uses a unique **3-Lens Architecture** to match students with mentors:
1.  **Domain Filtering:** Hard filters based on research interests and fields.
2.  **Semantic Similarity:** Uses Gemini Embeddings to compare student bio/interests with mentor research papers.
3.  **Profile Alignment:** Scores based on skills, education level, and availability.

### 2. Research Gap Discovery
Students can explore "Research Gaps" in their field. The system aggregates data from mentor publications and uses AI to suggest novel research directions that bridge the gap between current academic work and emerging trends.

### 3. Application Process
1.  Student applies to an opportunity.
2.  System generates a "Match Score" and "Gap Analysis".
3.  Student can use AI to generate a tailored cover letter.
4.  Mentor receives the application with the AI analysis.
5.  Mentor can Accept/Reject or Schedule a meeting.

## 🎨 Design System
The project follows a **"Deep Academia"** theme:
*   **Colors:** Charcoal (`#222222`), Cream (`#F7F5F0`), Gold (`#C5A028`).
*   **Typography:** Serif headings for authority, Sans-serif body for readability.
*   **UI Style:** Minimalist, content-focused, with subtle "Ivy League" aesthetics.

## 🤝 Contributing
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License
Distributed under the MIT License.

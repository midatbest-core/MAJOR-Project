# AI Creator Dashboard (Cost-Optimized Edition)

An open-source, cost-optimized AI web platform for content creators centered around the 4-stage workflow: **Create → Analyze → Optimize → Publish**.

---

## 🚀 Quick Start & Run Commands

### Method 1: One-Click Launch (Windows)
Double-click `run-dev.bat` in the project root folder. This automatically opens two terminal windows:
- **Backend Server**: `http://localhost:5000`
- **Frontend App**: `http://localhost:3000`

---

### Method 2: Manual Terminal Commands

#### 1. Start Backend Server (Express + Node.js)
```bash
cd backend
npm run dev
```

#### 2. Start Frontend App (Vite + React)
```bash
cd frontend
npm run dev
```

#### 3. (Optional) Activate Python Virtual Environment
The backend automatically detects the `.venv` in `backend/`:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
```

---

## 🛠️ Project Structure & Architecture

```
MAJOR project/
├── docs/
│   └── SRS_and_Technical_Design.md   # Comprehensive Engineering Specs v1.0
├── backend/                          # Express.js REST API Server
│   ├── .venv/                        # Python Virtual Environment (Whisper, spaCy, NLTK)
│   ├── config/                       # Mongoose Database Config
│   ├── controllers/                  # Studio, Caption & Creator Intelligence Controllers
│   ├── models/                       # Project & YouTube Cache Schemas
│   ├── python-services/              # Whisper, spaCy & LLM Python Services
│   ├── routes/                       # Express API Endpoints
│   ├── services/                     # Python Bridge IPC & Auto Storage Cleanup
│   └── server.js                     # Main Backend Entry Point
├── frontend/                         # React + Vite + Tailwind Dashboard
│   ├── src/
│   │   ├── pages/                    # Home, Text Studio, Caption Studio, Creator Intelligence
│   │   ├── components/               # Navbar (4-Stage Tracker), Sidebar Navigation
│   └── vite.config.js                # Proxy configuration for backend port 5000
├── run-dev.bat                       # One-click launcher for both servers
├── run-backend.bat                   # Backend server launcher
└── run-frontend.bat                  # Frontend app launcher
```

---

## ⚡ Cost Optimization Philosophy
- **Speech-to-Text**: Local `openai-whisper` (Free execution, $0 API bill).
- **NLP & Sentiment**: `spaCy`, `NLTK`, `vaderSentiment` deterministic algorithms ($0 API bill).
- **Generative AI**: LLMs (Gemini / OpenAI API) are used *only* for high-creativity tasks (Titles, Descriptions, Hashtags, Hooks).
- **Storage**: Temporary videos/audio are automatically deleted after processing.

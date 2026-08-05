# AI Creator Dashboard - Software Requirements Specification (SRS) & Technical Design Document (TDD)
**Version:** 1.0.0  
**Project:** AI Creator Dashboard (Cost-Optimized Edition)  
**Target Platform:** Web Browsers (React Single Page Application) & Express / Node.js Backend  
**Author:** AI Engineering & Development Team  

---

## 1. Executive Summary & Purpose

The **AI Creator Dashboard** is an engineering framework designed to assist digital content creators (specifically targeting YouTube content in Version 1.0) across four core stages: **Create → Analyze → Optimize → Publish**.

The platform is engineered around a **Cost-Minimization Philosophy**:
1. High-frequency compute operations (Speech-to-Text, Audio Extraction, Natural Language Analytics, Readability, Keyword Extraction, Sentiment Scoring, and Subtitle Rendering) utilize open-source, locally executable libraries (FFmpeg, OpenAI Whisper, spaCy, NLTK, VADER, scikit-learn).
2. Large Language Models (LLMs) are restricted exclusively to creative tasks (Title Generation, SEO Descriptions, Hashtags, Hooks, and Content Blueprints).
3. Temporary storage policies guarantee that video/audio binary data is processed transiently and deleted immediately upon completion, keeping cloud storage costs near zero.

---

## 2. System Architecture & Module Definitions

```
                     +---------------------------------------+
                     |         Vite + React Frontend         |
                     | (Home, Text Studio, Caption Studio,   |
                     |  Creator Intelligence, Downloads,     |
                     |  Settings)                            |
                     +-------------------+-------------------+
                                         |
                                   HTTP / REST API
                                         |
                     +-------------------v-------------------+
                     |      Express.js Server Orchestrator   |
                     |  (Routes, Controllers, Storage Mgt)   |
                     +---------+-------------------+---------+
                               |                   |
               +---------------v----+          +---v-----------------------+
               |  MongoDB Atlas /   |          | Isolated Python Engine    |
               |  Mongoose Storage  |          | (Whisper, spaCy, NLTK,    |
               |  (Metadata only)   |          |  FFmpeg, LLM Router)      |
               +--------------------+          +---------------------------+
```

### Module 1: Text Studio
- **Purpose**: Full ingestion, transcription, and deterministic NLP profiling of audio/video content or raw scripts.
- **Inputs**: Video File (`.mp4`, `.mov`, `.mkv`), Audio File (`.mp3`, `.wav`, `.m4a`), or Direct Script Paste.
- **Pipeline**: Ingestion → Audio Extraction (FFmpeg) → Whisper Speech-to-Text → Text Cleaning → spaCy/NLTK/VADER NLP Processing.
- **Outputs**: Timed Transcript JSON, Extractive Summary, Keywords & Key Phrases, Sentiment Score & Distribution, Flesch-Kincaid Readability Grade, Words Per Minute (WPM) Pacing, Total Word Count.
- **Optional Generative AI**: SEO Title Enhancer, SEO Description Generator, Hashtag Suite.

### Module 2: Caption Studio
- **Purpose**: Professional subtitle customization and video rendering engine.
- **Features**:
  - Subtitle Typography & Styling: Font family, size, primary color, background box, stroke border, drop shadow, vertical placement (Top, Center, Bottom).
  - Subtitle Timing & Editing: In-line text correction, timestamp shifting, segment merge & split.
  - Interactive Canvas Preview: Real-time visual overlay simulation.
- **Export**: Rendered MP4 with hardcoded burned-in subtitles via FFmpeg, downloadable `.srt` / `.vtt` files.
- **AI Dependency**: 0% (Fully deterministic).

### Module 3: Creator Intelligence
- **Purpose**: Competitive YouTube metadata and comment extraction paired with LLM-backed personalized content inspiration.
- **Inputs**: Reference YouTube URL, Creator Niche (e.g., Programming, Fitness, Finance), Creator Topic (e.g., "Machine Learning Roadmap").
- **Pipeline**: YouTube Video/Metadata fetch → Comment Sentiment & Topic Clustering → LLM Prompt Router → Strategic Blueprint & Recommendations.
- **Metrics**: Views, Likes, Comments, Duration, Engagement Rate `(Likes + Comments) / Views`, Like-to-View Ratio, Comment-to-View Ratio.
- **Outputs**:
  - Video Ideas (Original spin-off concepts).
  - Hook Ideas (High-retention opening lines).
  - Title Suggestions (SEO & click-through-rate optimized).
  - Content Blueprint (5-Stage Framework: Hook → Problem → Solution → Demo → Call-to-Action).

---

## 3. Data Storage & Lifecycle Policy

```
[ Upload Video / Input URL ]
             │
             ▼
[ Temporary Storage in backend/uploads/ ] ──► Process (FFmpeg / Whisper / NLP)
                                                       │
                                                       ▼
                                            [ Generate Metadata / Output ]
                                                       │
                                                       ▼
[ Delete Temporary File from backend/uploads/ ] ◄──────┴── Store JSON Metadata in MongoDB
```

### Persistence Policy
- **Stored in MongoDB**: Project ID, User ID, Video Title/Filename, Timed Transcript Array, NLP Metrics, Generated Captions, AI Suggestions, Project Timestamps.
- **Purged Immediately**: Uploaded `.mp4`/`.mp3` files, extracted `.wav` audio files, temporary `.ass`/`.srt` subtitle files, raw YouTube HTML scraped files.

---

## 4. API Endpoints Specification

| Method | Endpoint | Description | Request Body / Query | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Handles video/audio file upload to `/uploads` | `multipart/form-data` (`file`) | `{ fileId, originalName, path, size }` |
| `POST` | `/api/transcribe` | Triggers Whisper transcription engine | `{ fileId, scriptText }` | `{ transcript: [{ start, end, text }], duration }` |
| `POST` | `/api/analyze` | Triggers deterministic NLP analysis | `{ projectId }` | `{ keywords, sentiment, readability, wpm, summary }` |
| `POST` | `/api/generate-title` | Generates SEO video titles via LLM | `{ topic, niche, keywords }` | `{ titles: [] }` |
| `POST` | `/api/generate-description`| Generates video description via LLM | `{ topic, summary, links }` | `{ description, hashtags: [] }` |
| `POST` | `/api/generate-hashtags` | Generates targeted hashtags via LLM | `{ topic, keywords }` | `{ hashtags: [] }` |
| `POST` | `/api/captions/render` | Renders burned-in subtitles via FFmpeg | `{ projectId, subtitleStyle }` | `{ outputVideoPath, downloadUrl }` |
| `POST` | `/api/youtube/analyze` | Extracts YouTube metadata & comments | `{ youtubeUrl }` | `{ metrics, audienceIntelligence }` |
| `POST` | `/api/creator/inspire` | Generates content ideas & blueprint | `{ youtubeUrl, niche, topic }` | `{ ideas, hooks, titles, blueprint }` |

---

## 5. Non-Functional Requirements & Principles

1. **Low Operational Cost**: All standard text analysis and video rendering must execute without external paid APIs. LLM calls must default to free tier (e.g. Gemini 1.5 Flash API or local Ollama).
2. **Stateless Backend Processing**: Temporary files are assigned UUIDs and cleaned up in `finally` blocks or via automated cron workers.
3. **Demo Reliability & Speed**: Simple fallback mock modes for environments without native FFmpeg/Whisper binary paths installed.
4. **Modularity**: Python scripts operate as isolated CLI tools or sub-processes invoked via standard JSON IPC over stdout.

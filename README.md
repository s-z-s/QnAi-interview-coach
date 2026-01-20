# QnAi - AI Interview Coach 🎓🚀

QnAi is an advanced, AI-powered interview preparation platform designed to help users ace their Job, College, or Scholarship interviews.

It uses **Gemini AI** for intelligent context-aware questioning, analysis, and scoring, and **ElevenLabs Scribe V2** for realistic voice agents, creating a seamless voice-first practice environment.

## ✨ Features

### 🎯 Application Management & Practice
*   **Application Dashboard**: Track specific job, college or scholarship applications.
*   **Generate Probable Questions**: Automatically generate highly probable interview questions for any job description or add some of your own manually.
*   **Strategy & Notes**: Add your own notes and talking points to each question to prepare your strategy.
*   **Individual Practice Loop**: Practice questions one by one, recording your answers as many times as needed to improve.
*   **Category-Based Scoring**: Get granular feedback on every attempt with scores for specific categories (e.g., Clarity, Relevance) to help you get better with each try.
*   **Persistent History**: All your practice sessions and recording scores are saved for future review.

### 🧠 Smart Mock Interviews
*   **Dynamic Context**: Tailors questions based on your specific goal (e.g., "Product Manager at Google", "MBA Applicant at Harvard", "Scholarship Applicant at Chevening", etc.).
*   **Voice-First Interaction**: Speak with the AI just like a real interviewer. It listens, processes, and responds with lifelike audio.
*   **Resume Aware**: Upload your PDF CV, and the AI will ask personalized questions based on your background.

### 📊 Detailed Analysis & Feedback
*   **360° Evaluation**: Get a detailed scorecard after every session, including Hiring Probability, Strengths, and Improvements.
*   **Category-Based Scoring**: Evaluation is broken down by 3-5 key categories relevant to your role (e.g., Leadership, Communication, Technical Skills).
*   **Question-by-Question Breakdown**: Detailed feedback for every single answer, including "Better Approach" suggestions.

### 🎨 Modern Experience
*   **Glassmorphism UI**: A beautiful, modern interface with dark mode aesthetics.
*   **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.
*   **Secure**: JWT-based authentication with HttpOnly cookies.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), CSS Modules (Glassmorphism), Recorder.js
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)
*   **AI & ML**: 
    *   **Google Gemini 2.5 Flash**: Complex reasoning, scoring, and feedback generation.
    *   **ElevenLabs**: High-quality Text-to-Speech (TTS) and Speech-to-Text (STT/Scribe).
*   **Authentication**: JWT, bcryptjs

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18+)
*   MongoDB (Local or Atlas URI)
*   API Keys for **Google Gemini** and **ElevenLabs**.

### 1. Backend Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/qnai.git
    cd qnai
    ```

2.  Install backend dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the **root** directory and add the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    GEMINI_API_KEY=your_google_gemini_api_key
    ELEVENLABS_API_KEY=your_elevenlabs_api_key
    FRONTEND_URL=http://localhost:5173
    ```

4.  Start the backend server:
    ```bash
    node server.js
    ```
    *The server will run on `http://localhost:5000`*

### 2. Frontend Setup

1.  Navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install frontend dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

4.  Start the React development server:
    ```bash
    npm run dev
    ```
    *The app will run on `http://localhost:5173`*

---

## 📱 Usage Guide

1.  **Register**: Create an account and select your primary goal (Job, College, etc.).
2.  **Profile**: Upload your CV (PDF) to give the AI context about your history.
3.  **Practice Mode**:
    *   Add an application (Job, College, Scholarship).
    *   Click "Generate Questions" to have AI predict what you'll be asked.
    *   Click "Practice" on any question to enter **Practice Mode**.
    *   Record your answer, get instant category-based scoring, and save your notes.
4.  **Mock Interview**:
    *   Click "Start Mock Interview" on the Dashboard.
    *   Choose a generic session or link it to a specific Job Application.
    *   Speak your answers and interact with the AI.
    *   End the session to generate your **Analysis Report**.

---

## 📄 License

This project is licensed under the MIT License.

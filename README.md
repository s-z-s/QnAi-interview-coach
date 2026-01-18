# QnAi - AI Interview Coach 🎓🚀

QnAi is an advanced, AI-powered interview preparation platform designed to help users ace their Job, College, or Scholarship interviews.

It uses **Gemini AI** for intelligent context-aware questioning and analysis, and **ElevenLabs** for realistic voice interaction, creating a seamless voice-first practice environment.

## ✨ Features

*   **Dynamic Interview Context**: Tailors questions based on your goal (Job, College, Scholarship, General Practice).
*   **Voice-First Interaction**: Speak naturally to the AI; it listens, transcribes, and responds with voice.
*   **Real-time Analysis**: Get instant feedback on your answers (clarity, confidence, content).
*   **Resume Integration**: Upload your PDF CV, and the AI will ask personalized questions based on your experience.
*   **Comprehensive Reports**: View detailed scoring, hiring probability, and improvement tips for every session.
*   **Modern UI**: Fully responsive, glassmorphism-inspired design.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), CSS Modules/Glassmorphism
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)
*   **AI & ML**: Google Gemini 1.5 Pro (Reasoning), ElevenLabs (TTS/STT)
*   **Authentication**: JWT (HttpOnly Cookies)

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

## 📱 Usage

1.  Open the app in your browser.
2.  **Register** a new account (select your Goal: Job, College, etc.).
3.  **Upload your CV** in the Profile section.
4.  Go to the **Dashboard** and start a **New Interview**.
5.  Speak your answers and receive AI feedback!

## 📄 License

This project is licensed under the MIT License.

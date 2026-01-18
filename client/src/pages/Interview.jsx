import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactMediaRecorder } from 'react-media-recorder';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import Modal from '../components/Modal';

const Interview = () => {
    // ... existing state ... 
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isProcessing, setProcessing] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);

    // Initial Overlay State
    const [hasStarted, setHasStarted] = useState(false);
    const [pendingAudio, setPendingAudio] = useState(null);

    // Modal State
    const [showEndModal, setShowEndModal] = useState(false);

    const audioRef = useRef(new Audio());

    // Media Recorder
    const {
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
        clearBlobUrl
    } = useReactMediaRecorder({ audio: true });

    useEffect(() => {
        fetchSession();

        // Cleanup function to stop audio when unmounting
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, [id]);

    useEffect(() => {
        // Trigger send immediately when recording stops and URL is ready
        if (status === 'stopped' && mediaBlobUrl) {
            sendAnswer();
        }
    }, [mediaBlobUrl, status]);

    const fetchSession = async () => {
        try {
            const res = await api.get(`/interview/session/${id}`);
            setSession(res.data);
            setMessages(res.data.messages || []);

            // Queue greeting audio if it exists and is the only message
            if (res.data.messages && res.data.messages.length === 1) {
                const greeting = res.data.messages[0];
                if (greeting.role === 'ai' && greeting.audio) {
                    setPendingAudio(greeting.audio);
                }
            }
        } catch (error) {
            console.error(error);
            navigate('/');
        }
    };

    const playAudio = (audioBase64) => {
        if (!audioBase64) return;

        try {
            const byteCharacters = atob(audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);

            audioRef.current.src = url;
            audioRef.current.play().catch(e => console.error("Playback failed:", e));
            setAiSpeaking(true);

            audioRef.current.onended = () => {
                setAiSpeaking(false);
            };
        } catch (e) {
            console.error("Audio decode error:", e);
        }
    };

    const sendAnswer = async () => {
        if (!mediaBlobUrl) return;
        setProcessing(true);

        try {
            const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
            const formData = new FormData();
            formData.append('sessionId', id);
            formData.append('audio', audioBlob, 'answer.wav');

            const res = await api.post('/interview/answer', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages(res.data.history);

            // Play the AI Audio if present
            if (res.data.aiAudio) {
                playAudio(res.data.aiAudio);
            }

            clearBlobUrl();
        } catch (error) {
            console.error(error);
            alert('Failed to submit answer');
        } finally {
            setProcessing(false);
        }
    };

    const handleStartInterview = () => {
        setHasStarted(true);
        if (pendingAudio) {
            // Small delay to ensure browser acknowledges interaction
            setTimeout(() => playAudio(pendingAudio), 100);
            setPendingAudio(null);
        }
    };

    const confirmEndInterview = () => {
        setShowEndModal(true);
    };

    const handleEndInterview = async () => {
        setShowEndModal(false);
        setProcessing(true);
        try {
            const res = await api.post('/interview/end', { sessionId: id });
            navigate(`/analysis/${id}`);
        } catch (error) {
            console.error("End Interview Error:", error);
        } finally {
            setProcessing(false);
        }
    };

    if (!session) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading...</div>;

    // Join Overlay
    if (!hasStarted) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
                    <h1 style={{ marginBottom: '1rem' }}>Ready?</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Click to join the interview call. The AI interviewer will greet you immediately.
                    </p>
                    <button
                        onClick={handleStartInterview}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
                    >
                        Join Interview
                    </button>
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    // Get latest AI message text for display
    const latestAiMessage = messages.slice().reverse().find(m => m.role === 'ai');

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

            {/* Header - Minimal */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <h2 className="text-gradient" style={{ margin: 0 }}>QnAi Call</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={confirmEndInterview}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', background: 'var(--success-color)' }}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Analyzing...' : 'End & Get Report'}
                    </button>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Exit</button>
                </div>
            </div>

            <Modal
                isOpen={showEndModal}
                title="End Interview"
                message="Are you sure you want to end the interview and generate your report?"
                onConfirm={handleEndInterview}
                onCancel={() => setShowEndModal(false)}
                confirmText="End & View Report"
                type="success"
            />

            {/* Main Visualizer Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>

                {/* AI Avatar Circle */}
                <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    boxShadow: aiSpeaking ? '0 0 60px 20px rgba(167, 139, 250, 0.4)' : '0 0 30px rgba(96, 165, 250, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: aiSpeaking ? 'scale(1.1)' : 'scale(1)',
                    animation: aiSpeaking ? 'pulse-ring 2s infinite' : 'none'
                }}>
                    <div style={{
                        width: '180px',
                        height: '180px',
                        borderRadius: '50%',
                        background: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Inner Icon or Face */}
                        {aiSpeaking ? (
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '40px', background: 'white', animation: 'float 0.5s infinite' }}></div>
                                <div style={{ width: '8px', height: '60px', background: 'white', animation: 'float 0.5s infinite 0.1s' }}></div>
                                <div style={{ width: '8px', height: '40px', background: 'white', animation: 'float 0.5s infinite 0.2s' }}></div>
                            </div>
                        ) : (
                            <span style={{ fontSize: '4rem' }}>🤖</span>
                        )}
                    </div>
                </div>

                {/* Status Text */}
                <div style={{ marginTop: '3rem', textAlign: 'center', minHeight: '80px', width: '100%', padding: '0 2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '400', color: 'var(--text-secondary)' }}>
                        {aiSpeaking ? "AI is speaking..." :
                            isProcessing ? "Thinking..." :
                                status === 'recording' ? "Listening..." : "Tap mic to speak"}
                    </h3>
                    {latestAiMessage && !aiSpeaking && !isProcessing && status !== 'recording' && (
                        <div style={{
                            maxWidth: '700px',
                            margin: '0 auto',
                            opacity: 0.9,
                            padding: '1.5rem',
                            lineHeight: '1.6',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '1rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <ReactMarkdown>{latestAiMessage.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

            </div>

            {/* Controls - Bottom */}
            <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={status === 'recording' ? stopRecording : startRecording}
                    disabled={isProcessing || aiSpeaking}
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: status === 'recording' ? 'var(--error-color)' : 'var(--accent-color)',
                        color: 'white',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    {status === 'recording' ? '■' : '🎤'}
                </button>
            </div>

        </div>
    );
};

export default Interview;

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useReactMediaRecorder } from 'react-media-recorder';
import api from '../services/api';

const PracticeQuestionPage = () => {
    const { jobId, questionId } = useParams();
    const navigate = useNavigate();

    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null); // Stores { userAnswer, analysis: { score, feedback... } }
    const [isProcessing, setProcessing] = useState(false);

    // Editable Notes
    const [notes, setNotes] = useState('');
    const [originalNotes, setOriginalNotes] = useState(''); // To check for changes
    const [savingNotes, setSavingNotes] = useState(false);

    const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const res = await api.get(`/jobs/${jobId}`);
                const q = res.data.questions.find(item => item._id === questionId);
                setQuestion(q);
                setNotes(q.notes || '');
                setOriginalNotes(q.notes || '');

                // If previously practiced, load that data
                if (q.score !== undefined) {
                    setAnalysis({
                        userAnswer: q.userAnswer,
                        analysis: {
                            score: q.score,
                            feedback: q.aiFeedback,
                            improvedAnswer: q.improvedAnswer
                        }
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [jobId, questionId]);

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await api.put(`/jobs/${jobId}/questions`, { questionId, notes });
            setOriginalNotes(notes);
            // Optional: Show toast
        } catch (error) {
            console.error(error);
            alert("Failed to save notes");
        } finally {
            setSavingNotes(false);
        }
    };

    const submitAnswer = async () => {
        if (!mediaBlobUrl) return;
        setProcessing(true);
        try {
            const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
            const formData = new FormData();
            formData.append('audio', audioBlob, 'practice.wav');
            formData.append('question', question.question);
            formData.append('notes', notes); // Use current notes
            formData.append('jobId', jobId);
            formData.append('questionId', questionId);

            const res = await api.post('/jobs/practice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAnalysis(res.data);
        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!question) return <div>Question not found</div>;

    return (
        <div className="container" style={{ padding: '1rem 2rem', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

            {/* Top Row: Back & Question */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>
                    ← Back
                </button>
                <h2 style={{ fontSize: '1.25rem', lineHeight: '1.4', maxWidth: '1000px', margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>
                    {question.question}
                </h2>
            </div>

            {/* Bottom Row: Split Pane */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', minHeight: 0, overflow: 'hidden' }}>

                {/* Left: Notes Section */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Your Notes
                        </h4>
                        {notes !== originalNotes && (
                            <button
                                onClick={handleSaveNotes}
                                className="btn btn-primary"
                                style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}
                                disabled={savingNotes}
                            >
                                {savingNotes ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>

                    <textarea
                        className="input-field"
                        style={{
                            flex: 1,
                            resize: 'none',
                            lineHeight: '1.6',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            padding: '1.5rem',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--glass-border)'
                        }}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="• Key talking points&#10;• Experience to highlight&#10;• STAR method breakdown..."
                    />
                </div>

                {/* Right: Practice & Analysis */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '100%', overflow: 'hidden' }}>

                    {!analysis ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: status === 'recording' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', margin: '0 auto',
                                    border: status === 'recording' ? '2px solid var(--error-color)' : '1px solid var(--glass-border)',
                                    boxShadow: status === 'recording' ? '0 0 20px var(--error-color)' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    {status === 'recording' ? '🎙️' : '🎤'}
                                </div>
                                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                                    {status === 'recording' ? "Listening..." : "Practice Mode"}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
                                    {status === 'recording'
                                        ? "Speak clearly. Click stop when you're done."
                                        : "Record your answer to get instant AI feedback and scoring."}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', width: '100%', maxWidth: '250px' }}>
                                {status !== 'recording' ? (
                                    <button onClick={startRecording} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}>
                                        Start Recording
                                    </button>
                                ) : (
                                    <button onClick={stopRecording} className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1.1rem', borderColor: 'var(--error-color)', color: 'var(--error-color)', justifyContent: 'center' }}>
                                        Stop Recording
                                    </button>
                                )}

                                {mediaBlobUrl && status === 'stopped' && (
                                    <button onClick={submitAnswer} className="btn btn-primary" style={{ padding: '1rem', background: 'var(--success-color)', justifyContent: 'center' }} disabled={isProcessing}>
                                        {isProcessing ? 'Analyzing...' : 'Analyze Answer'}
                                    </button>
                                )}
                            </div>

                            {mediaBlobUrl && status === 'stopped' && (
                                <div style={{ marginTop: '2rem', width: '100%', maxWidth: '300px' }}>
                                    <audio src={mediaBlobUrl} controls style={{ width: '100%' }} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>Analysis Result</h2>
                                <button onClick={() => setAnalysis(null)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Try Again ↺</button>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: analysis.analysis.score >= 70 ? 'var(--success-color)' : 'var(--error-color)', lineHeight: 1 }}>
                                    {analysis.analysis.score}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Overall Score</div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your Answer:</strong>
                                <p style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    "{analysis.userAnswer}"
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Feedback:</strong>
                                <div className="markdown-content" style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                    <ReactMarkdown>{analysis.analysis.feedback}</ReactMarkdown>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                <strong style={{ color: 'var(--accent-color)', display: 'block', marginBottom: '0.5rem' }}>💡 Improved Answer:</strong>
                                <div className="markdown-content" style={{ lineHeight: '1.6' }}>
                                    <ReactMarkdown>{analysis.analysis.improvedAnswer}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeQuestionPage;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactMediaRecorder } from 'react-media-recorder';
import api from '../services/api';

const PracticeQuestionPage = () => {
    const { jobId, questionId } = useParams();
    const navigate = useNavigate();

    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [isProcessing, setProcessing] = useState(false);

    const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const res = await api.get(`/jobs/${jobId}`);
                const q = res.data.questions.find(item => item._id === questionId);
                setQuestion(q);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [jobId, questionId]);

    const submitAnswer = async () => {
        if (!mediaBlobUrl) return;
        setProcessing(true);
        try {
            const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
            const formData = new FormData();
            formData.append('audio', audioBlob, 'practice.wav');
            formData.append('question', question.question);
            formData.append('notes', question.notes || '');

            const res = await api.post('/jobs/practice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAnalysis(res.data);
        } catch (error) {
            console.error(error);
            alert("Analysis failed.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!question) return <div>Question not found</div>;

    return (
        <div className="container" style={{ padding: '2rem', height: 'calc(100vh - 80px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

            {/* Left Panel: Context */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>← Back</button>

                <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', lineHeight: '1.4' }}>{question.question}</h2>

                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', overflowY: 'auto' }}>
                    <h4 style={{ marginTop: 0, color: 'var(--text-secondary)' }}>YOUR NOTES:</h4>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {question.notes || 'No notes added. (Go back to edit)'}
                    </p>
                </div>
            </div>

            {/* Right Panel: Action & Result */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                {!analysis ? (
                    <>
                        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                background: status === 'recording' ? 'var(--error-color)' : 'var(--bg-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '3rem', margin: '0 auto',
                                boxShadow: status === 'recording' ? '0 0 30px var(--error-color)' : 'none',
                                transition: 'all 0.3s'
                            }}>
                                🎙️
                            </div>
                            <h3 style={{ marginTop: '2rem' }}>
                                {status === 'recording' ? "Listening..." : "Practice Mode"}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {status === 'recording' ? "Speak your answer clearly." : "Click below to start recording."}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {status !== 'recording' ? (
                                <button onClick={startRecording} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                                    Start Recording
                                </button>
                            ) : (
                                <button onClick={stopRecording} className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', background: 'var(--error-color)', color: 'white' }}>
                                    Stop Recording
                                </button>
                            )}

                            {mediaBlobUrl && status === 'stopped' && (
                                <button onClick={submitAnswer} className="btn btn-primary" style={{ padding: '1rem 2rem', background: 'var(--success-color)' }} disabled={isProcessing}>
                                    {isProcessing ? 'Analyzing...' : 'Analyze Answer'}
                                </button>
                            )}
                        </div>
                        {mediaBlobUrl && status === 'stopped' && <audio src={mediaBlobUrl} controls style={{ marginTop: '2rem' }} />}
                    </>
                ) : (
                    <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Analysis Result</h2>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: analysis.analysis.score >= 70 ? 'var(--success-color)' : 'var(--error-color)' }}>
                                {analysis.analysis.score}/100
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <strong>Feedback:</strong>
                            <p>{analysis.analysis.feedback}</p>
                        </div>

                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '1rem' }}>
                            <strong style={{ color: 'var(--accent-color)' }}>💡 Improved Answer:</strong>
                            <p style={{ marginTop: '0.5rem' }}>{analysis.analysis.improvedAnswer}</p>
                        </div>

                        <button onClick={() => { setAnalysis(null); }} className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }}>
                            Try Again
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PracticeQuestionPage;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Analysis = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/interview/session/${id}`);
                setSession(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading Analysis...</div>;
    if (!session || !session.analysis) return <div className="container">Analysis not found.</div>;

    const { analysis } = session;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>← Back to Dashboard</button>

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Interview Analysis</h1>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    {/* Score Circle */}
                    <div style={{
                        width: '150px', height: '150px', borderRadius: '50%', border: '4px solid var(--accent-color)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{analysis.score}</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Score</span>
                    </div>

                    {/* Probability Circle */}
                    <div style={{
                        width: '150px', height: '150px', borderRadius: '50%', border: `4px solid ${analysis.hiringProbability === 'High' ? 'var(--success-color)' : '#f59e0b'}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analysis.hiringProbability}</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Hiring Chance</span>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3>Feedback Summary</h3>
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{analysis.feedback}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '1rem' }}>
                        <h4 style={{ color: 'var(--success-color)' }}>✅ Strengths</h4>
                        <ul style={{ paddingLeft: '1.2rem' }}>
                            {analysis.strengths?.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                        </ul>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '1rem' }}>
                        <h4 style={{ color: 'var(--error-color)' }}>🚀 Improvements</h4>
                        <ul style={{ paddingLeft: '1.2rem' }}>
                            {analysis.improvements?.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                        </ul>
                    </div>
                </div>

                {/* Question Breakdown */}
                {analysis.questions && analysis.questions.length > 0 && (
                    <div style={{ marginTop: '3rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Detailed Breakdown</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {analysis.questions.map((q, i) => (
                                <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${q.score >= 70 ? 'var(--success-color)' : 'var(--error-color)'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0, flex: 1, fontSize: '1.1rem' }}>Q: {q.question}</h4>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                            {q.score}/100
                                        </div>
                                    </div>

                                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '1rem', borderLeft: '2px solid var(--glass-border)', paddingLeft: '0.8rem' }}>
                                        " {q.answer} "
                                    </p>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Feedback:</strong> {q.feedback}
                                    </div>

                                    {q.improvement && (
                                        <div style={{ marginTop: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '0.5rem' }}>
                                            <strong>💡 Better Approach:</strong> {q.improvement}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Analysis;

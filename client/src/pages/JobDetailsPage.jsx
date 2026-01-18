import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Notes editing state
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const res = await api.get(`/jobs/${id}`);
            setJob(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const generateQuestions = async () => {
        setGenerating(true);
        try {
            const res = await api.post(`/jobs/${id}/generate-questions`);
            setJob(res.data);
        } catch (error) {
            console.error("Generate failed", error);
            alert("Failed to generate questions.");
        } finally {
            setGenerating(false);
        }
    };

    const startFullSession = async () => {
        try {
            const res = await api.post('/interview/session', { jobId: id });
            navigate(`/interview/${res.data._id}`);
        } catch (error) {
            console.error(error);
        }
    };

    const saveNote = async (questionId) => {
        try {
            const res = await api.put(`/jobs/${id}/questions`, { questionId, notes: noteContent });
            setJob(res.data);
            setEditingNoteId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const startEditWait = (q) => {
        setEditingNoteId(q._id);
        setNoteContent(q.notes || '');
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Job...</div>;
    if (!job) return <div className="container">Job not found</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {/* Header */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>{job.jobTitle}</h1>
                        <h3 style={{ margin: 0, color: 'var(--accent-color)' }}>{job.company}</h3>
                    </div>

                    <button onClick={startFullSession} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem' }}>
                        Start Mock Interview 🎤
                    </button>
                </div>
            </div>

            {/* Questions Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Probable Questions</h2>
                    <button
                        onClick={generateQuestions}
                        className="btn btn-secondary"
                        disabled={generating}
                    >
                        {generating ? 'Generating AI Questions...' : '✨ Generate Questions'}
                    </button>
                </div>

                {job.questions.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.7, border: '1px dashed var(--glass-border)', borderRadius: '1rem' }}>
                        No questions generated yet. Click the button above to have AI analyze your CV and JD.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {job.questions.map((q, i) => (
                            <div key={q._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Q{i + 1}: {q.question}</h3>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>YOUR NOTES</label>
                                        {editingNoteId !== q._id && (
                                            <button onClick={() => startEditWait(q)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingNoteId === q._id ? (
                                        <div>
                                            <textarea
                                                className="input-field"
                                                rows="3"
                                                value={noteContent}
                                                onChange={e => setNoteContent(e.target.value)}
                                                autoFocus
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => setEditingNoteId(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                                                <button onClick={() => saveNote(q._id)} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: q.notes ? 'white' : 'gray', fontStyle: q.notes ? 'normal' : 'italic' }}>
                                            {q.notes || 'Add notes here to help you answer...'}
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate(`/practice/${job._id}/${q._id}`)}
                                    >
                                        🎤 Practice This Question
                                    </button>
                                    {q.aiExpectedAnswer && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>💡 Hint: {q.aiExpectedAnswer}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetailsPage;

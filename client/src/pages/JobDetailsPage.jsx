import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // State for Note Modal
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [currentNoteQ, setCurrentNoteQ] = useState(null);
    const [noteContent, setNoteContent] = useState('');

    // New State for UI Improvements
    const [activeTab, setActiveTab] = useState('todo'); // 'todo' | 'practiced' | 'all'
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Job
                const jobRes = await api.get(`/jobs/${id}`);
                setJob(jobRes.data);

                // Fetch History safely
                try {
                    const historyRes = await api.get(`/interview/history?jobId=${id}`);
                    if (Array.isArray(historyRes.data)) {
                        setHistory(historyRes.data);
                    } else {
                        setHistory([]);
                    }
                } catch (hErr) {
                    console.error("Failed to load history", hErr);
                    setHistory([]);
                }
            } catch (error) {
                console.error(error);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const generateQuestions = async () => {
        setGenerating(true);
        try {
            const res = await api.post(`/jobs/${id}/generate-questions`);
            setJob(res.data);
            setActiveTab('todo'); // Switch to todo to show new questions
        } catch (error) {
            console.error(error);
            alert("Failed to generate questions. Ensure CV and Job Description are long enough.");
        } finally {
            setGenerating(false);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.trim()) return;
        try {
            const res = await api.post(`/jobs/${id}/add-question`, { question: newQuestion });
            setJob(res.data);
            setNewQuestion('');
            setShowAddModal(false);
            setActiveTab('todo'); // Show the new question
        } catch (error) {
            console.error(error);
        }
    };

    const openNoteModal = (q) => {
        setCurrentNoteQ(q);
        setNoteContent(q.notes || '');
        setNoteModalOpen(true);
    };

    const handleSaveNote = async () => {
        if (!currentNoteQ) return;
        try {
            const res = await api.put(`/jobs/${id}/questions`, { questionId: currentNoteQ._id, notes: noteContent });
            setJob(res.data);
            setNoteModalOpen(false);
            setCurrentNoteQ(null);
        } catch (error) {
            console.error(error);
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

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null });

    const confirmRemoveHistory = (sessionId) => {
        setModalConfig({
            isOpen: true,
            title: "Remove Session",
            message: "Are you sure you want to remove this practice session? This cannot be undone.",
            confirmText: "Remove",
            type: "danger",
            onConfirm: () => handleRemoveHistory(sessionId),
            onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    const handleRemoveHistory = async (sessionId) => {
        try {
            await api.delete(`/interview/session/${sessionId}`);
            setHistory(history.filter(h => h._id !== sessionId));
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Job...</div>;
    if (!job) return <div className="container">Job not found</div>;

    // Filter Logic
    const questions = job.questions || [];
    const todoQuestions = questions.filter(q => !q.practicedAt);
    const practicedQuestions = questions.filter(q => q.practicedAt);

    let displayedQuestions = [];
    if (activeTab === 'todo') displayedQuestions = todoQuestions;
    else if (activeTab === 'practiced') displayedQuestions = practicedQuestions;
    else displayedQuestions = questions;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {/* Header */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>{job.jobTitle}</h1>
                        <h3 style={{ margin: 0, color: 'var(--accent-color)' }}>{job.company}</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
                        <button onClick={startFullSession} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem', width: '100%' }}>
                            Start Mock Interview 🎤
                        </button>
                        {history.length > 0 && (
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="btn btn-secondary"
                                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', width: '100%' }}
                            >
                                {showHistory ? 'Hide History' : `📜 Past Sessions (${history.length})`}
                            </button>
                        )}
                    </div>
                </div>

                {/* History Section (Collapsible) */}
                {showHistory && (
                    <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Previous Sessions</h3>
                        <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {history.map(sess => (
                                <div key={sess._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {new Date(sess.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Mock Interview · {sess.score || 0}% Score
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => navigate(`/analysis/${sess._id}`, { state: { from: `/job/${id}` } })}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                        >
                                            View Report
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmRemoveHistory(sess._id);
                                            }}
                                            className="btn"
                                            style={{
                                                fontSize: '0.8rem',
                                                padding: '0.4rem 0.8rem',
                                                color: 'var(--error-color)',
                                                border: '1px solid var(--error-color)',
                                                background: 'transparent',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Questions Section */}
            <div>
                {/* Controls & Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.8rem' }}>
                        <button
                            onClick={() => setActiveTab('todo')}
                            style={{
                                padding: '0.5rem 1.2rem',
                                border: 'none',
                                borderRadius: '0.6rem',
                                background: activeTab === 'todo' ? 'var(--accent-color)' : 'transparent',
                                color: activeTab === 'todo' ? 'white' : 'var(--text-secondary)',
                                fontWeight: activeTab === 'todo' ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            To Practice ({todoQuestions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('practiced')}
                            style={{
                                padding: '0.5rem 1.2rem',
                                border: 'none',
                                borderRadius: '0.6rem',
                                background: activeTab === 'practiced' ? 'var(--accent-color)' : 'transparent',
                                color: activeTab === 'practiced' ? 'white' : 'var(--text-secondary)',
                                fontWeight: activeTab === 'practiced' ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Practiced ({practicedQuestions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            style={{
                                padding: '0.5rem 1.2rem',
                                border: 'none',
                                borderRadius: '0.6rem',
                                background: activeTab === 'all' ? 'var(--accent-color)' : 'transparent',
                                color: activeTab === 'all' ? 'white' : 'var(--text-secondary)',
                                fontWeight: activeTab === 'all' ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            All Questions ({questions.length})
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <span>+</span> Add Custom Question
                        </button>
                        <button
                            onClick={generateQuestions}
                            className="btn btn-primary"
                            disabled={generating}
                            style={{ background: 'linear-gradient(to right, #8b5cf6, #d946ef)' }}
                        >
                            {generating ? 'Generating with AI...' : '✨ Generate Questions'}
                        </button>
                    </div>
                </div>

                {displayedQuestions.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.6, border: '2px dashed var(--glass-border)', borderRadius: '1rem' }}>
                        {activeTab === 'practiced'
                            ? "You haven't practiced any questions yet. Pick one from the 'To Do' tab!"
                            : "No questions found. Generate some with AI or add your own!"}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {displayedQuestions.map((q, i) => (
                            <div key={q._id} className="glass-panel" style={{
                                padding: '1.5rem',
                                borderLeft: q.practicedAt ? '4px solid var(--success-color)' : '4px solid var(--accent-color)',
                                transition: 'transform 0.2s',
                            }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                                    <div style={{ flex: '1 1 300px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                                            {q.question}
                                        </h3>

                                        {/* Notes Preview */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <button
                                                onClick={() => openNoteModal(q)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '0.4rem',
                                                    padding: '0.3rem 0.6rem',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    transition: 'all 0.2s',
                                                    minWidth: 'fit-content'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            >
                                                📝 {q.notes ? 'Edit Notes' : 'Add Notes'}
                                            </button>

                                            {q.notes && (
                                                <span style={{
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-secondary)',
                                                    fontStyle: 'italic',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '400px',
                                                    paddingTop: '0.1rem'
                                                }}>
                                                    {q.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions & Badges */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', minWidth: '160px' }}>
                                        {q.score !== undefined && (
                                            <div style={{
                                                background: q.score >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: q.score >= 70 ? '#34d399' : '#fca5a5',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '0.5rem',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                textAlign: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                border: `1px solid ${q.score >= 70 ? '#34d399' : '#fca5a5'}`
                                            }}>
                                                <span>{q.score >= 70 ? '✅' : '⚠️'}</span>
                                                Score: {q.score}%
                                            </div>
                                        )}

                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/practice/${job._id}/${q._id}`)}
                                            style={{ width: '100%', fontSize: '0.9rem', justifyContent: 'center' }}
                                        >
                                            {q.practicedAt ? 'View / Retry' : '🎤 Practice'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Question Modal */}
            <Modal
                isOpen={showAddModal}
                title="Add Custom Question"
                message="Type your question below:"
                onCancel={() => setShowAddModal(false)}
                onConfirm={handleAddQuestion}
                confirmText="Add Question"
            >
                <textarea
                    className="input-field"
                    rows="3"
                    placeholder="e.g., Tell me about a time you failed..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    style={{ marginTop: '1rem', width: '100%' }}
                    autoFocus
                />
            </Modal>

            {/* Note Edit Modal */}
            <Modal
                isOpen={noteModalOpen}
                title="Edit Notes"
                message={`Add your thoughts, keywords, or draft answer for:\n"${currentNoteQ?.question}"`}
                onCancel={() => setNoteModalOpen(false)}
                onConfirm={handleSaveNote}
                confirmText="Save Notes"
                type="accent"
            >
                <textarea
                    className="input-field"
                    rows="8"
                    placeholder="Type your notes here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    style={{ marginTop: '0.5rem', width: '100%', fontSize: '1rem', lineHeight: '1.5' }}
                    autoFocus
                />
            </Modal>
            {/* Confirmation Modal */}
            <Modal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
                confirmText={modalConfig.confirmText}
                type={modalConfig.type}
            />
        </div >
    );
};

export default JobDetailsPage;

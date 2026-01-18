import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

const Dashboard = () => {
    const [stats, setStats] = useState({ sessions: 0, questions: 0, avgScore: 0 });
    const [recentHistory, setRecentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/interview/history');
            const history = res.data;

            // Calculate Stats
            const avgScore = history.length > 0
                ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length)
                : 0;

            const totalQuestions = history.reduce((acc, curr) => acc + Math.floor((curr.messageCount || 0) / 2), 0);

            setStats({
                sessions: history.length,
                questions: totalQuestions,
                avgScore
            });

            // Store recent 5 items
            setRecentHistory(history.slice(0, 5));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startNewInterview = async () => {
        try {
            const res = await api.post('/interview/session', {});
            navigate(`/interview/${res.data._id}`);
        } catch (error) {
            setModalConfig({
                isOpen: true,
                title: "Profile Incomplete",
                message: "Please complete your profile (CV & Job Description) before starting an interview.",
                confirmText: "Go to Profile",
                type: "info",
                onConfirm: () => {
                    navigate('/profile');
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                },
                onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const confirmDelete = (e, id) => {
        e.stopPropagation();
        setModalConfig({
            isOpen: true,
            title: "Delete Interview",
            message: "Are you sure you want to delete this interview session? This action cannot be undone.",
            confirmText: "Delete",
            type: "danger",
            onConfirm: () => handleDelete(id),
            onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/interview/session/${id}`);
            fetchStats();
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your interview preparation progress</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Interview Sessions</p>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.sessions}</div>
                    </div>
                    <div style={{ fontSize: '2rem', opacity: 0.5 }}>📝</div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Questions Answered</p>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.questions}</div>
                    </div>
                    <div style={{ fontSize: '2rem', opacity: 0.5 }}>📈</div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Average Score</p>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.avgScore}%</div>
                    </div>
                    <div style={{ fontSize: '2rem', opacity: 0.5 }}>🏅</div>
                </div>
            </div>

            {/* Main Content Area: Recent Interviews */}
            <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>{recentHistory.length === 0 ? 'Get Started' : 'Recent Interviews'}</h2>
                    <button onClick={startNewInterview} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                        + Start New Interview
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', opacity: 0.6 }}>Loading...</div>
                ) : recentHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                        <h3>No interviews yet</h3>
                        <p>Start your first session to begin tracking your progress.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentHistory.map(item => (
                            <div
                                key={item._id}
                                onClick={() => navigate(`/analysis/${item._id}`)}
                                className="glass-panel"
                                style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.03)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s',
                                    border: '1px solid var(--glass-border)'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>
                                        {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ color: item.score >= 70 ? 'var(--success-color)' : 'var(--error-color)', fontWeight: 'bold' }}>
                                            Score: {item.score}%
                                        </span>
                                        <span>•</span>
                                        <span>{item.messageCount || 0} msgs</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => confirmDelete(e, item._id)}
                                    className="btn btn-icon-hover"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        padding: '0.5rem',
                                        fontSize: '1.2rem',
                                        zIndex: 10
                                    }}
                                    title="Delete Interview"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {recentHistory.length > 0 && <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link to="/history" style={{ color: 'var(--accent-color)' }}>View All History →</Link>
                        </div>}
                    </div>
                )}
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
                confirmText={modalConfig.confirmText}
                type={modalConfig.type}
            />
        </div>
    );
};

export default Dashboard;

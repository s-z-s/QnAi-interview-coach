import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/interview/history');
                setHistory(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null });

    const confirmDelete = (id) => {
        setModalConfig({
            isOpen: true,
            title: "Delete Interview",
            message: "Are you sure you want to delete this session? This action cannot be undone.",
            confirmText: "Delete",
            type: "danger",
            onConfirm: () => handleDelete(id),
            onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/interview/session/${id}`);
            setHistory(history.filter(h => h._id !== id));
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Interview History</h1>

            {history.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p>No history found.</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Dashboard</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {history.map(sess => (
                        <div key={sess._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {new Date(sess.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    {new Date(sess.createdAt).toLocaleTimeString()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: sess.score > 70 ? 'var(--success-color)' : 'white' }}>
                                        {sess.score || 0}%
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score</div>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold' }}>{sess.hiringProbability || 'N/A'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chance</div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => navigate(`/analysis/${sess._id}`)}
                                        className="btn btn-secondary"
                                    >
                                        View Report
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(sess._id)}
                                        className="btn"
                                        style={{
                                            color: 'var(--error-color)',
                                            borderColor: 'var(--error-color)',
                                            fontSize: '1rem',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid',
                                            background: 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                        title="Delete"
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

export default HistoryPage;

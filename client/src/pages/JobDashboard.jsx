import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', jobTitle: '', description: '' });

    const { user } = useAuth();

    // Dynamic Labels based on Purpose
    const getLabels = () => {
        const purpose = user?.purpose || 'Job Interview';
        switch (purpose) {
            case 'College Interview':
                return {
                    title: 'My College Applications',
                    entity: 'Institution',
                    role: 'Program / Major',
                    addBtn: 'Add College Application',
                    descPlaceholder: 'Paste the program details or admission requirements...',
                    emptyTitle: 'No College Applications Yet',
                    emptyDesc: 'Add a college application to start practicing admission questions.'
                };
            case 'Scholarship Interview':
                return {
                    title: 'My Scholarships',
                    entity: 'Organization',
                    role: 'Scholarship Name',
                    addBtn: 'Add Scholarship',
                    descPlaceholder: 'Paste the scholarship criteria and description...',
                    emptyTitle: 'No Scholarships Yet',
                    emptyDesc: 'Add a scholarship to practice specific interview questions.'
                };
            case 'General Practice':
                return {
                    title: 'My Practice Scenarios',
                    entity: 'Context',
                    role: 'Role / Topic',
                    addBtn: 'Add Scenario',
                    descPlaceholder: 'Describe the scenario or topic you want to practice...',
                    emptyTitle: 'No Scenarios Yet',
                    emptyDesc: 'Create a scenario to practice general speaking skills.'
                };
            default: // Job Interview
                return {
                    title: 'My Job Applications',
                    entity: 'Company',
                    role: 'Job Title',
                    addBtn: 'Add Job Application',
                    descPlaceholder: 'Paste the full job description here...',
                    emptyTitle: 'No Job Applications Yet',
                    emptyDesc: 'Add a job description to start practicing tailored questions.'
                };
        }
    };

    const labels = getLabels();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async () => {
        try {
            await api.post('/jobs', newJob);
            setShowAddModal(false);
            setNewJob({ company: '', jobTitle: '', description: '' });
            fetchJobs();
        } catch (error) {
            console.error("Create Job Error:", error);
            alert("Failed to create application");
        }
    };

    const styles = {
        container: {
            padding: '2rem 1rem',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        title: {
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
        },
        subtitle: {
            color: 'var(--text-secondary)',
            fontSize: '1.1rem'
        },
        addBtn: {
            padding: '0.8rem 1.5rem',
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
        },
        card: {
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'transform 0.2s',
            cursor: 'default'
        },
        cardTitle: {
            fontSize: '1.5rem',
            marginBottom: '0.25rem',
            color: 'white'
        },
        cardSubtitle: {
            color: 'var(--accent-color)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontSize: '1rem'
        },
        cardDesc: {
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
        },
        manageBtn: {
            width: '100%',
            marginTop: 'auto'
        },
        emptyState: {
            padding: '5rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '1rem'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        },
        modal: {
            width: '100%',
            maxWidth: '500px',
            padding: '2rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>{labels.title}</h1>
                    <p style={styles.subtitle}>Manage your preparation for specific goals</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                    style={styles.addBtn}
                >
                    + {labels.addBtn}
                </button>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>Loading Applications...</div>
            ) : jobs.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{labels.emptyTitle}</h3>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{labels.emptyDesc}</p>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                        {labels.addBtn}
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {jobs.map(job => (
                        <div key={job._id} className="glass-panel" style={styles.card}>
                            <div>
                                <h3 style={styles.cardTitle}>{job.jobTitle}</h3>
                                <div style={styles.cardSubtitle}>{job.company}</div>
                            </div>

                            <p style={styles.cardDesc}>
                                {job.description || 'No description provided'}
                            </p>

                            <button
                                onClick={() => navigate(`/job/${job._id}`)}
                                className="btn btn-primary"
                                style={styles.manageBtn}
                            >
                                Manage & Practice
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={styles.modalOverlay}>
                    <div className="glass-panel" style={styles.modal}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{labels.addBtn}</h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{labels.entity}</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newJob.company}
                                onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                                placeholder={`e.g. ${labels.entity === 'Institution' ? 'Harvard' : 'Google'}`}
                                style={{ width: '100%', padding: '0.8rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{labels.role}</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newJob.jobTitle}
                                onChange={e => setNewJob({ ...newJob, jobTitle: e.target.value })}
                                placeholder={`e.g. ${labels.role === 'Program' ? 'Computer Science' : 'Software Engineer'}`}
                                style={{ width: '100%', padding: '0.8rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description / Requirements</label>
                            <textarea
                                className="input-field"
                                value={newJob.description}
                                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                placeholder={labels.descPlaceholder}
                                rows="4"
                                style={{ width: '100%', padding: '0.8rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="btn btn-secondary"
                                style={{ padding: '0.8rem 1.5rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateJob}
                                className="btn btn-primary"
                                disabled={!newJob.company || !newJob.jobTitle}
                                style={{ padding: '0.8rem 1.5rem' }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default JobDashboard;

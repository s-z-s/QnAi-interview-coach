import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

const JobDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', jobTitle: '', description: '' });

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
            alert("Failed to create job");
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Applications</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your preparation for specific roles</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                    + Add New Job
                </button>
            </div>

            {/* Stats Summary could go here */}

            {/* Jobs Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Jobs...</div>
            ) : jobs.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
                    <h3>No Job Applications Yet</h3>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Add a job description to start practicing tailored questions.</p>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary">Add Your First Job</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {jobs.map(job => (
                        <div key={job._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{job.jobTitle}</h3>
                                <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{job.company}</div>
                            </div>

                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                flex: 1
                            }}>
                                {job.description || 'No description provided'}
                            </p>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => navigate(`/job/${job._id}`)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, textAlign: 'center' }}
                                >
                                    Manage & Practice
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Job Modal (Custom Implementation since Modal component is for alerts mostly, or reuse?) */}
            {/* The Modal component I made is simple confirmation. I might need a more complex one or just overlay here. */}
            {/* I'll build a simple form overlay here for speed */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <h2 style={{ marginTop: 0 }}>Add Job Application</h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newJob.company}
                                onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                                placeholder="e.g. Google"
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Title</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newJob.jobTitle}
                                onChange={e => setNewJob({ ...newJob, jobTitle: e.target.value })}
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Description</label>
                            <textarea
                                className="input-field"
                                rows="5"
                                value={newJob.description}
                                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                placeholder="Paste the full job description here..."
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleCreateJob} className="btn btn-primary" disabled={!newJob.company || !newJob.jobTitle}>Create Job</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default JobDashboard;

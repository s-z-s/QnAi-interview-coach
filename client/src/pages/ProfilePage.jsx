import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        purpose: 'Job Interview',
        cvText: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setProfile(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', profile.name);
        formData.append('purpose', profile.purpose);
        formData.append('cvText', profile.cvText);

        const fileInput = document.getElementById('resume-upload');
        if (fileInput && fileInput.files[0]) {
            formData.append('resume', fileInput.files[0]);
        }

        setUploading(true);
        try {
            const res = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            updateUser(res.data); // Update global context
            setIsEditing(false);
            setModalContent({
                title: 'Success',
                message: 'Your profile has been updated successfully!',
                type: 'success'
            });
            setShowModal(true);
        } catch (error) {
            setModalContent({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update profile',
                type: 'danger'
            });
            setShowModal(true);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>Loading Profile...</div>;

    const styles = {
        container: {
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem 1rem',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--glass-border)'
        },
        title: {
            margin: 0,
            fontSize: '2.5rem',
            color: 'var(--text-primary)'
        },
        subtitle: {
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            marginTop: '0.5rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
        },
        label: {
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
        },
        valueBox: {
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--glass-border)',
            fontSize: '1.2rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
        },
        cvSection: {
            marginTop: '2rem'
        },
        cvBox: {
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid var(--glass-border)',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            fontSize: '0.9rem',
            color: '#e2e8f0'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        editButton: {
            fontSize: '1.1rem',
            padding: '0.8rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        actions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--glass-border)'
        }
    };

    return (
        <div style={styles.container}>
            <div className="glass-panel" style={{ padding: '3rem' }}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Your Profile</h1>
                        <p style={styles.subtitle}>Manage your personal details and interview goals</p>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary"
                            style={styles.editButton}
                        >
                            <span>✏️</span> Edit Profile
                        </button>
                    )}
                </div>

                {isEditing ? (
                    /* EDIT MODE */
                    <form onSubmit={handleProfileUpdate}>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name || ''}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Primary Goal</label>
                                <select
                                    value={profile.purpose || 'Job Interview'}
                                    onChange={(e) => setProfile({ ...profile, purpose: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                                >
                                    <option value="Job Interview">Job Interview</option>
                                    <option value="College Interview">College Interview</option>
                                    <option value="Scholarship Interview">Scholarship Interview</option>
                                    <option value="General Practice">General Practice</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ ...styles.cvSection, background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1rem' }}>
                            <label style={{ ...styles.label, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Resume / CV</label>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Upload New PDF</label>
                                <input
                                    type="file"
                                    id="resume-upload"
                                    accept=".pdf"
                                    style={{ width: '100%', padding: '0.5rem' }}
                                />
                            </div>

                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Extracted Text (Editable)</label>
                            <textarea
                                rows="12"
                                value={profile.cvText || ''}
                                onChange={(e) => setProfile({ ...profile, cvText: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.6',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text-primary)'
                                }}
                                placeholder="CV text content..."
                            />
                        </div>

                        <div style={styles.actions}>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="btn btn-secondary"
                                style={{ padding: '1rem 2rem', fontSize: '1rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={uploading}
                                style={{ padding: '1rem 2rem', fontSize: '1rem' }}
                            >
                                {uploading ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* VIEW MODE */
                    <div>
                        <div style={styles.grid}>
                            <div>
                                <div style={styles.label}>Full Name</div>
                                <div style={styles.valueBox}>{profile.name}</div>
                            </div>
                            <div>
                                <div style={styles.label}>Email Address</div>
                                <div style={styles.valueBox}>{profile.email}</div>
                            </div>
                            <div>
                                <div style={styles.label}>Primary Goal</div>
                                <div style={{
                                    ...styles.valueBox,
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    color: '#60a5fa',
                                    borderColor: 'rgba(59, 130, 246, 0.3)',
                                    display: 'inline-block',
                                    padding: '0.5rem 1.5rem'
                                }}>
                                    {profile.purpose}
                                </div>
                            </div>
                        </div>

                        <div style={styles.cvSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                                    <h3 style={{ margin: 0 }}>Resume / CV Content</h3>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                >
                                    Upload New PDF
                                </button>
                            </div>

                            <div style={styles.cvBox}>
                                {profile.cvText ? profile.cvText : (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>No CV text available</p>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            style={{ color: 'var(--accent-color)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}
                                        >
                                            Click Edit to upload one
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Success/Error Modal */}
            <Modal
                isOpen={showModal}
                title={modalContent.title}
                message={modalContent.message}
                type={modalContent.type}
                onConfirm={() => setShowModal(false)}
                confirmText={modalContent.type === 'success' ? 'Great!' : 'Close'}
            />
        </div>
    );
};

export default ProfilePage;

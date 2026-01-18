import { useState, useEffect } from 'react';
import api from '../services/api';

const ProfilePage = () => {
    const [profile, setProfile] = useState({ cvText: '' });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

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
        // formData.append('jobDescription', profile.jobDescription); // Removed
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
            alert('Profile Saved Successfully!');
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Your Profile</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Keep your CV and Job Description up to date for the best AI interview experience.
                </p>

                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Job Description section removed as it is now managed per Job Application */}

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Resume / CV</label>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <input type="file" id="resume-upload" accept=".pdf" className="btn btn-secondary" style={{ width: '100%' }} />
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>OR</span>
                        </div>

                        <textarea
                            rows="10"
                            value={profile.cvText || ''}
                            onChange={(e) => setProfile({ ...profile, cvText: e.target.value })}
                            placeholder="Extracted Resume text will appear here..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={uploading} style={{ minWidth: '150px' }}>
                            {uploading ? 'Parsing & Saving...' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ProfilePage;

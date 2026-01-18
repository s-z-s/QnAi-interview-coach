import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const Layout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Modal
                isOpen={showLogoutModal}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutModal(false)}
                confirmText="Sign Out"
                type="danger"
            />

            {/* Navigation Bar */}
            <nav className="glass-panel" style={{
                margin: '1rem',
                padding: '0.8rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '1rem'
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>QnAi</Link>

                    {/* Nav Links */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/" style={{
                            color: isActive('/') ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: isActive('/') ? 'bold' : 'normal',
                            transition: 'color 0.2s',
                            padding: '0.5rem',
                        }}>
                            Dashboard
                        </Link>
                        <Link to="/profile" style={{
                            color: isActive('/profile') ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: isActive('/profile') ? 'bold' : 'normal',
                            transition: 'color 0.2s',
                            padding: '0.5rem',
                        }}>
                            Profile
                        </Link>
                        <Link to="/history" style={{
                            color: isActive('/history') ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: isActive('/history') ? 'bold' : 'normal',
                            transition: 'color 0.2s',
                            padding: '0.5rem',
                        }}>
                            History
                        </Link>
                    </div>
                </div>

                {/* Right Side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button
                        onClick={() => navigate('/interview/new')}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                    >
                        + New Interview
                    </button>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="btn"
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--error-color)'; e.currentTarget.style.color = 'var(--error-color)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '0 1rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

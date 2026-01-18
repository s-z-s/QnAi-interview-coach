import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        },
        card: {
            width: '100%',
            maxWidth: '450px',
            padding: '2.5rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'var(--text-primary)'
        },
        error: {
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            textAlign: 'center'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)'
        },
        input: {
            width: '100%',
            padding: '0.8rem',
            fontSize: '1rem'
        },
        button: {
            width: '100%',
            padding: '1rem',
            marginTop: '1rem',
            fontSize: '1.1rem'
        },
        footer: {
            marginTop: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
        },
        link: {
            color: 'var(--accent-color)',
            fontWeight: '600',
            marginLeft: '0.5rem'
        }
    };

    return (
        <div style={styles.container}>
            <div className="glass-panel" style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            className="input-field"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={styles.button} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?
                    <Link to="/register" style={styles.link}>Register</Link>
                </p>
            </div>
        </div>
    );
}

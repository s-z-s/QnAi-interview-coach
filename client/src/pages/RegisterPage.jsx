import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [purpose, setPurpose] = useState('Job Interview');

    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(email, password, name, purpose);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
            marginBottom: '1rem'
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
            marginTop: '1.5rem',
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
                <h2 style={styles.title}>Join QnAi</h2>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            className="input-field"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
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
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Purpose</label>
                        <select
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            style={styles.input}
                            className="input-field"
                        >
                            <option value="Job Interview">Job Interview</option>
                            <option value="College Interview">College Interview</option>
                            <option value="Scholarship Interview">Scholarship Interview</option>
                            <option value="General Practice">General Practice</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary" style={styles.button}>
                        Create Account
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?
                    <Link to="/login" style={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
}

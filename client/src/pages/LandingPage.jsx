import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>QnAi</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {user ? (
                        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">Login</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                textAlign: 'center',
                padding: '4rem 1rem 6rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <div className="animate-float" style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '2rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>
                    ✨ AI-Powered Interview Coach
                </div>

                <h1 style={{ fontSize: '3.5rem', maxWidth: '800px', lineHeight: 1.1 }}>
                    Master Your Interview <br />
                    <span className="text-gradient">With AI Confidence.</span>
                </h1>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6 }}>
                    Practice with realistic AI interviewers, get instant feedback on your answers, and track your progress to land your dream job, college spot, or scholarship.
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Link
                        to={user ? "/dashboard" : "/register"}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                    >
                        {user ? "Go to Dashboard" : "Start Practicing Now"}
                    </Link>
                    <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Learn More
                    </a>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="container" style={{ padding: '4rem 1rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Choose QnAi?</h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Feature 1 */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎙️</div>
                        <h3>Real-time Voice Analysis</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Speak naturally to our AI. We transcribe and analyze your delivery, tone, and content instantly.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
                        <h3>Tailored to Your Goal</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Whether it's a Tech Job, College Admission, or Scholarship, the AI adapts its persona to interview you.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
                        <h3>Detailed Feedback</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Get scored on every answer. Understand your strengths and weaknesses with actionable improvements.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '4rem 1rem', background: 'rgba(0,0,0,0.2)' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div className="glass-panel" style={{
                                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '50%', flexShrink: 0
                            }}>1</div>
                            <div>
                                <h3>Create Your Profile</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Upload your CV and set your primary goal (Job, College, etc).</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div className="glass-panel" style={{
                                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '50%', flexShrink: 0
                            }}>2</div>
                            <div>
                                <h3>Start a Session</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>The AI reads your documents and starts a voice-based interview simulation.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div className="glass-panel" style={{
                                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '50%', flexShrink: 0
                            }}>3</div>
                            <div>
                                <h3>Review & Improve</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Receive a comprehensive report card with scoring and tips after every session.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '6rem 1rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{
                    maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)'
                }}>
                    <h2>Ready to Ace Your Next Interview?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.2rem' }}>
                        Join thousands of candidates who are leveling up their communication skills with QnAi.
                    </p>
                    <Link
                        to={user ? "/dashboard" : "/register"}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2.5rem', fontSize: '1.2rem' }}
                    >
                        {user ? "Go to Dashboard" : "Get Started for Free"}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)' }}>
                <p>&copy; 2026 QnAi. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;

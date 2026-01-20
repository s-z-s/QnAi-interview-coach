import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const LandingPage = () => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % 4);
        }, 4000); // 4 seconds per slide
        return () => clearInterval(interval);
    }, []);

    const styles = {
        nav: {
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            transition: 'all 0.3s ease',
            background: scrolled ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
        },
        hero: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '6rem 1rem',
            position: 'relative',
            overflow: 'hidden'
        },
        blob: {
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(168,85,247,0.05) 70%, transparent 100%)',
            borderRadius: '50%',
            zIndex: -1,
            animation: 'pulse 10s infinite alternate'
        },
        featureCard: {
            padding: '2rem',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
            height: '100%'
        },
        stepCard: {
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
        },
        stepNumber: {
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            borderRadius: '50%',
            flexShrink: 0,
            background: 'var(--glass-bg)',
            border: '2px solid var(--accent-color)',
            boxShadow: '0 0 15px rgba(59,130,246,0.3)',
            zIndex: 2
        },
        line: {
            position: 'absolute',
            left: '29px',
            top: '0',
            bottom: '-2rem',
            width: '2px',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Inline Styles for Keyframe Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.2); opacity: 0.8; }
                }
                .stagger-1 { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; animation-delay: 0.1s; }
                .stagger-2 { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; animation-delay: 0.3s; }
                .stagger-3 { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; animation-delay: 0.5s; }
                .hover-card:hover { transform: translateY(-10px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); border-color: var(--accent-color); }
            `}</style>

            {/* Navbar */}
            <nav style={styles.nav}>
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
            <header style={styles.hero}>
                <div style={styles.blob}></div>

                <div className="stagger-1">
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '2rem',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem'
                    }}>
                        ✨ AI-Powered Interview Coach
                    </div>
                </div>

                <h1 className="stagger-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', maxWidth: '900px', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                    Ace Your Interview with <br />
                    <span className="text-gradient">Real-Time AI Confidence.</span>
                </h1>

                <p className="stagger-3" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    Practice with realistic AI agents, get instant scored feedback, and track your progress. Whether it's for a Job, College, or Scholarship — we get you ready.
                </p>

                <div className="stagger-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link
                        to={user ? "/dashboard" : "/register"}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}
                    >
                        {user ? "Go to Dashboard" : "Start Practicing Now"}
                    </Link>
                    <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem' }}>
                        See Features
                    </a>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="container" style={{ padding: '6rem 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why Candidates Choose QnAi</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Everything you need to go from nervous to hired.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {[
                        { icon: '🎯', title: 'Application Dashboard', desc: 'Track specific jobs, college applications, or scholarships. Manage your prep for each goal separately.' },
                        { icon: '🔮', title: 'Smart Predictions', desc: 'Paste a job description and AI will generate the 10 most probable questions you will be asked.' },
                        { icon: '🎙️', title: 'Practice Loop', desc: 'Record your answer, get instant category-based scoring, add notes, and retry until you nail it.' },
                        { icon: '🤖', title: 'Realistic Mock Interviews', desc: 'Simulate the full pressure of an interview with a voice-based AI agent that adapts to your resume.' },
                        { icon: '📊', title: '360° Analysis', desc: 'Get a detailed report card after every session with "Hiring Probability" and actionable feedback.' },
                        { icon: '💾', title: 'Persistent History', desc: 'Track your improvement over time. Review past recordings and scores to see how far you\'ve come.' }
                    ].map((feature, i) => (
                        <div key={i} className="glass-panel hover-card" style={styles.featureCard}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{feature.icon}</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Use Cases Slider */}
            <section style={{ padding: '6rem 1rem', overflow: 'hidden' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Tailored for Every Ambition</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>QnAi adapts to your specific goal.</p>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                        <div style={{
                            display: 'flex',
                            overflow: 'hidden',
                            borderRadius: '1rem',
                            border: '1px solid var(--glass-border)',
                            position: 'relative'
                        }}>
                            <div style={{
                                display: 'flex',
                                width: '100%',
                                transition: 'transform 0.5s ease-in-out',
                                transform: `translateX(-${activeSlide * 100}%)`
                            }}>
                                {[
                                    { title: 'Tech Job Interview', icon: '💻', desc: 'Crack coding interviews and behavioral rounds. "Tell me about a time you failed" — nailed it.', color: 'from-blue-500 to-cyan-500' },
                                    { title: 'College Admission', icon: '🎓', desc: 'Perfect for MBA, Undergrad, or Grad School interviews. Show your passion and potential.', color: 'from-purple-500 to-pink-500' },
                                    { title: 'Scholarship Application', icon: '🏆', desc: 'Stand out for Chevening, Fulbright, or Rhodes with clear, impactful storytelling.', color: 'from-amber-500 to-red-500' },
                                    { title: 'Visa Interview', icon: '✈️', desc: 'Prepare for F1, H1B, or Visitor visa interviews with confidence and clarity.', color: 'from-emerald-500 to-teal-500' }
                                ].map((useCase, i) => (
                                    <div key={i} style={{ minWidth: '100%', padding: '4rem 2rem', background: 'var(--glass-bg)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{useCase.icon}</div>
                                        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{useCase.title}</h3>
                                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>{useCase.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '2rem' }}>
                            {[0, 1, 2, 3].map((idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSlide(idx)}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: activeSlide === idx ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works (Timeline) */}
            <section style={{ padding: '6rem 1rem', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How It Works</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Four steps to interview mastery.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

                        {[
                            { num: '1', title: 'Create Your Profile', desc: 'Upload your CV/Resume and set your primary goal context (Job, College, etc).' },
                            { num: '2', title: 'Manage & Predict', desc: 'Add your target applications and let AI generate probable interview questions for them.' },
                            { num: '3', title: 'Targeted Practice', desc: 'Record answers for specific questions, analyze scores, and refine your strategy with notes.' },
                            { num: '4', title: 'Mock Interview', desc: 'Simulate the full experience with a voice-based AI agent and get a comprehensive analysis.' }
                        ].map((step, i, arr) => (
                            <div key={i} style={styles.stepCard}>
                                {i !== arr.length - 1 && <div style={styles.line}></div>}
                                <div style={styles.stepNumber}>{step.num}</div>
                                <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
                                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-color)' }}>{step.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '8rem 1rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{
                    maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to Ace Your Next Interview?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            Join thousands of candidates who are leveling up their communication skills with QnAi.
                        </p>
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            className="btn btn-primary"
                            style={{ padding: '1.2rem 3rem', fontSize: '1.3rem', borderRadius: '50px' }}
                        >
                            {user ? "Go to Dashboard" : "Get Started for Free"}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>QnAi</div>
                <p>&copy; 2026 QnAi. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;

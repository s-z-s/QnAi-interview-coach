import React from 'react';

const Modal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger", children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel" style={{
                padding: '2rem',
                minWidth: '350px',
                maxWidth: '90%',
                border: '1px solid var(--glass-border)',
                animation: 'slideUp 0.3s ease-out'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.4rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
                    {message}
                </p>
                {children}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="btn btn-secondary"
                            style={{ padding: '0.6rem 1.2rem' }}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="btn btn-primary"
                        style={{
                            padding: '0.6rem 1.2rem',
                            background: type === 'danger' ? 'var(--error-color)' :
                                type === 'success' ? 'var(--success-color)' :
                                    'var(--accent-color)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Modal;

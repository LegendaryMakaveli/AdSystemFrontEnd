import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useResetPasswordMutation } from '../apis/authApis';
import styles from "../styles/Login.module.css"

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    
    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: ""
    });
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await resetPassword({ 
                email: formData.email, 
                newPassword: formData.newPassword 
            }).unwrap();

            if (response.success) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            console.error('Reset password error:', err);
            const errorMessage = err?.data?.data || err?.data?.message || 'Email not found. Please check and try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginForm}>
                <Link to="/login">
                    <li className={styles.goBack}>Back to Login</li>
                </Link>

                <h2>Reset Password</h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    Enter your email and new password
                </p>

                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}

                <form onSubmit={handleResetPassword}>
                    <div className={styles.loginInput}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={styles.input}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.loginInput}>
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            className={styles.input}
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className={styles.loginInput}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={styles.input}
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.loginButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>

            <p className={styles.signupLink}>
                Remember your password? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default ForgotPassword;
import styles from "../../styles/Login.module.css";
import { useState } from 'react';
import { Link, useNavigate } from "react-router";
import { useLoginMutation } from "../../apis/authApis";

const Login = () => {
    const [login, { isError, error }] = useLoginMutation();
    const [capsLockOn, setCapsLockOn] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",    
        password: ""
    });
    const [loginError, setLoginError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const submitHandle = async (e) => {
        e.preventDefault();
        try {
            const response = await login(formData).unwrap();
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.userId);
            
            if (response.data.role === "ADMIN") {
                localStorage.setItem("userRole", "ADMIN");
                navigate("/admin");
                return;
            }

            localStorage.setItem("userRole", "buyer");
            navigate("/buyerDashboard");
            
        } catch (err) {
            console.error("Login failed:", err);

            const msg =
                err?.data?.message === "Invalid credentials"
                ? "Incorrect email or password."
                : err?.data?.message === "User not found"
                ? "No account found with this email."
                : err?.data?.message || "Login failed. Please try again.";

            setLoginError(msg);

            alert(msg);
        }
    };

    if(isError) return <p>Error loading the page</p>;
    if(error) return <p>Error!!!</p>;

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={submitHandle} className={styles.loginForm}>
                <Link to={"/"}><li className={styles.goBack}>Home</li></Link>
                <h2>Login</h2>
                {loginError && <p className={styles.errorMessage}>{loginError}</p>}
                <div className={styles.loginInput}>
                    <label htmlFor="email">Email</label>
                    <input
                        onChange={handleChange}
                        name="email"
                        className={styles.input}
                        type="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className={styles.loginInput}>
                    <label htmlFor="password">Password</label>

                    <div className={styles.passwordWrapper}>
                        <input
                            onChange={handleChange}
                            name="password"
                            className={styles.input}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            required
                            onKeyDown={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                            onKeyUp={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                            onBlur={() => setCapsLockOn(false)}
                        />

                        <button
                        type="button"
                        className={styles.toggleBtn}
                        onClick={() => setShowPassword((prev) => !prev)}
                        >
                        {showPassword ? "🙈" : "👁"}
                        </button>
                    </div>  
                    {capsLockOn && (
                        <p className={styles.warningText}>⚠️ Caps Lock is ON</p>
                    )}
                </div>
                <button type="submit" className={styles.loginButton} disabled={!formData.password || !formData.email}>Login</button>
            </form>
            <p className={styles.signupLink}>
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
    );
};

export default Login;
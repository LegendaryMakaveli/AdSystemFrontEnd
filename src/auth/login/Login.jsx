import styles from "../login/Login.module.css";
import { useState } from 'react';
import { Link, useNavigate } from "react-router";
import { useLoginMutation } from "../../apis/authApis";

const Login = () => {
    const [login, { isError, error }] = useLoginMutation();
    const navigate = useNavigate();
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
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err);
            setLoginError(err.data?.message || "Login failed. Please check your credentials.");
        }
    };

    if(isError) return <p>Error loading the page</p>
    if(error) return <p>Error!!!</p>
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
                    <input
                        onChange={handleChange}
                        name="password"
                        className={styles.input}
                        type="password"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button type="submit" className={styles.loginButton}>Login</button>
            </form>
            <p className={styles.signupLink}>
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
    );
};

export default Login;

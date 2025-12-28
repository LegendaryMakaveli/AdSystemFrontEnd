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
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const submitHandle = async (e) => {
        e.preventDefault();
        try {
            const response = await login(formData).unwrap();
            localStorage.setItem("token", response.data.token);
            

            setShowRoleSelection(true);
        } catch (err) {
            console.error("Login failed:", err);
            setLoginError(err.data?.message || "Login failed. Please check your credentials.");
        }
    };

    const handleRoleSubmit = () => {
        if (!selectedRole) {
            alert("Please select a role");
            return;
        }

        localStorage.setItem("userRole", selectedRole);

        if (selectedRole === "buyer") {
            navigate("/buyerDashboard");
        } else if (selectedRole === "seller") {
            navigate("/dashboard");
        }
    };

    if(isError) return <p>Error loading the page</p>
    if(error) return <p>Error!!!</p>

    // Show role selection after login
    if (showRoleSelection) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.roleSelectionForm}>
                    <h2>Are you buying or selling?</h2>
                    <p>Choose your role to continue</p>

                    <div className={styles.roleOptions}>
                        <label className={selectedRole === "seller" ? styles.roleSelected : ""}>
                            <input
                                type="radio"
                                name="role"
                                value="seller"
                                checked={selectedRole === "seller"}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            />
                            <div className={styles.roleCard}>
                                <h3>🏪 Seller</h3>
                                <p>Post listings and manage ads</p>
                            </div>
                        </label>

                        <label className={selectedRole === "buyer" ? styles.roleSelected : ""}>
                            <input
                                type="radio"
                                name="role"
                                value="buyer"
                                checked={selectedRole === "buyer"}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            />
                            <div className={styles.roleCard}>
                                <h3>🛍️ Buyer</h3>
                                <p>Browse listings and contact sellers</p>
                            </div>
                        </label>
                    </div>

                    <button 
                        onClick={handleRoleSubmit} 
                        className={styles.loginButton}
                        disabled={!selectedRole}
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // Show login form
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
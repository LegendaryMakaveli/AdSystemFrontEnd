import { useState } from "react";
import { useNavigate } from "react-router";
import style from "../../styles/SignUp.module.css";
import { useSignupMutation } from "../../apis/authApis";
import { Link } from "react-router";

const SignUp = () => {
    const navigate = useNavigate();
    const [signup, {isLoading}] = useSignupMutation();
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        Address: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev,[name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({...prev,[name]: ""
        }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required";
        }
        
        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required";
        }
        
        if (!formData.Address.trim()) {
            errors.Address = "Address is required";
        }
        
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        }
        
        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        
        if (!formData.confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const {confirmPassword, ...signupData } = formData;
            console.log("sending data:", signupData)
            const result = await signup(signupData).unwrap();
            console.log(result)
            localStorage.setItem("userEmail", formData.email);
            navigate("/buyerDashboard");
        } catch (err) {
            console.error("Signup failed:", err);
            console.log('Full error:', err);
            console.log('Error data:', err.data);
            setFormErrors({ 
                submit: err?.data?.message || "Signup failed. Please try again." 
            });
        }
    };

    return (
        <>
            <form className={style.formContainer} onSubmit={handleSubmit}>
                <Link to={"/"}><li className={style.goBack}>Home</li></Link>
                <h2>Sign Up</h2>
                
                {formErrors.submit && (
                    <div className={style.errorMessage}>{formErrors.submit}</div>
                )}
                
                <div className={style.labelInput}>
                    <label htmlFor="firstName">First Name</label>
                    <input 
                        type="text" 
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                    />
                    {formErrors.firstName && (
                        <span className={style.error}>{formErrors.firstName}</span>
                    )}
                </div>
                
                <div className={style.labelInput}>
                    <label htmlFor="lastName">Last Name</label>
                    <input 
                        type="text" 
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                    />
                    {formErrors.lastName && (
                        <span className={style.error}>{formErrors.lastName}</span>
                    )}
                </div>
                
                <div className={style.labelInput}>
                    <label htmlFor="address">Address</label>
                    <input 
                        type="text" 
                        id="Address"
                        name="Address"
                        value={formData.Address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                    />
                    {formErrors.address && (
                        <span className={style.error}>{formErrors.address}</span>
                    )}
                </div>
                
                <div className={style.labelInput}>
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                        <span className={style.error}>{formErrors.email}</span>
                    )}
                </div>
                
                <div className={style.labelInput}>
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />
                    {formErrors.password && (
                        <span className={style.error}>{formErrors.password}</span>
                    )}
                </div>
                
                <div className={style.labelInput}>
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                    />
                    {formErrors.confirmPassword && (
                        <span className={style.error}>{formErrors.confirmPassword}</span>
                    )}
                </div>
                
                <button 
                    type="submit" 
                    className={style.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? "Signing up..." : "Sign Up"}
                </button>
                <p className={style.signupLink}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </>
    );
};

export default SignUp;
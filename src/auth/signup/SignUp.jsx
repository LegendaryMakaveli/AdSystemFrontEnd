import { useState } from "react";
import { useNavigate } from "react-router";
import style from "../../styles/SignUp.module.css";
import { useSignupMutation } from "../../apis/authApis";
import { Link } from "react-router";

const SignUp = () => {
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    Address: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [formErrors, setFormErrors] = useState({});

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    upper: false,
    lower: false,
    special: false
  });

  const [passwordLevel, setPasswordLevel] = useState("weak");

  const checkPasswordStrength = (password) => {
    const result = {
      length: password.length >= 8,
      number: /\d/.test(password),
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      special: /[@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.?/~`]/.test(password)
    };

    const score = Object.values(result).filter(Boolean).length;

    if (score <= 3) setPasswordLevel("weak");
    else if (score === 5 || score === 6) setPasswordLevel("medium");
    else setPasswordLevel("strong");

    return result;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim())
      errors.firstName = "First name is required";

    if (!formData.lastName.trim())
      errors.lastName = "Last name is required";

    if (!formData.Address.trim())
      errors.Address = "Address is required";

    if (!formData.email.trim())
      errors.email = "Email is required";

    if (!formData.password)
      errors.password = "Password is required";

    if (!formData.confirmPassword)
      errors.confirmPassword = "Please confirm password";
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const isPasswordValid =
    passwordStrength.length &&
    passwordStrength.number &&
    passwordStrength.upper &&
    passwordStrength.lower &&
    passwordStrength.special;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;

      const result = await signup(signupData).unwrap();
      console.log(result);
      localStorage.setItem("userEmail", formData.email);
      navigate("/buyerDashboard");
    } catch (err) {
      setFormErrors({
        submit: err?.data?.message || "Signup failed. Please try again."
      });
    }
  };

  return (
    <>
      <form className={style.formContainer} onSubmit={handleSubmit}>
        <Link to={"/"}>
          <li className={style.goBack}>Home</li>
        </Link>

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
          />
          {formErrors.lastName && (
            <span className={style.error}>{formErrors.lastName}</span>
          )}
        </div>

        
        <div className={style.labelInput}>
          <label htmlFor="Address">Address</label>
          <input
            type="text"
            id="Address"
            name="Address"
            value={formData.Address}
            onChange={handleChange}
          />
          {formErrors.Address && (
            <span className={style.error}>{formErrors.Address}</span>
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
          />
          {formErrors.email && (
            <span className={style.error}>{formErrors.email}</span>
          )}
        </div>

        
        <div className={style.labelInput}>
          <label htmlFor="password">Password</label>

          <div className={style.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className={style.toggleBtn}
              onClick={() => setShowPassword((prev) => !prev)}
              >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>  

          <div className={style.passwordStrengthBox}>
            <div
              className={`${style.strengthBar} ${
                passwordLevel === "weak"
                  ? style["strength-weak"]
                  : passwordLevel === "medium"
                  ? style["strength-medium"]
                  : style["strength-strong"]
              }`}
            />

            <ul className={style.ruleList}>
              <li
                className={`${style.ruleItem} ${
                  passwordStrength.length ? style.valid : ""
                }`}
              >
                ✓ At least 6 characters
              </li>
              <li
                className={`${style.ruleItem} ${
                  passwordStrength.number ? style.valid : ""
                }`}
              >
                ✓ Contains a number
              </li>
              <li
                className={`${style.ruleItem} ${
                  passwordStrength.upper ? style.valid : ""
                }`}
              >
                ✓ Contains uppercase letter
              </li>
              <li
                className={`${style.ruleItem} ${
                  passwordStrength.lower ? style.valid : ""
                }`}
              >
                ✓ Contains lowercase letter
              </li>
              <li
                className={`${style.ruleItem} ${
                  passwordStrength.special ? style.valid : ""
                }`}
              >
                ✓ Contains special character
              </li>
            </ul>
          </div>

          {formErrors.password && (
            <span className={style.error}>{formErrors.password}</span>
          )}
        </div>

        
        <div className={style.labelInput}>
          <label htmlFor="confirmPassword">Confirm Password</label>

          <div className={style.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
            type="button"
            className={style.toggleBtn}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
            {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {formErrors.confirmPassword && (
            <span className={style.error}>{formErrors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className={style.submitButton}
          disabled={isLoading || !isPasswordValid}
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

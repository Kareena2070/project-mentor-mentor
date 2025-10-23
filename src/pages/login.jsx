import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import "./login.css";

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRegister, setIsRegister] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    role: "mentee",
    menteeCount: "",
    menteeEmails: [],
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLogin = () => {
    const e = {};
    if (!loginData.email) e.email = "Email is required";
    else if (!emailRegex.test(loginData.email)) e.email = "Email is invalid";
    if (!loginData.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e = {};
    if (!registerData.name) e.name = "Name is required";
    if (!registerData.role) e.role = "Role is required";
    if (registerData.role === 'mentor'){
      if (!registerData.menteeCount) e.menteeCount = "Please enter how many mentees you have";
      else if (isNaN(Number(registerData.menteeCount)) || Number(registerData.menteeCount) < 0) e.menteeCount = "Enter a valid number";
      else if (Number(registerData.menteeCount) > 5) e.menteeCount = "Limit exceeded (max 5)";
      const expected = Number(registerData.menteeCount) || 0
      if (expected === 0) {
        // zero mentees is allowed but no emails required
      } else {
        if (!Array.isArray(registerData.menteeEmails) || registerData.menteeEmails.length !== expected || registerData.menteeEmails.length > 5) {
          e.menteeEmails = `Please provide ${expected} mentee email address(es)`;
        } else {
          // validate each email
          const invalidIndex = registerData.menteeEmails.findIndex(em => !emailRegex.test(String(em).trim()))
          if (invalidIndex !== -1) e.menteeEmails = `Mentee email at position ${invalidIndex + 1} is invalid`;
        }
      }
    }
    if (!registerData.password) e.password = "Password is required";
    else if (registerData.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!registerData.confirmPassword)
      e.confirmPassword = "Confirm your password";
    else if (registerData.password !== registerData.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLoginSubmit = (ev) => {
    ev.preventDefault();
    if (!validateLogin()) return;
    // Simulate successful login: store auth flag
    localStorage.setItem('auth', 'true')
    setLoginData((p) => ({ ...p, password: "" }));
    // redirect back to where user wanted to go (if present)
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
  };

  const handleRegisterSubmit = (ev) => {
    ev.preventDefault();
    if (!validateRegister()) return;
  // Simulate successful registration and auto-login
  localStorage.setItem('auth', 'true')
  setRegisterData({ name: "", role: "mentee", menteeCount: "", menteeEmails: [], password: "", confirmPassword: "" });
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{isRegister ? "Create an account" : "Sign in"}</h2>

        <div className="toggle-buttons">
          <button
            onClick={() => {
              setErrors({});
              setIsRegister(false);
            }}
            aria-pressed={!isRegister}
          >
            Login
          </button>
          <button
            onClick={() => {
              setErrors({});
              setIsRegister(true);
            }}
            aria-pressed={isRegister}
          >
            Create account
          </button>
        </div>

        {!isRegister ? (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />
              {errors.password && (
                <div className="error">{errors.password}</div>
              )}
            </div>

            <div className="action-buttons">
              <button type="submit">Login</button>
              <button
                type="button"
                className="forgot-password"
                onClick={() => alert("Forgot password flow not implemented")}
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">I am a</label>
              <select
                id="reg-role"
                value={registerData.role}
                onChange={(e) =>
                  setRegisterData({ ...registerData, role: e.target.value })
                }
              >
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
              </select>
              {errors.role && <div className="error">{errors.role}</div>}
            </div>

            {registerData.role === 'mentor' && (
              <>
                <div className="form-group">
                  <label htmlFor="mentee-count">How many mentee(s) do you have?</label>
                  <input
                    id="mentee-count"
                    type="number"
                    value={registerData.menteeCount}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '') {
                        setRegisterData({ ...registerData, menteeCount: '', menteeEmails: [] });
                        setErrors((prev) => ({ ...prev, menteeCount: undefined }));
                        return;
                      }
                      let num = Math.max(0, Number(val));
                      const MAX = 5;
                      if (num > MAX) {
                        // set a visible error and cap the count and inputs to MAX
                        setErrors((prev) => ({ ...prev, menteeCount: 'Limit exceeded (max 5)' }));
                        num = MAX;
                      } else {
                        // clear any previous menteeCount error
                        setErrors((prev) => ({ ...prev, menteeCount: undefined }));
                      }
                      const current = Array.isArray(registerData.menteeEmails) ? registerData.menteeEmails.slice() : [];
                      while (current.length < num) current.push('');
                      while (current.length > num) current.pop();
                      setRegisterData({ ...registerData, menteeCount: String(num), menteeEmails: current });
                    }}
                  />
                  {errors.menteeCount && <div className="error">{errors.menteeCount}</div>}
                </div>
                {Array.isArray(registerData.menteeEmails) && registerData.menteeEmails.map((m, idx) => (
                  <div className="form-group" key={idx}>
                    <label htmlFor={`mentee-email-${idx}`}>Mentee email #{idx + 1}</label>
                    <input
                      id={`mentee-email-${idx}`}
                      type="email"
                      value={m}
                      onChange={(e) => {
                        const newArr = (registerData.menteeEmails || []).slice()
                        newArr[idx] = e.target.value
                        setRegisterData({ ...registerData, menteeEmails: newArr })
                      }}
                    />
                  </div>
                ))}
                {errors.menteeEmails && <div className="error">{errors.menteeEmails}</div>}
              </>
            )}

            <div className="form-group">
              <label htmlFor="reg-password">Create password</label>
              <input
                id="reg-password"
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />
              {errors.password && <div className="error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
              />
              {errors.confirmPassword && (
                <div className="error">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="action-buttons">
              <button type="submit">Create account</button>
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="back-button"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

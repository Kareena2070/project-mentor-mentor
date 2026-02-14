import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // router
  const navigate = useNavigate();

  const submitButton = (e) => {
    e.preventDefault();
    const res = login(email, password);
    // navigate to home on success
    if (res) navigate('/');
  };

  return (
    <div className="login-main">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">
          Login to continue your learning journey
        </p>

        <form onSubmit={submitButton} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
          
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

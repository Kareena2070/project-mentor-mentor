import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mentee");
  const [menteeEmail, setMenteeEmail] = useState("");
  const [expertise, setExpertise] = useState("");

  const navigate = useNavigate();

  const submitButton = (e) => {
    e.preventDefault();
    let expertiseArray = [];

    if (role === "mentor") {
      expertiseArray = expertise
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }

    const res = register(
      name,
      email,
      password,
      role,
      role === "mentor" ? menteeEmail : null,
      role === "mentor" ? expertiseArray : [],
    );
    if (res) navigate("/login");
  };

  return (
    <div className="register-main">
      <div className="register-card">
        <h1>Create Account</h1>
        <p className="register-subtitle">
          Start tracking your learning journey today
        </p>

        <form onSubmit={submitButton} className="register-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Role</label>
            <select
              className="custom-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="mentee">Mentee</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          {/* Mentor Extra Fields */}
          {role === "mentor" && (
            <>
              <div className="input-group">
                <label>Mentee Email</label>
                <input
                  type="email"
                  placeholder="Enter your mentee email"
                  value={menteeEmail}
                  onChange={(e) => setMenteeEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Expertise (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g React, Node, MongoDB"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  required
                />
              </div>
            </>
          )}

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-button">
            Register
          </button>

          <p>
            Already have account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;

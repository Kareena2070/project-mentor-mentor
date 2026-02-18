import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import axios from "axios";

const authContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      setUser(res.data);
      localStorage.setItem("mentee-mentor-user", JSON.stringify(res.data));
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      setUser(res.data);
      localStorage.setItem("mentee-mentor-user", JSON.stringify(res.data));
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      return false;
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("mentee-mentor-user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mentee-mentor-user");
  };

  return (
    <authContext.Provider value={{ user, login, register, logout }}>
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("AuthProvider is not wraps on main");
  }
  return context;
};

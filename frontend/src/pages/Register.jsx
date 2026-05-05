import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        form,
        { withCredentials: true }
      );
      localStorage.setItem("token", res.data.accessToken);
      navigate("/"); // redirect to profile
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial; }
        body { background: #fafafa; }
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .auth-card {
          background: white;
          padding: 40px;
          width: 350px;
          border: 1px solid #dbdbdb;
          border-radius: 8px;
          text-align: center;
        }
        .auth-card input {
          width: 100%;
          padding: 10px;
          margin: 8px 0;
          border: 1px solid #dbdbdb;
          border-radius: 4px;
        }
        .auth-card button {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: #0095f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .auth-card button:hover { background: #0077cc; }
        .auth-card p { margin-top: 15px; }
        .auth-card a { color: #0095f6; text-decoration: none; font-weight: bold; }
      `}</style>
    </div>
  );
}
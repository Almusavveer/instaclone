import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "hello.alex@gmail.com", password: "411" });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        form,
        { withCredentials: true }
      );
      // no localStorage – cookie is set automatically
      navigate("/");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <span className="brand-name">alexkyr.com</span>
          <span className="brand-tag">Kreative</span>
        </div>

        <h2>Welcome Back!</h2>
        <p className="subtitle">Enter Your Details Below</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-btn">Log in</button>
        </form>

        <div className="divider">or</div>

        <button className="google-btn">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Log in with Google
        </button>

        <p className="signup-prompt">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease;
        }

        .brand {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-name {
          font-size: 24px;
          font-weight: 700;
          color: #1e1e2f;
          letter-spacing: -0.5px;
          display: block;
        }

        .brand-tag {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
          display: block;
          font-weight: 500;
        }

        h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1e1e2f;
          text-align: center;
          margin-bottom: 8px;
        }

        .subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 28px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .input-group input {
          width: 100%;
          padding: 12px 16px;
          font-size: 15px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s ease;
          background: #f9fafb;
        }

        .input-group input:focus {
          outline: none;
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #4b5563;
        }

        .checkbox input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .forgot-link {
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .login-btn {
          width: 100%;
          background: #6366f1;
          color: white;
          border: none;
          padding: 12px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-bottom: 20px;
        }

        .login-btn:hover {
          background: #4f46e5;
        }

        .divider {
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
          margin: 20px 0;
          position: relative;
        }

        .divider::before,
        .divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: #e5e7eb;
        }

        .divider::before {
          left: 0;
        }

        .divider::after {
          right: 0;
        }

        .google-btn {
          width: 100%;
          background: white;
          border: 1.5px solid #e5e7eb;
          padding: 12px;
          font-size: 15px;
          font-weight: 500;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-bottom: 24px;
        }

        .google-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .signup-prompt {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .signup-prompt a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
        }

        .signup-prompt a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
          }
          h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
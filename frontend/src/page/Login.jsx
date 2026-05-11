import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import { useAuth } from "../context/auth_context";

export default function Login() {
  const { setCurrentUser } = useAuth();

  const [form, setForm] = useState({
    email: "hello.alex@gmail.com",
    password: "411",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginUser(form);

      console.log("Login Response:", data);

      const user = data.user;

      // ✅ Save in localStorage (for refresh persistence)
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Save in context (for instant UI update)
      setCurrentUser(user);

      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Login with ${provider} – integrate OAuth`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Login
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Welcome back! Please login.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }

            />
            <span className="text-sm text-gray-600">
              Remember me
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 text-center text-gray-400">
          or
        </div>

        {/* Social Login */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              handleSocialLogin("Google")
            }

            className="flex-1 border p-2 rounded-lg"
          >
            Google
          </button>

          <button
            onClick={() =>
              handleSocialLogin("GitHub")
            }

            className="flex-1 border p-2 rounded-lg"
          >
            GitHub
          </button>
        </div>

        {/* Register */}
        <p className="text-center text-sm mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
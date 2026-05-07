import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./page/Login";
import Register from "./page/Register";
import Profile from "./page/Profile";
import SinglePostPage from "./components/SinglePostPage";
import UserProfilePage from "./components/UserProfilePage";
import CreatePostPage from "./page/CreatePostPage";
// ✅ Protected Route Middleware – validates token before rendering page
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get("http://localhost:3000/api/auth/user", {
          withCredentials: true, // 👈 sends the cookie
        });
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("token"); // clear any leftover localStorage
        setIsAuthenticated(false);
      }
    };
    verify();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>; // or a spinner

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Protected route – only accessible with valid token */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/:postId"
        element={
          <ProtectedRoute>
            <SinglePostPage />
          </ProtectedRoute>
        }
      />
      // Inside Routes (protected)
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Redirect any unknown path to login or profile */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

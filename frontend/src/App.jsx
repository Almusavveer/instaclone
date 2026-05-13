// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";

import { useEffect, useState } from "react";

import axios from "axios";

// 📄 Pages
import Login from "./page/Login";
import Register from "./page/Register";
import Profile from "./page/Profile";
import CreatePostPage from "./page/CreatePostPage";
import EditProfile from "./page/EditProfile";
import FollowPage from "./page/FollowPage";
import EditPostPage from "./page/EditPostPage";
import ChatPage from "./page/ChatPage";

// 📄 Components
import SinglePostPage from "./components/SinglePostPage";
import UserProfilePage from "./components/UserProfilePage";

// ✅ Protected Route
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get("http://localhost:3000/api/auth/user", {
          withCredentials: true,
        });

        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("token");

        setIsAuthenticated(false);
      }
    };

    verify();
  }, []);

  // ⏳ Loading
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // ✅ Auth Check
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* 🏠 Home */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }

      />

      {/* 📄 Single Post */}
      <Route
        path="/post/:postId"
        element={
          <ProtectedRoute>
            <SinglePostPage />
          </ProtectedRoute>
        }

      />

      {/* ➕ Create Post */}
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        }

      />

      {/* ✏️ Edit Post */}
      <Route
        path="/edit-post"
        element={
          <ProtectedRoute>
            <EditPostPage />
          </ProtectedRoute>
        }

      />

      {/* 👤 User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }

      />

      {/* 👥 Follow Page */}
      <Route
        path="/follow"
        element={
          <ProtectedRoute>
            <FollowPage />
          </ProtectedRoute>
        }

      />

      {/* ✏️ Edit Profile */}
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }

      />

      {/* 💬 Chat Page */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }

      />

      {/* ❌ Unknown Routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

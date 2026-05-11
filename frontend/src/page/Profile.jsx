// src/pages/Profile.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import axios from "axios";

import ProfileCard from "../components/ProfileCard";
import FeedPage from "./FeedPage";
import SearchBar from "../components/SearchBar";

const Profile = () => {
  const [user, setUser] =
    useState({});

  const navigate =
    useNavigate();

  // ✅ Get user
  useEffect(() => {
    async function getUser() {
      try {
        const res =
          await axios.get(
            "http://localhost:3000/api/auth/user",
            {
              withCredentials: true,
            }
          );

        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    }

    getUser();
  }, []);

  // ✅ Logout
  const handleLogout =
    async () => {
      try {
        await axios.post(
          "http://localhost:3000/api/auth/logout",
          {},
          {
            withCredentials: true,
          }
        );

        // 🗑️ Remove token
        localStorage.removeItem(
          "token"
        );

        // 🔁 Redirect login
        navigate("/login");
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className="lg:w-1/3 xl:w-1/4">

            <div className="sticky top-6 space-y-4">

              {/* Profile Card */}
              <ProfileCard user={user} />

              {/* Buttons */}
              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">

                {/* Edit Profile */}
                <button
                  onClick={() =>
                    navigate(
                      "/edit-profile"
                    )
                  }
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
                >
                  ✏️ Update Profile
                </button>

                {/* Logout */}
                <button
                  onClick={
                    handleLogout
                  }
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition"
                >
                  🚪 Logout
                </button>

              </div>

            </div>

          </aside>

          {/* Feed */}
          <main className="flex-1">

            {/* Top Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex justify-between items-center flex-wrap gap-2">

              <h2 className="text-xl font-bold text-gray-800">
                Feed
              </h2>

              <div className="flex gap-2">

                {/* Create Post */}
                <Link
                  to="/create-post"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                  + New Post
                </Link>

                {/* Edit Profile */}
                <Link
                  to="/edit-profile"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Edit Profile
                </Link>

              </div>

            </div>

            {/* Feed */}
            <FeedPage />

          </main>

        </div>

      </div>
    </div>
  );
};

export default Profile;
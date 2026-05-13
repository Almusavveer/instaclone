import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import ProfileCard from "../components/ProfileCard";
import FeedPage from "./FeedPage";
import SearchBar from "../components/SearchBar";

const Profile = () => {
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);

  const navigate = useNavigate();

  // =========================
  // GET USER
  // =========================
  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/auth/user",
          { withCredentials: true }
        );

        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    }

    getUser();
  }, []);

  // =========================
  // GET NOTIFICATIONS
  // =========================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/chat/notifications",
          { withCredentials: true }
        );

        setNotifications(res.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // ACCEPT REQUEST
  // =========================
  const acceptRequest = async (requestId) => {
    try {
      await axios.post(
        "http://localhost:3000/api/chat/accept-request",
        { requestId },
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.filter((n) => n._id !== requestId)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ========================= */}
          {/* SIDEBAR */}
          {/* ========================= */}
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="sticky top-6 space-y-4">

              <ProfileCard user={user} />

              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">

                <button
                  onClick={() => navigate("/edit-profile")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
                >
                  ✏️ Update Profile
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition"
                >
                  💬 Open Chat
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition"
                >
                  🚪 Logout
                </button>

              </div>

            </div>
          </aside>

          {/* ========================= */}
          {/* MAIN FEED */}
          {/* ========================= */}
          <main className="flex-1">

            {/* TOP BAR */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex justify-between items-center flex-wrap gap-2">

              <h2 className="text-xl font-bold text-gray-800">
                Feed
              </h2>

              <div className="flex items-center gap-3 flex-wrap">

                {/* ========================= */}
                {/* NOTIFICATION BELL */}
                {/* ========================= */}
                <div className="relative">

                  <button
                    onClick={() => setOpenNotif(!openNotif)}
                    className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200"
                  >
                    🔔

                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* DROPDOWN */}
                  {openNotif && (
                    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border z-50">

                      <div className="p-3 border-b font-semibold">
                        Chat Requests
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-4 text-gray-500">
                          No requests
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className="p-3 border-b flex justify-between items-center"
                          >

                            <div>
                              <p className="font-medium text-gray-800">
                                {n.sender?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Wants to chat with you
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                acceptRequest(n._id)
                              }

                              className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Accept
                            </button>

                          </div>
                        ))
                      )}

                    </div>
                  )}

                </div>

                {/* CHAT */}
                <Link
                  to="/chat"
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
                >
                  💬 Chat
                </Link>

                {/* CREATE POST */}
                <Link
                  to="/create-post"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                  + New Post
                </Link>

                {/* EDIT PROFILE */}
                <Link
                  to="/edit-profile"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Edit Profile
                </Link>

              </div>
            </div>

            {/* SEARCH */}
            <div className="mb-4">
              <SearchBar />
            </div>

            {/* FEED */}
            <FeedPage />

          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
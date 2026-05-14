import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import {
  FiEdit2,
  FiLogOut,
  FiBell,
  FiMessageCircle,
  FiPlus,
  FiCheck,
} from "react-icons/fi";

import ProfileCard from "../components/ProfileCard";
import FeedPage from "./FeedPage";
import SearchBar from "../components/SearchBar";

const Profile = () => {
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);

  const navigate = useNavigate();

  // =========================
  // SOUND REF
  // =========================
  const audioRef = useRef(null);

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
  // ENABLE NOTIFICATION
  // =========================
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // =========================
  // GET NOTIFICATIONS
  // =========================
  useEffect(() => {

    let previousLength = 0;

    const fetchNotifications = async () => {
      try {

        const res = await axios.get(
          "http://localhost:3000/api/chat/notifications",
          { withCredentials: true }
        );

        const newNotifications =
          res.data.data || [];

        // =========================
        // PLAY SOUND + CHROME POPUP
        // =========================
        if (
          newNotifications.length >
          previousLength
        ) {

          // PLAY SOUND
          if (audioRef.current) {

            audioRef.current.play()
              .catch((err) =>
                console.log(err)
              );
          }

          // CHROME NOTIFICATION
          if (
            Notification.permission ===
            "granted"
          ) {

            const latest =
              newNotifications[0];

            new Notification(
              "New Chat Request 💬",
              {
                body: `${latest?.sender?.name} sent you a chat request`,
                icon:
                  latest?.sender?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/219/219983.png",
              }
            );
          }
        }

        previousLength =
          newNotifications.length;

        setNotifications(
          newNotifications
        );

      } catch (err) {
        console.log(err);
      }
    };

    // FIRST FETCH
    fetchNotifications();

    // AUTO CHECK EVERY 5s
    const interval =
      setInterval(
        fetchNotifications,
        5000
      );

    return () =>
      clearInterval(interval);

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
  const acceptRequest = async (
    requestId
  ) => {

    try {

      await axios.post(
        "http://localhost:3000/api/chat/accept-request",
        { requestId },
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.filter(
          (n) =>
            n._id !== requestId
        )
      );

    } catch (err) {

      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-6 px-4 sm:px-6 lg:px-8">

      {/* ========================= */}
      {/* AUDIO */}
      {/* ========================= */}
      <audio
        ref={audioRef}
        src="https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3"
        preload="auto"
      />

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ========================= */}
          {/* SIDEBAR */}
          {/* ========================= */}
          <aside className="lg:w-1/3 xl:w-1/4">

            <div className="sticky top-6 space-y-4">

              <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
                <ProfileCard user={user} />
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl p-4 space-y-3">

                <button
                  onClick={() =>
                    navigate(
                      "/edit-profile"
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-2xl font-medium transition duration-300"
                >
                  <FiEdit2 size={18} />
                  Update Profile
                </button>

                <button
                  onClick={() =>
                    navigate("/chat")
                  }
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-2xl font-medium transition duration-300"
                >
                  <FiMessageCircle size={18} />
                  Open Chat
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 py-3 rounded-2xl font-medium transition duration-300"
                >
                  <FiLogOut size={18} />
                  Logout
                </button>

              </div>

            </div>
          </aside>

          {/* ========================= */}
          {/* MAIN FEED */}
          {/* ========================= */}
          <main className="flex-1">

            {/* TOP BAR */}
            <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl p-4 mb-4 flex justify-between items-center flex-wrap gap-3">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Your Feed
                </h2>

                <p className="text-gray-400 text-sm">
                  Welcome back,{" "}
                  {user?.name ||
                    "User"}
                </p>

              </div>

              <div className="flex items-center gap-3 flex-wrap">

                {/* ========================= */}
                {/* NOTIFICATION BELL */}
                {/* ========================= */}
                <div className="relative">

                  <button
                    onClick={() =>
                      setOpenNotif(
                        !openNotif
                      )
                    }
                    className="relative bg-[#1e293b] hover:bg-[#334155] p-3 rounded-2xl transition"
                  >

                    <FiBell size={20} />

                    {notifications.length >
                      0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {
                          notifications.length
                        }
                      </span>
                    )}
                  </button>

                  {/* DROPDOWN */}
                  {openNotif && (
                    <div className="absolute right-0 mt-3 w-80 bg-[#111827] border border-gray-700 shadow-2xl rounded-2xl overflow-hidden z-50">

                      <div className="p-4 border-b border-gray-700 font-semibold text-white">
                        Chat Requests
                      </div>

                      {notifications.length ===
                      0 ? (
                        <div className="p-4 text-gray-400 text-sm">
                          No new requests
                        </div>
                      ) : (
                        notifications.map(
                          (n) => (
                            <div
                              key={
                                n._id
                              }
                              className="p-4 border-b border-gray-800 flex justify-between items-center hover:bg-[#1e293b] transition"
                            >

                              <div>

                                <p className="font-medium text-white">
                                  {
                                    n
                                      .sender
                                      ?.name
                                  }
                                </p>

                                <p className="text-xs text-gray-400">
                                  Wants to
                                  chat with
                                  you
                                </p>

                              </div>

                              <button
                                onClick={() =>
                                  acceptRequest(
                                    n._id
                                  )
                                }
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-xs transition"
                              >
                                <FiCheck
                                  size={
                                    14
                                  }
                                />
                                Accept
                              </button>

                            </div>
                          )
                        )
                      )}

                    </div>
                  )}

                </div>

                {/* CHAT */}
                <Link
                  to="/chat"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-3 rounded-2xl text-sm font-medium transition"
                >
                  <FiMessageCircle size={18} />
                  Chat
                </Link>

                {/* CREATE POST */}
                <Link
                  to="/create-post"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-2xl text-sm font-medium transition"
                >
                  <FiPlus size={18} />
                  New Post
                </Link>

                {/* EDIT PROFILE */}
                <Link
                  to="/edit-profile"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-2xl text-sm font-medium transition"
                >
                  <FiEdit2 size={18} />
                  Edit
                </Link>

              </div>
            </div>

            {/* SEARCH */}
            <div className="mb-4">
              <SearchBar />
            </div>

            {/* FEED */}
            <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl p-2">
              <FeedPage />
            </div>

          </main>

        </div>
      </div>
    </div>
  );
};

export default Profile;

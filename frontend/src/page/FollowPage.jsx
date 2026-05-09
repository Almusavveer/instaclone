// src/pages/FollowPage.jsx

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
const API_BASE = "http://localhost:3000";

const FollowPage = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const navigate = useNavigate();

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [counts, setCounts] = useState({
    followers: 0,
    following: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("followers"); // 'followers' or 'following'

  useEffect(() => {
    fetchFollowData();
  }, []);

  const fetchFollowData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/post/follow/details`, {
        params: { email: userId },
        withCredentials: true,
      });
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);
      setCounts(res.data.counts || {});
    } catch (error) {
      console.log("Follow Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (users) => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredFollowers = useMemo(
    () => filterUsers(followers),
    [followers, searchTerm]
  );
  const filteredFollowing = useMemo(
    () => filterUsers(following),
    [following, searchTerm]
  );

  const getDisplayName = (user) => {
    if (user.name) return user.name;
    if (user.email) return user.email.split("@")[0];
    return "user";
  };

  const Avatar = ({ user }) => (
    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
      <img
        className="rounded-full w-full h-full object-cover"
        src={
          user.profilePic ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            getDisplayName(user)
          )}&background=6366f1&color=fff`
        }
        alt="avatar"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span>Back</span>
          </button>

          {/* Clickable Stats - Side by side */}
          <div className="flex gap-6 mb-5">
            <button
              onClick={() => setActiveTab("followers")}
              className={`text-lg font-semibold transition ${
                activeTab === "followers"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {counts.followers}{" "}
              <span className="font-normal">Followers</span>
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`text-lg font-semibold transition ${
                activeTab === "following"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {counts.following}{" "}
              <span className="font-normal">Following</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <SearchBar
              placeholder={`Search ${activeTab}...`}
              onSearch={(term) => setSearchTerm(term)}
            />
          </div>

          <div className="flex justify-end mt-2">
            <span className="text-xs text-zinc-500">Sorted by Default</span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        {activeTab === "followers" && (
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">Followers</h2>
            <div className="space-y-4">
              {filteredFollowers.length > 0 ? (
                filteredFollowers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar user={user} />
                      <div>
                        <p className="font-medium text-white">
                          {user.username || getDisplayName(user)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {getDisplayName(user)}
                        </p>
                        {user.newPostCount > 0 && (
                          <span className="inline-block mt-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {user.newPostCount} new post
                            {user.newPostCount !== 1 && "s"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Message to ${user.username}`)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-1.5 rounded-full border border-zinc-700 transition"
                    >
                      Message
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  No followers found
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "following" && (
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">Following</h2>
            <div className="space-y-4">
              {filteredFollowing.length > 0 ? (
                filteredFollowing.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar user={user} />
                      <div>
                        <p className="font-medium text-white">
                          {user.username || getDisplayName(user)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {getDisplayName(user)}
                        </p>
                        {user.newPostCount > 0 && (
                          <span className="inline-block mt-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {user.newPostCount} new post
                            {user.newPostCount !== 1 && "s"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Message to ${user.username}`)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-1.5 rounded-full border border-zinc-700 transition"
                    >
                      Message
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  No following found
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default FollowPage;
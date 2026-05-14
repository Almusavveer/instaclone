// src/pages/FollowPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiUsers,
  FiUserPlus,
  FiMessageCircle,
  FiSearch,
} from "react-icons/fi";

const API_BASE = "http://localhost:3000";

const FollowPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [counts, setCounts] = useState({
    followers: 0,
    following: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("followers");

  useEffect(() => {
    fetchFollowData();
  }, []);

  const fetchFollowData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/api/post/follow/details`,
        {
          params: {
            email: userId,
          },
          withCredentials: true,
        }
      );

      console.log(res.data);

      const followersData = Array.isArray(res.data.followers)
        ? res.data.followers
        : [];

      const followingData = Array.isArray(res.data.following)
        ? res.data.following
        : [];

      setFollowers(followersData);
      setFollowing(followingData);

      setCounts({
        followers: followersData.length,
        following: followingData.length,
      });
    } catch (error) {
      console.log("Follow Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // normalize follower/following structure
  const normalizeUser = (item) => {
    if (!item) return null;

    return item.follower || item.following || item;
  };

  const getDisplayName = (user) => {
    if (!user) return "Unknown User";

    if (user.name && user.name !== "null") {
      return user.name;
    }

    if (user.username) {
      return user.username;
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "Unknown User";
  };

  const filterUsers = (users) => {
    if (!searchTerm.trim()) return users;

    return users.filter((item) => {
      const user = normalizeUser(item);

      if (!user) return false;

      const search = searchTerm.toLowerCase();

      return (
        user?.username?.toLowerCase()?.includes(search) ||
        user?.name?.toLowerCase()?.includes(search) ||
        user?.email?.toLowerCase()?.includes(search)
      );
    });
  };

  const filteredFollowers = useMemo(() => {
    return filterUsers(followers);
  }, [followers, searchTerm]);

  const filteredFollowing = useMemo(() => {
    return filterUsers(following);
  }, [following, searchTerm]);

  const Avatar = ({ item }) => {
    const user = normalizeUser(item);

    return (
      <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${
              user?.username || user?.name || "User"
            }&background=18181b&color=ffffff`
          }
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const UserCard = ({ item }) => {
    const user = normalizeUser(item);

    if (!user) return null;

    return (
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 hover:bg-zinc-900 transition-all duration-300">
        <div className="flex items-center gap-4">
          <Avatar item={item} />

          <div>
            <h3 className="text-white font-semibold text-[15px]">
              {user.username || getDisplayName(user)}
            </h3>

            <p className="text-zinc-400 text-sm">
              {getDisplayName(user)}
            </p>

            {user?.email && (
              <p className="text-zinc-500 text-xs mt-1">
                {user.email}
              </p>
            )}

            {user?.newPostCount > 0 && (
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 text-xs font-medium">
                  {user.newPostCount} new post
                  {user.newPostCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() =>
            alert(`Message to ${user.username || user.name}`)
          }
          className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
        >
          <FiMessageCircle size={16} />
          Message
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-zinc-700 border-t-white rounded-full animate-spin"></div>

          <p className="text-zinc-400 text-lg">
            Loading connections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* TOP */}
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition"
            >
              <FiArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold">
                Connections
              </h1>

              <p className="text-zinc-400 text-sm">
                Followers & Following
              </p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setActiveTab("followers")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300 ${
                activeTab === "followers"
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <FiUsers />
              Followers ({counts.followers})
            </button>

            <button
              onClick={() => setActiveTab("following")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300 ${
                activeTab === "following"
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <FiUserPlus />
              Following ({counts.following})
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />

            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-zinc-600 text-white"
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* FOLLOWERS */}
        {activeTab === "followers" && (
          <div className="space-y-4">
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((item, index) => {
                const user = normalizeUser(item);

                return (
                  <UserCard
                    key={user?._id || index}
                    item={item}
                  />
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                  <FiUsers
                    size={34}
                    className="text-zinc-600"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  No Followers Found
                </h3>

                <p className="text-zinc-500">
                  Try searching something else
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOLLOWING */}
        {activeTab === "following" && (
          <div className="space-y-4">
            {filteredFollowing.length > 0 ? (
              filteredFollowing.map((item, index) => {
                const user = normalizeUser(item);

                return (
                  <UserCard
                    key={user?._id || index}
                    item={item}
                  />
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                  <FiUserPlus
                    size={34}
                    className="text-zinc-600"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  No Following Found
                </h3>

                <p className="text-zinc-500">
                  Try searching something else
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowPage;
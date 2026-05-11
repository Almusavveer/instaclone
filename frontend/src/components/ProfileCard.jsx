import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const userId = user.email;

  const API_BASE = "http://localhost:3000";
  // console.log("pro;;",user)
  // 📦 Fetch follow data
  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/post/getallfolloweringcount`,
          {
            withCredentials: true,
          }
        );

        setIsFollowing(res.data.following);

        setFollowersCount(
          res.data.followers || 0
        );

        setFollowingCount(
          res.data.following || 0
        );
      } catch (err) {
        console.error(
          "Error fetching follow data:",
          err
        );
      }
    };

    fetchFollowData();
  }, []);

  // 🚀 Open Follow Page
  const handleOpenFollowPage = () => {
    navigate("/follow", {
      state: {
        userId: userId,
      },
    });
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">

      <div className="p-6 sm:p-8">

        {/* 👤 Avatar + Name */}
        <div className="flex items-center space-x-4">

          {/* 🖼️ Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">

            <img
              className="rounded-full w-full h-full object-cover"
              src={
                user?.avatar &&
                user.avatar.trim() !== ""
                  ? user.avatar
                  : `https://ui-avatars.com/api/?name=${
                      user?.name || "User"
                    }&background=6366f1&color=fff`
              }

              alt="avatar"
            />
          </div>

          {/* 👤 User Info */}
          <div className="flex-1">

            <h2 className="text-xl font-bold text-gray-800">
              {user?.name || "Anonymous"}
            </h2>

            <p className="text-gray-500 text-sm">
              @{user?.username || user?.name || "user"}
            </p>

          </div>
        </div>

        {/* 📝 Bio */}
        <div className="mt-4">

          <p className="text-gray-600 leading-relaxed">
            focuses on{" "}
            <span className="font-medium text-gray-800">
              simplicity
            </span>{" "}
            &{" "}
            <span className="font-medium text-gray-800">
              usability
            </span>.
          </p>

        </div>

        {/* 📊 Stats */}
        <div
          onClick={handleOpenFollowPage}
          className="mt-5 flex justify-between items-center bg-gray-50/80 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition"
        >

          {/* 👥 Followers */}
          <div className="text-center flex-1">

            <p className="text-lg font-bold text-gray-800">
              {followersCount.toLocaleString()}
            </p>

            <p className="text-xs text-gray-500 font-medium">
              Followers
            </p>

          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200"></div>

          {/* ➕ Following */}
          <div className="text-center flex-1">

            <p className="text-lg font-bold text-gray-800">
              {followingCount.toLocaleString()}
            </p>

            <p className="text-xs text-gray-500 font-medium">
              Following
            </p>

          </div>
        </div>

        {/* ❤️ Follow Button */}
        {/*
        <div className="mt-6">
          <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 ${
              isFollowing
                ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700"
            } ${loading && "opacity-70 cursor-not-allowed"}`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : isFollowing ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>

                Following
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>

                Follow +
              </>
            )}
          </button>
        </div>
        */}

      </div>
    </div>
  );
};

export default ProfileCard;
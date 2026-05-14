// src/components/PostCard.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PostCard = ({ post, currentUser }) => {
  const navigate = useNavigate();

  // ❤️ States
  const [liked, setLiked] = useState(
    post.isLiked || false
  );

  const [likesCount, setLikesCount] = useState(
    post.likesCount || 0
  );

  // ⋮ Menu State
  const [showMenu, setShowMenu] =
    useState(false);

  // 🌐 API
  const API_URL =
    "http://localhost:3000/api/post";

  const USER_API =
    "http://localhost:3000/api/auth";

  // 📅 Format Date
  const formatDate = (
    dateString
  ) => {
    const date = new Date(dateString);

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // 🚀 Open Post
  const handleClick = () => {
    navigate(`/post/${post._id}`, {
      state: { post },
    });
  };

  // ✏️ Edit Post
  const handleEdit = (e) => {
    e.stopPropagation();

    navigate("/edit-post", {
      state: { post },
    });
  };

  // ❤️ Like / Unlike
  const handleLike = async (e) => {
    e.stopPropagation();

    try {
      // ❌ Unlike
      if (liked) {
        const res = await axios.delete(
          `${API_URL}/${post._id}/like`,
          {
            withCredentials: true,
          }
        );

        setLiked(false);

        setLikesCount(
          res.data.likesCount
        );
      } else {
        // ❤️ Like
        const res = await axios.post(
          `${API_URL}/${post._id}/like`,
          {},
          {
            withCredentials: true,
          }
        );

        setLiked(true);

        setLikesCount(
          res.data.likesCount
        );
      }
    } catch (error) {
      console.log(
        "Like error:",
        error
      );
    }
  };

  // 🗑️ Delete Post
  const handleDelete = async (e) => {
    e.stopPropagation();

    try {
      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this post?"
        );

      if (!confirmDelete) return;

      await axios.delete(
        `${USER_API}/delete/${post._id}`,
        {
          withCredentials: true,
        }
      );

      // ✅ Refresh
      window.location.reload();
    } catch (error) {
      console.log(
        "Delete error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to delete post"
      );
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-5 mb-5 cursor-pointer"
    >
      {/* 👤 Header */}
      <div className="flex items-start space-x-3">

        <img
          className="w-10 h-10 rounded-full object-cover"
          src={
            post.author?.avatar ||
            `https://ui-avatars.com/api/?name=${
              post.author?.name ||
              "User"
            }&background=6366f1&color=fff`
          }

          alt="avatar"
        />

        <div className="flex-1">

          <div className="flex items-center flex-wrap justify-between">

            {/* 👤 User */}
            <div>
              <h3 className="font-semibold text-gray-800">
                {post.author?.name ||
                  "Anonymous"}
              </h3>

              <p className="text-sm text-gray-500">
                @
                {post.author
                  ?.username || "user"}
              </p>
            </div>

            {/* 📅 Date + Menu */}
            <div className="flex items-center gap-3">

              <span className="text-xs text-gray-400">
                {formatDate(
                  post.createdAt
                )}
              </span>

              {/* ⋮ ONLY OWNER */}
              {currentUser?._id ===
                post.author?._id && (
                <div className="relative">

                  {/* ⋮ Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowMenu(
                        !showMenu
                      );
                    }}

                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6h.01M12 12h.01M12 18h.01"
                      />
                    </svg>
                  </button>

                  {/* 📦 Dropdown */}
                  {showMenu && (
                    <div
                      onClick={(e) =>
                        e.stopPropagation()
                      }

                      className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                    >
                      {/* ✏️ Edit */}
                      <button
                        onClick={
                          handleEdit
                        }

                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                      >
                        Edit Post
                      </button>

                      {/* 🗑️ Delete */}
                      <button
                        onClick={
                          handleDelete
                        }

                        className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📝 Content */}
      <div className="mt-3">

        <h2 className="text-black leading-relaxed mb-1 font-medium text-lg">
          {post.title}
        </h2>

        <p className="text-gray-700 leading-relaxed">
          {post.content}
        </p>

        {/* 🖼️ Image */}
        {typeof post.imgUrl ===
          "string" &&
          post.imgUrl.trim() !==
            "" && (
            <img
              src={post.imgUrl}
              alt="post"
              className="mt-3 rounded-xl w-full max-h-96 object-cover"
            />
          )}
      </div>

      {/* ❤️ Likes & 💬 Comments */}
      <div className="mt-4 flex items-center justify-between text-gray-500">

        {/* LEFT */}
        <div className="flex items-center space-x-6">

          {/* ❤️ Like */}
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 transition ${
                liked
                  ? "text-red-500 fill-red-500"
                  : "text-gray-500 fill-none hover:text-red-500"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>

            <span>
              {likesCount}
            </span>
          </button>

          {/* 💬 Comments */}
          <button
            onClick={handleClick}
            className="flex items-center space-x-1 hover:text-blue-500 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            <span>
              {post.commentsCount ||
                0}
            </span>
          </button>
        </div>

        {/* ❤️ Liked Users */}
        {post.likedUsers?.length >
          0 && (
          <div className="flex items-center gap-2">

            {/* 👤 Avatars */}
            <div className="flex -space-x-2">

              {post.likedUsers
                .slice(0, 2)
                .map((user) => (
                  <img
                    key={user._id}
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }

                    alt={user.name}
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
            </div>

            {/* 👤 Names */}
            <p className="text-sm text-gray-600">

              {post.likedUsers
                .slice(0, 2)
                .map((u) => u.name)
                .join(", ")}

              {likesCount > 2 &&
                " ..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
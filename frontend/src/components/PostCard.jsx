// src/components/PostCard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  // ❤️ States
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(0);
  const [likesCount, setLikesCount] = useState(
    post.likes?.length || 0
  );

  // 🌐 Backend URL
  const API_URL = "http://localhost:3000/api/post";
  const API_BASE = "http://localhost:3000";

  // 📅 Format Date
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // 🚀 Navigate to post page
  const handleClick = () => {
    navigate(`/post/${post._id}`, {
      state: { post },
    });
  };

  // ✅ Check if already liked
  const checkLikeStatus = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/${post._id}/like/status`,
        {
          withCredentials: true,
        }
      );

      // ❤️ Set states from backend
      setLiked(res.data.liked);
     
      setLikesCount(res.data.likesCount);

    } catch (error) {
      console.log("Like status error:", error);
    }
  };

  // ❤️ Like / Unlike Handler
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
        setLikesCount(res.data.likesCount);

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
        setLikesCount(res.data.likesCount);
      }

    } catch (error) {
      console.log("Like error:", error);
    }
  };
  // 💬 Fetch Comments Count
const fetchComments = async () => {
  try {
      if (!post?._id) return;
    const res = await axios.get(
     `${API_BASE}/api/comment/${post._id}/comments`,
      {
        withCredentials: true,
      }
    );

    setComments(res.data.comments.length);

    console.log(
      "Comments count:",
      res.data.comments.length
    );

  } catch (error) {
    console.log(
      "Comments error:",
      error
    );
  }
};
  // 🔄 Load Like Status On Mount
useEffect(() => {
  if (!post?._id) return;

  checkLikeStatus();
  fetchComments();

}, [post]);

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
              post.author?.name || "User"
            }&background=6366f1&color=fff`
          }
          alt="avatar"
        />

        <div className="flex-1">
          <div className="flex items-center flex-wrap justify-between">
            <h3 className="font-semibold text-gray-800">
              {post.author?.name || "Anonymous"}
            </h3>

            <span className="text-xs text-gray-400">
              {formatDate(post.createdAt)}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            @{post.author?.name || "user"}
          </p>
        </div>
      </div>

      {/* 📝 Post Content */}
      <div className="mt-3">
        <h2 className="text-black leading-relaxed mb-1 font-medium text-lg">
          {post.title}
        </h2>

        <p className="text-gray-700 leading-relaxed">
          {post.content}
        </p>

        {post.image && (
          <img
            src={post.image}
            alt="post content"
            className="mt-3 rounded-xl w-full max-h-96 object-cover"
          />
        )}
      </div>

      {/* ❤️ Likes & 💬 Comments */}
      <div className="mt-4 flex items-center space-x-6 text-gray-500">

        {/* ❤️ Like Button */}
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

          <span>{likesCount}</span>
        </button>

        {/* 💬 Comments */}
        <button
          onClick={(e) => e.stopPropagation()}
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

          <span>{comments || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
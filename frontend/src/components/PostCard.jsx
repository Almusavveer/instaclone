// src/components/PostCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; 
const PostCard = ({ post }) => {

      const navigate = useNavigate();  
  // Format date if needed
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
const handleClick = (post) => {
  console.log(post._id);
navigate(`/post/${post._id}`, { state: { post } });
};
  return (
    <div onClick={() => handleClick(post)} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-5 mb-5">
      {/* Post Header: Avatar + Name + Date */}
      <div className="flex items-start space-x-3">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={
            post.author?.avatar ||
            `https://ui-avatars.com/api/?name=${post.author?.name || "User"}&background=6366f1&color=fff`
          }
          alt="avatar"
        />
        <div className="flex-1">
          <div className="flex items-center flex-wrap justify-between">
            <h3 className="font-semibold text-gray-800">{post.author?.name || "Anonymous"}</h3>
            <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-500">@{post.author?.name || "user"}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-3">
        <h2 className="text-black-700 leading-relaxed mb-0.5 font-medium">{post.title}</h2>
        <p className="text-gray-700 leading-relaxed">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="post content"
            className="mt-3 rounded-xl w-full max-h-96 object-cover"
          />
        )}
      </div>

      {/* Engagement (Likes & Comments) */}
      <div className="mt-4 flex items-center space-x-6 text-gray-500">
        <button className="flex items-center space-x-1 hover:text-red-500 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likesCount || 0}</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-blue-500 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.commentsCount || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
// src/pages/EditPostPage.jsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const EditPostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 📦 Get Post From State
  const post = location.state?.post;

  // 📝 States
  const [title, setTitle] = useState(
    post?.title || ""
  );

  const [content, setContent] = useState(
    post?.content || ""
  );

  const [loading, setLoading] =
    useState(false);

  const API_BASE =
    "http://localhost:3000";

  // ❌ No Post
  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">
          No post data found.
        </p>
      </div>
    );
  }

  // ✏️ Update Post
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/api/auth/edit`,
        {
          postId: post._id,
          title,
          content,
        },
        {
          withCredentials: true,
        }
      );

      alert("Post updated successfully");

      navigate("/feed");
    } catch (error) {
      console.log(
        "Update Error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to update post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <div className="bg-white rounded-2xl shadow-md p-6">

        {/* 🔙 Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 text-gray-600 hover:text-black transition"
        >
          ← Back
        </button>

        {/* 📝 Heading */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Edit Post
        </h1>

        {/* ✏️ Form */}
        <form
          onSubmit={handleUpdate}
          className="space-y-5"
        >

          {/* 📝 Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }

              placeholder="Enter title"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 📝 Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }

              rows="6"
              placeholder="Write something..."
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* 🚀 Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Update Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;

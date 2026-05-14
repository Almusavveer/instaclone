// src/pages/CreatePostPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreatePostPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 🖼️ Image State
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const API_BASE = "http://localhost:3000";

  // 🖼️ Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // ❌ Allow only images
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    // ❌ Max 5MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError("");

    setImage(file);

    // 👀 Preview
    setPreview(URL.createObjectURL(file));
  };

  // 🚀 Submit Post
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 📦 FormData
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);

      // 🖼️ Append image if exists
      if (image) {
        formData.append("image", image);
      }

      await axios.post(
        `${API_BASE}/api/auth/create-post`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      navigate("/");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl p-6">

          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Create New Post
          </h1>

          {/* ❌ Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* 📝 Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }

                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Post title"
                required
              />
            </div>

            {/* 📝 Content */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Content *
              </label>

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }

                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's on your mind?"
                required
              />
            </div>

            {/* 🖼️ Upload Image */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Upload Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-xl p-2 cursor-pointer"
              />

              <p className="text-sm text-gray-400 mt-1">
                Max image size: 5MB
              </p>
            </div>

            {/* 👀 Image Preview */}
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-96 object-cover rounded-xl border"
                />
              </div>
            )}

            {/* 🚀 Buttons */}
            <div className="flex gap-3 pt-2">

              {/* ❌ Cancel */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              {/* ✅ Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition ${
                  loading &&
                  "opacity-50 cursor-not-allowed"
                }`}
              >
                {loading
                  ? "Posting..."
                  : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
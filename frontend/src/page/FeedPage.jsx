// src/pages/FeedPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/auth_context";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentUser } = useAuth();

  const API_BASE = "http://localhost:3000";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/posts`, {
          withCredentials: true,
        });

        setPosts(res.data.posts || res.data);

      } catch (err) {
        console.error("Error fetching feed:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  console.log("Current User:", currentUser);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-5">
        <p>{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Feed
      </h1>

      <div className="mb-2.5">
        <SearchBar
          placeholder="Search users..."
          currentUserId={currentUser?._id}
        />
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm">
          <p>No posts yet. Be the first to create one!</p>
        </div>
      ) : (
        [...posts]
          .reverse()
          .map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
            />
          ))
      )}
    </div>
  );
};

export default FeedPage;
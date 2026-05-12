// src/pages/SinglePostPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const SinglePostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  // 📦 States
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ❤️ Like States
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // 💬 Comment States
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const API_BASE = "http://localhost:3000";

  // 📦 Fetch Post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/post/${postId}`,
          {
            withCredentials: true,
          }
        );

        const fetchedPost = res.data.post || res.data;

        setPost(fetchedPost);

        setLikesCount(
          fetchedPost.likes?.length || 0
        );
      } catch (err) {
        console.error("Error fetching post:", err);

        setError(
          err.response?.data?.message ||
          "Failed to load post."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // ❤️ Check Like Status
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/post/${postId}/like/status`,
          {
            withCredentials: true,
          }
        );

        setLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
      } catch (error) {
        console.log(
          "Like status error:",
          error
        );
      }
    };

    checkLikeStatus();
  }, [postId]);

  // 💬 Fetch Comments
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 💬 Get Comments
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/comment/${postId}/comments`,
        {
          withCredentials: true,
        }
      );

      setComments(res.data.comments);
    } catch (error) {
      console.log(
        "Comments error:",
        error
      );
    }
  };

  // 💬 Add Comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setCommentLoading(true);

      const res = await axios.post(
        `${API_BASE}/api/comment/${postId}/comment`,
        {
          text: commentText,
        },
        {
          withCredentials: true,
        }
      );

      setComments(res.data.comments);

      setPost((prev) => ({
        ...prev,
        comments: res.data.comments,
        commentsCount:
          res.data.comments.length,
      }));

      setCommentText("");
    } catch (error) {
      console.log(
        "Add comment error:",
        error
      );
    } finally {
      setCommentLoading(false);
    }
  };

  // ❤️ Like / Unlike
  const handleLike = async () => {
    try {
      if (liked) {
        // ❌ Unlike
        const res = await axios.delete(
          `${API_BASE}/api/post/${postId}/like`,
          {
            withCredentials: true,
          }
        );

        setLiked(false);
        setLikesCount(res.data.likesCount);
      } else {
        // ❤️ Like
        const res = await axios.post(
          `${API_BASE}/api/post/${postId}/like`,
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

  // 📅 Format Date
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-red-500 mb-4">
          {error}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 🚫 No Post
  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500">
          Post not found.
        </p>

        <button
          onClick={() => navigate("/feed")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>

        Back
      </button>

      {/* 📄 Post Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* 👤 Author */}
        <div className="p-6 pb-3 flex items-start space-x-4 border-b border-gray-100">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={
              post.author?.avatar ||
              `https://ui-avatars.com/api/?name=${
                post.author?.name || "User"
              }&background=6366f1&color=fff`
            }

            alt="avatar"
          />

          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">
              {post.author?.name || "Anonymous"}
            </h2>

            <p className="text-gray-500">
              @{post.author?.username || "user"}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* 📝 Content */}
        <div className="p-6 pt-3">

          <h3 className="text-gray-800 text-3xl leading-relaxed whitespace-pre-wrap">
            {post.title}
          </h3>

          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap mt-3">
            {post.content}
          </p>

          {/* 🖼️ Post Image */}
          {typeof post.imgUrl === "string" &&
            post.imgUrl.trim() !== "" && (
              <img
                src={post.imgUrl}
                alt="post"
                className="mt-4 rounded-xl w-full max-h-[600px] object-cover"
              />
            )}
        </div>

        {/* ❤️ Actions */}
        <div className="px-6 py-3 bg-gray-50 flex items-center space-x-8 border-t border-gray-100">

          {/* ❤️ Like */}
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 transition ${
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

            <span className="text-gray-700">
              {likesCount} likes
            </span>
          </button>

          {/* 💬 Comments Count */}
          <div className="flex items-center space-x-2 text-gray-600">
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
              {comments.length} comments
            </span>
          </div>
        </div>

        {/* 💬 Comments Section */}
        <div className="p-6 bg-white border-t border-gray-100">

          <h3 className="font-semibold text-gray-800 mb-4">
            Comments
          </h3>

          {/* ✍️ Add Comment */}
          <div className="flex items-start space-x-3 mb-6">
            <img
            className="w-12 h-12 rounded-full object-cover"
            src={
              post.author?.avatar ||
              `https://ui-avatars.com/api/?name=${
                post.author?.name || "User"
              }&background=6366f1&color=fff`
            }

            alt="avatar"
          />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }

                placeholder="Write a comment..."
                rows="2"
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {commentLoading
                    ? "Posting..."
                    : "Post Comment"}
                </button>
              </div>
            </div>
          </div>

          {/* 💬 Comments List */}
          {comments?.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex space-x-3"
                >
                  <img
                    className="w-8 h-8 rounded-full"
                    src={
                      comment.author?.avatar ||
                      `https://ui-avatars.com/api/?name=${
                        comment.author?.name || "User"
                      }&background=9ca3af&color=fff`
                    }

                    alt="avatar"
                  />

                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 text-sm">
                        {comment.author?.name ||
                          "Anonymous"}
                      </p>

                      <span className="text-xs text-gray-400">
                        {formatDate(
                          comment.createdAt
                        )}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SinglePostPage;
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [myPosts, setMyPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { withCredentials: true };

      const [userRes, followingStatsRes, myPostsRes, allPostsRes] =
        await Promise.all([
          axios.get("http://localhost:3000/api/auth/user", headers),
          axios.get(
            "http://localhost:3000/api/post/getallfolloweringcount",
            headers,
          ),
          axios.get("http://localhost:3000/api/auth/my-posts", headers),
          axios.get("http://localhost:3000/api/auth/posts", headers),
        ]);

      setUser(userRes.data.user || userRes.data);
      setStats({
        followers: followingStatsRes.data.followers || 0,
        following: followingStatsRes.data.following || 0,
      });
      setMyPosts(
        Array.isArray(myPostsRes.data)
          ? myPostsRes.data
          : myPostsRes.data.posts || [],
      );
      setAllPosts(
        Array.isArray(allPostsRes.data)
          ? allPostsRes.data
          : allPostsRes.data.posts || [],
      );
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true },
      );
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    }
  };

  // Format timestamp
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle create post submission
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in both title and content.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        "http://localhost:3000/api/auth/create-post",
        {
          title: newPost.title,
          content: newPost.content,
        },
        { withCredentials: true },
      );

      // Refresh posts after successful creation
      await fetchData();
      setShowModal(false);
      setNewPost({ title: "", content: "" });
    } catch (err) {
      console.error("Create post error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to create post. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search effect
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/auth/search?q=${searchQuery}`,
          {
            withCredentials: true,
          },
        );
        setSearchResults(res.data.users);
        setShowResults(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".search-container")) setShowResults(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const displayedPosts = activeTab === "feed" ? allPosts : myPosts;

  if (isLoading) {
    return (
      <div className="profile-page">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
          }}
        >
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">Instagram</div>
        <nav>
          <button
            className={`nav-item ${activeTab === "feed" ? "active" : ""}`}
            onClick={() => setActiveTab("feed")}
          >
            <span>🏠</span> Feed
          </button>
          <button
            className={`nav-item ${activeTab === "myPosts" ? "active" : ""}`}
            onClick={() => setActiveTab("myPosts")}
          >
            <span>📝</span> My Posts
          </button>
          <button className="nav-item" onClick={() => setActiveTab("explore")}>
            <span>🔍</span> Explore
          </button>
          <button className="nav-item" onClick={() => setActiveTab("reels")}>
            <span>🎬</span> Reels
          </button>
          <button className="nav-item" onClick={() => setActiveTab("settings")}>
            <span>⚙️</span> Settings
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="profile-main">
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="search-container">
            <div className="search-bar">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
              />
            </div>
            {showResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="search-result-item"
                    onClick={() => {
                      navigate(`/profile/${user._id}`);
                      setShowResults(false);
                      setSearchQuery("");
                    }}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                      alt="avatar"
                    />
                    <div>
                      <div className="result-name">{user.name}</div>
                      <div className="result-email">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="create-post-btn"
            onClick={() => setShowModal(true)}
          >
            + Create a post
          </button>
        </div>

        {/* PROFILE HEADER */}
        <div className="profile-header">
          <div className="avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name || user.username || "User"}&background=6366f1&color=fff`}
              alt="avatar"
            />
          </div>
          <div className="profile-info">
            <div className="username-row">
              <h2>{user.name || user.username || "Username"}</h2>
              <span className="badge">LIVE</span>
              <button className="follow-btn">Follow</button>
            </div>
            <div className="stats">
              <div>
                <strong>{myPosts.length}</strong> posts
              </div>
              <div>
                <strong>{stats.followers}</strong> followers
              </div>
              <div>
                <strong>{stats.following}</strong> following
              </div>
            </div>
            <div className="bio">
              <p>
                <strong>{user.name || user.username}</strong>{" "}
                {user.bio || "UI Designer | Traveler | Lifestyle Blogger"}
              </p>
              <span className="location">
                📍 {user.location || "Dubai, UAE"}
              </span>
            </div>
          </div>
        </div>

        {/* STORY HIGHLIGHTS */}
        <div className="story-highlights">
          <div className="highlight">
            <div className="circle">+</div>
            <span>New</span>
          </div>
          <div className="highlight">
            <div className="circle">🌿</div>
            <span>Garden</span>
          </div>
          <div className="highlight">
            <div className="circle">📷</div>
            <span>Cameras</span>
          </div>
          <div className="highlight">
            <div className="circle">🐾</div>
            <span>Wildlife</span>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button
            className={activeTab === "feed" ? "tab-active" : ""}
            onClick={() => setActiveTab("feed")}
          >
            Feed
          </button>
          <button
            className={activeTab === "myPosts" ? "tab-active" : ""}
            onClick={() => setActiveTab("myPosts")}
          >
            My Posts
          </button>
          <button onClick={() => setActiveTab("reels")}>Reels</button>
          <button onClick={() => setActiveTab("saved")}>Saved</button>
        </div>

        {/* POST GRID */}
        <div className="post-grid">
          {displayedPosts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-image">
                <div className="image-placeholder">📸</div>
              </div>
              <div className="post-caption">
                <p>
                  <strong>{post.author?.name || user.name}</strong> {post.title}
                </p>
                <p className="caption-text">{post.content}</p>
                <div className="post-meta">
                  <span>❤️ {post.likes || 0} likes</span>
                  <span className="post-time">
                    🕒 {formatTime(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {displayedPosts.length === 0 && (
            <div className="no-posts">
              {activeTab === "feed"
                ? "No posts from others yet."
                : "You haven't created any posts yet. Click + Create a post!"}
            </div>
          )}
        </div>
      </main>

      {/* CREATE POST MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => !isSubmitting && setShowModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  placeholder="Enter post title"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  placeholder="What's on your mind?"
                  rows="4"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        body {
          background: #fafafa;
        }

        .search-container {
          position: relative;
          width: 260px;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          margin-top: 8px;
          z-index: 100;
          max-height: 300px;
          overflow-y: auto;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #efefef;
        }

        .search-result-item:hover {
          background: #fafafa;
        }

        .search-result-item img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .result-name {
          font-weight: 600;
          font-size: 14px;
        }

        .result-email {
          font-size: 12px;
          color: #8e8e8e;
        }

        .profile-page {
          display: flex;
          min-height: 100vh;
          background: #fafafa;
        }

        /* SIDEBAR */
        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #dbdbdb;
          padding: 30px 20px;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .logo {
          font-family: 'Billabong', cursive;
          font-size: 28px;
          font-weight: 500;
          margin-bottom: 40px;
          padding-left: 12px;
          color: #262626;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 12px 16px;
          margin: 8px 0;
          background: none;
          border: none;
          font-size: 16px;
          font-weight: 500;
          color: #262626;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .nav-item:hover {
          background: #f2f2f2;
        }

        .nav-item.active {
          background: #efefef;
          font-weight: 600;
        }

        .nav-item.logout {
          margin-top: 40px;
          color: #ed4956;
        }

        .nav-item span:first-child {
          font-size: 22px;
        }

        /* MAIN CONTENT */
        .profile-main {
          flex: 1;
          max-width: calc(100% - 260px);
          padding: 20px 40px;
        }

        /* TOP BAR */
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 12px 24px;
          border-radius: 40px;
          margin-bottom: 40px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #efefef;
          padding: 8px 16px;
          border-radius: 30px;
          width: 260px;
        }

        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          width: 100%;
        }

        .create-post-btn {
          background: #0095f6;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .create-post-btn:hover {
          background: #0077c2;
        }

        /* PROFILE HEADER */
        .profile-header {
          display: flex;
          gap: 60px;
          margin-bottom: 40px;
          background: white;
          padding: 30px;
          border-radius: 24px;
        }

        .avatar img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-info {
          flex: 1;
        }

        .username-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .username-row h2 {
          font-size: 28px;
          font-weight: 300;
        }

        .badge {
          background: #ff3040;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .follow-btn {
          background: #0095f6;
          color: white;
          border: none;
          padding: 6px 20px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
        }

        .stats {
          display: flex;
          gap: 40px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .stats div {
          font-size: 16px;
        }

        .bio p {
          margin-bottom: 4px;
        }

        .location {
          color: #8e8e8e;
          font-size: 14px;
        }

        /* STORY HIGHLIGHTS */
        .story-highlights {
          display: flex;
          gap: 30px;
          margin-bottom: 40px;
          background: white;
          padding: 20px;
          border-radius: 24px;
          overflow-x: auto;
        }

        .highlight {
          text-align: center;
          cursor: pointer;
        }

        .circle {
          width: 70px;
          height: 70px;
          background: linear-gradient(45deg, #f09433, #d62976);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;
          margin-bottom: 8px;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #dbdbdb;
        }

        /* TABS */
        .tabs {
          display: flex;
          gap: 30px;
          border-bottom: 1px solid #dbdbdb;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .tabs button {
          background: none;
          border: none;
          padding: 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #8e8e8e;
          cursor: pointer;
          transition: color 0.2s;
        }

        .tabs .tab-active {
          color: #262626;
          border-bottom: 2px solid #262626;
        }

        /* POST GRID */
        .post-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .post-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }

        .post-card:hover {
          transform: translateY(-3px);
        }

        .post-image {
          height: 240px;
          background: #efefef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .image-placeholder {
          font-size: 48px;
        }

        .post-caption {
          padding: 12px;
        }

        .post-caption p {
          font-size: 14px;
          margin-bottom: 6px;
        }

        .caption-text {
          color: #8e8e8e;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .post-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 12px;
          color: #555;
        }

        .post-time {
          font-size: 11px;
          color: #999;
        }

        .no-posts {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px;
          color: #8e8e8e;
        }

        /* MODAL STYLES */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          padding: 32px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 35px rgba(0, 0, 0, 0.2);
          animation: fadeInUp 0.2s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-content h2 {
          margin-bottom: 20px;
          font-size: 24px;
          color: #262626;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #262626;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #dbdbdb;
          border-radius: 12px;
          font-size: 14px;
          transition: border 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0095f6;
        }

        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-btn {
          background: #efefef;
          border: none;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cancel-btn:hover {
          background: #e2e2e2;
        }

        .submit-btn {
          background: #0095f6;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover {
          background: #0077c2;
        }

        .submit-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 80px;
            padding: 20px 0;
          }
          .sidebar .logo, .sidebar .nav-item span:last-child {
            display: none;
          }
          .nav-item {
            justify-content: center;
            padding: 12px 0;
          }
          .profile-main {
            max-width: calc(100% - 80px);
            padding: 20px;
          }
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .stats {
            justify-content: center;
          }
          .post-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .modal-content {
            width: 95%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
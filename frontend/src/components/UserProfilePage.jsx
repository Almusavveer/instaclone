// UserProfilePage.jsx (updated)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileCard from "../components/ProfileCard";
import FeedPage from "../page/FeedPage";
import { useLocation } from "react-router-dom";

const UserProfilePage = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:3000";

  // Fetch current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/user`, {
          withCredentials: true,
        });
        setCurrentUser(res.data);
        console.log("Current user data:", res.data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch profile user and follow status
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_BASE}/api/find/${userId}`, {
          withCredentials: true,
        });
        setUser(res.data);
        
        console.log("Profile user data:", res.data);
        // Use the profile user's own followers/following counts
        setFollowersCount(res.data.followers?.length || 0);
        setFollowingCount(res.data.following?.length || 0);

        // Check follow status if currentUser exists
        if (currentUser?.email) {
          const followStatusRes = await axios.get(`${API_BASE}/api/find/follow/status`, {
            params: { followingId: userId },
            withCredentials: true,
          });
          setIsFollowing(followStatusRes.data.isFollowing);
        }
      } catch (err) {
        console.error(err);
        navigate("/feed");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, navigate, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    setActionLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${API_BASE}/api/find/follow`, {
          data: { followingId: userId },
          withCredentials: true,
        });
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await axios.post(
          `${API_BASE}/api/post/following`,
          { followingId: userId },
          { withCredentials: true }
        );
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Follow/unfollow error:", err);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!user) return null;

  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="sticky top-6">
              {/* Pass both followers and following counts from the profile user */}
              <ProfileCard
                user={{
                  ...user,
                  followersCount,
                  followingCount,
                }}
              />
              {!isOwnProfile && (
                <div className="mt-4">
                  <button
                    onClick={handleFollowToggle}
                    disabled={actionLoading}
                    className={`w-full py-2 px-4 rounded-xl font-semibold transition ${
                      isFollowing
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } ${actionLoading && "opacity-50 cursor-not-allowed"}`}
                  >
                    {actionLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>
              )}
            </div>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Posts by {user.name}</h2>
            </div>
            <FeedPage userId={userId} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
// // UserProfilePage.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import ProfileCard from "../components/ProfileCard";
// import FeedPage from "../page/FeedPage";
// import { useAuth } from "../context/auth_context";
// const UserProfilePage = () => {
//   const location = useLocation();
//   const userId = location.state?.userId;

//   const [user, setUser] = useState(null);
//     const { currentUser}= useAuth(); // Get current user from context

//   const [isFollowing, setIsFollowing] = useState(false);
//   const [followersCount, setFollowersCount] = useState(0);
//   const [followingCount, setFollowingCount] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);

//   const navigate = useNavigate();
//   const API_BASE = "http://localhost:3000";

//   // =========================
//   // Fetch current logged-in user
//   // =========================
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/api/auth/user`, {
//           withCredentials: true,
//         });
//         setCurrentUser(res.data);
//       } catch (err) {
//         console.error("Failed to fetch current user:", err);
//       }
//     };

//     fetchCurrentUser();
//   }, []);

//   // =========================
//   // Fetch follow counts (NEW API)
//   // =========================
//   console.log(userId)
//   const fetchFollowData = async (userId) => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/api/post/data/${userId}`,
//         { withCredentials: true }
//       );

//       setFollowersCount(res.data.followersCount || 0);
//       setFollowingCount(res.data.followingCount || 0);
//     } catch (err) {
//       console.error("Failed to fetch follow data:", err);
//     }
//   };

//   // =========================
//   // Fetch profile user
//   // =========================
//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!userId) return;

//       try {
//         const res = await axios.get(`${API_BASE}/api/find/${userId}`, {
//           withCredentials: true,
//         });

//         setUser(res.data);

//         // 🔥 get counts from new API
//         await fetchFollowData(userId);

//         // check follow status
//         console.log("Current User ID:", currentUser);
//         console.log("Profile User ID:", userId);
//         if (currentUser) {
//           const followStatusRes = await axios.get(
//             `${API_BASE}/api/find/follow/status`,
//             {
//               params: { followingId: userId },
//               withCredentials: true,
//             }
//           );

//           setIsFollowing(followStatusRes.data.isFollowing);
//         }
//       } catch (err) {
//         console.error(err);
//         navigate("/feed");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (userId) fetchUser();
//   }, [userId, currentUser, navigate]);

//   // =========================
//   // Follow / Unfollow
//   // =========================
//   const handleFollowToggle = async () => {
//     if (!currentUser) return;

//     setActionLoading(true);

//     try {
//       if (isFollowing) {
//         await axios.delete(`${API_BASE}/api/find/follow`, {
//           data: { followingId: userId },
//           withCredentials: true,
//         });

//         setIsFollowing(false);
//       } else {
//         await axios.post(
//           `${API_BASE}/api/post/following`,
//           { followingId: userId },
//           { withCredentials: true }
//         );

//         setIsFollowing(true);
//       }

//       // 🔥 always refresh correct data
//       await fetchFollowData(userId);
//     } catch (err) {
//       console.error("Follow/unfollow error:", err);
//       alert(err.response?.data?.message || "Action failed");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // =========================
//   // UI States
//   // =========================
//   if (loading) return <div className="text-center p-8">Loading...</div>;
//   if (!user) return null;

//   const isOwnProfile = currentUser?._id === userId;

//   // =========================
//   // UI
//   // =========================
//   return (
//     <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">

//         <div className="flex flex-col lg:flex-row gap-6">

//           {/* LEFT SIDE */}
//           <aside className="lg:w-1/3 xl:w-1/4">
//             <div className="sticky top-6">

//               <ProfileCard
//                 user={{
//                   ...user,
//                  ...followersCount,
//                   ...followingCount,
//                 }}
//               />

//               {!isOwnProfile && (
//                 <div className="mt-4">
//                   <button
//                     onClick={handleFollowToggle}
//                     disabled={actionLoading}
//                     className={`w-full py-2 px-4 rounded-xl font-semibold transition
//                       ${
//                         isFollowing
//                           ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                           : "bg-blue-600 text-white hover:bg-blue-700"
//                       }

//                       ${actionLoading && "opacity-50 cursor-not-allowed"}
//                     `}
//                   >
//                     {actionLoading
//                       ? "Loading..."
//                       : isFollowing
//                       ? "Unfollow"
//                       : "Follow"}
//                   </button>
//                 </div>
//               )}

//             </div>
//           </aside>

//           {/* RIGHT SIDE */}
//           <main className="flex-1">
//             <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Posts by {user.name}
//               </h2>
//             </div>

//             <FeedPage userId={userId} />
//           </main>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default UserProfilePage;

// src/pages/UserProfilePage.jsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import ProfileCard from "../components/ProfileCard";
import FeedPage from "../page/FeedPage";

import { useAuth } from "../context/auth_context";

// ✅ React Query
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const UserProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;

  const { currentUser } = useAuth();

  // ✅ Query Client
  const queryClient = useQueryClient();

  const API_BASE = "http://localhost:3000";

  // =========================
  // Fetch Profile User
  // =========================
  const fetchUser = async () => {
    const res = await axios.get(
      `${API_BASE}/api/find/${userId}`,
      {
        withCredentials: true,
      }
    );

    return res.data;
  };

  // =========================
  // Fetch Follow Data
  // =========================
  const fetchFollowData = async () => {
    const res = await axios.get(
      `${API_BASE}/api/post/data/${userId}`,
      {
        withCredentials: true,
      }
    );

    return res.data;
  };

  // =========================
  // Fetch Follow Status
  // =========================
  const fetchFollowStatus = async () => {
    const res = await axios.get(
      `${API_BASE}/api/find/follow/status`,
      {
        params: {
          followingId: userId,
        },
        withCredentials: true,
      }
    );

    return res.data.isFollowing;
  };

  // =========================
  // Queries
  // =========================

  // 👤 User Query
  const {
    data: user,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ["profile-user", userId],
    queryFn: fetchUser,
    enabled: !!userId,
  });

  // 👥 Follow Data Query
  const {
    data: followData,
    isLoading: followLoading,
  } = useQuery({
    queryKey: ["follow-data", userId],
    queryFn: fetchFollowData,
    enabled: !!userId,
  });

  // ❤️ Follow Status Query
  const {
    data: isFollowing,
    isLoading: statusLoading,
  } = useQuery({
    queryKey: ["follow-status", userId],
    queryFn: fetchFollowStatus,
    enabled: !!userId && !!currentUser,
  });

  // =========================
  // Follow / Unfollow
  // =========================
  const handleFollowToggle = async () => {
    try {
      // ❌ Unfollow
      if (isFollowing) {
        await axios.delete(
          `${API_BASE}/api/find/follow`,
          {
            data: {
              followingId: userId,
            },
            withCredentials: true,
          }
        );
      } else {
        // ✅ Follow
        await axios.post(
          `${API_BASE}/api/post/following`,
          {
            followingId: userId,
          },
          {
            withCredentials: true,
          }
        );
      }

      // ✅ Refresh Queries
      queryClient.invalidateQueries({
        queryKey: ["follow-status", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["follow-data", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    } catch (err) {
      console.error("Follow/unfollow error:", err);

      alert(
        err.response?.data?.message ||
        "Action failed"
      );
    }
  };

  // =========================
  // Loading State
  // =========================
  if (
    userLoading ||
    followLoading ||
    statusLoading
  ) {
    return (
      <div className="text-center p-8">
        Loading...
      </div>
    );
  }

  // =========================
  // No User
  // =========================
  if (!user) {
    navigate("/feed");
    return null;
  }

  const followersCount =
    followData?.followersCount || 0;

  const followingCount =
    followData?.followingCount || 0;

  const isOwnProfile =
    currentUser?._id === userId;

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT SIDE */}
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="sticky top-6">

              <ProfileCard
                user={{
                  ...user,
                  followersCount,
                  followingCount,
                }}
              />

              {/* FOLLOW BUTTON */}
              {!isOwnProfile && (
                <div className="mt-4">

                  <button
                    onClick={handleFollowToggle}
                    className={`w-full py-2 px-4 rounded-xl font-semibold transition
                      ${
                        isFollowing
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }

                    `}
                  >
                    {isFollowing
                      ? "Unfollow"
                      : "Follow"}
                  </button>

                </div>
              )}

            </div>
          </aside>

          {/* RIGHT SIDE */}
          <main className="flex-1">

            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Posts by {user.name}
              </h2>
            </div>

            {/* POSTS */}
            <FeedPage userId={userId} />

          </main>

        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
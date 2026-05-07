import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";  // ✅ import Link
import axios from "axios";
import ProfileCard from "../components/ProfileCard";
import FeedPage from "./FeedPage";
import SearchBar from "../components/SearchBar";

const Profile = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/user", {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="sticky top-6">
              <ProfileCard user={user} />
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold text-gray-800">Feed</h2>
              <div className="flex gap-2">
                <Link
                  to="/create-post"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                  + New Post
                </Link>
            
              </div>
            </div>
            <FeedPage />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
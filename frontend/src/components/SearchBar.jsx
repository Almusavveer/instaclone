// src/components/SearchBar.jsx

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

<<<<<<< HEAD
const SearchBar = ({
  placeholder = "Search users...",
  currentUserId, // pass logged-in user id as prop
}) => {
=======
import { useAuth } from "../context/auth_context";  //eddited by farhan

const SearchBar = ({ placeholder = "Search users...", currentUserId, setCurrentUserId, }) => {
>>>>>>> eccc804cacdfd56e83e42beee89b140ace3b06d5
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth(); //eddited by farhan

  const API_BASE = "http://localhost:3000";

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers();
      } else {
        setUsers([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/api/find/search`, {
        params: { q: query },
        withCredentials: true,
      });

      setUsers(res.data.users);

<<<<<<< HEAD
      console.log("Search results:", res.data.users);
      console.log("Current User ID:", currentUserId);

=======

      console.log(res.data.users)
>>>>>>> eccc804cacdfd56e83e42beee89b140ace3b06d5
    } catch (err) {
      console.error("Search error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // const handleUserClick = (userId) => {
  //   setShowDropdown(false);
  //   setQuery("");
  //   // If the clicked user is the current logged-in user, go to home page
  //   //edited by farhan - save searched clicked user id
  //   setCurrentUserId(userId);
  //   console.log("saved currentUserId",userId)
  //   console.log(currentUserId)
  //   if (currentUserId && userId === currentUserId) {

  //     navigate("/");
  //   } else {
  //     navigate("/profile", { state: { userId } });
  //   }
  // };

  const handleUserClick = (userId) => {  //edited by farhan
    setShowDropdown(false);
    setQuery("");

<<<<<<< HEAD
    console.log("Clicked User ID:", userId);
    console.log("Current User ID:", currentUserId);

    // If user clicks own account
    if (userId === currentUserId) {
=======
    // save searched clicked user
    setCurrentUserId(userId);

    // clicked own profile
    if (userId === currentUser?._id) {
>>>>>>> eccc804cacdfd56e83e42beee89b140ace3b06d5
      navigate("/");
    } else {
      navigate("/profile", {
        state: { userId },
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showDropdown && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {users.length === 0 && !loading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No users found
            </div>
          )}

          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user._id)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition flex items-center space-x-3"
            >
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`
                }
                alt="avatar"
              />

              <div>
                <p className="text-sm font-medium text-gray-800">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
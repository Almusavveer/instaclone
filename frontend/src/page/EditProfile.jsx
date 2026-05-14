// src/pages/EditProfile.jsx

import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  useNavigate,
} from "react-router-dom";

const EditProfile = () => {
  const navigate =
    useNavigate();

  // 👤 States
  const [name, setName] =
    useState("");

  const [
    username,
    setUsername,
  ] = useState("");

  const [bio, setBio] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [avatar, setAvatar] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // 🔥 Load old profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Fetch user
  const fetchProfile =
    async () => {
      try {
        const res =
          await axios.get(
            "http://localhost:3000/api/auth/me",
            {
              withCredentials: true,
            }
          );

        console.log(
          "User:",
          res.data.user
        );

        const user =
          res.data.user;

        // ✅ Fill old values
        setName(
          user.name || ""
        );

        setUsername(
          user.username || ""
        );

        setBio(
          user.bio || ""
        );

        setEmail(
          user.email || ""
        );

        setPreview(
          user.avatar || ""
        );
      } catch (error) {
        console.log(error);
      }
    };

  // 🖼️ Image preview
  const handleImageChange = (
    e
  ) => {
    const file =
      e.target.files[0];

    if (file) {
      setAvatar(file);

      setPreview(
        URL.createObjectURL(
          file
        )
      );
    }
  };

  // ✅ Submit update
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "name",
          name
        );

        formData.append(
          "username",
          username
        );

        formData.append(
          "bio",
          bio
        );

        formData.append(
          "email",
          email
        );

        // 🖼️ Avatar
        if (avatar) {
          formData.append(
            "avatar",
            avatar
          );
        }

        const res =
          await axios.put(
            "http://localhost:3000/api/auth/update-profile",
            formData,
            {
              withCredentials: true,

              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        alert(
          res.data.message
        );

        // ✅ Redirect to home page
        navigate("/");
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            "Update failed"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center p-4">

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 md:p-8">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Edit Profile
          </h1>

          <p className="text-gray-500 mt-1">
            Update your account
            information
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8">

          <label
            htmlFor="avatarInput"
            className="relative cursor-pointer"
          >
            <img
              src={
                preview ||
                "https://ui-avatars.com/api/?name=User"
              }
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-md"
            />

            {/* Plus Icon */}
            <div className="absolute bottom-1 right-1 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-lg">
              +
            </div>
          </label>

          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={
              handleImageChange
            }
          />

          <p className="text-sm text-gray-500 mt-3">
            Change Profile Photo
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="@username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>

            <textarea
              rows="4"
              value={bio}
              onChange={(e) =>
                setBio(
                  e.target.value
                )
              }
              placeholder="Write something about yourself..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition active:scale-95 disabled:opacity-70"
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
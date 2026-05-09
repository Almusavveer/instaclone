// src/services/api.jsx

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// login api
export const loginUser = async (formData) => {
  const response = await api.post("/api/auth/login", formData);

  return response.data;
};

export default api;
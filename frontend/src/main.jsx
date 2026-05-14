// src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./context/auth_context.jsx";

// ✅ React Query
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// ✅ Create Query Client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>

    {/* ✅ React Query Provider */}
    <QueryClientProvider client={queryClient}>

      {/* ✅ Auth Provider */}
      <AuthProvider>

        {/* ✅ Router */}
        <BrowserRouter>
          <App />
        </BrowserRouter>

      </AuthProvider>

    </QueryClientProvider>

  </StrictMode>
);
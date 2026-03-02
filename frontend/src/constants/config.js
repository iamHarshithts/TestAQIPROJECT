// src/constants/config.js

// This will look for VITE_API_BASE_URL in your .env file
// If it doesn't find it, it defaults to your local address
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

// This will look for VITE_OWM_API_KEY in your .env file
export const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY || "9c9815bb312b7d2d7b1dda93051932a5";

export const AQI_THEMES = {
  1: { label: "Good", color: "bg-green-500", hex: "#308f53ff" },
  2: { label: "Fair", color: "bg-emerald-500", hex: "#3bb630ff" }, 
  3: { label: "Moderate", color: "bg-yellow-400", hex: "#facc15" },
  4: { label: "Poor", color: "bg-orange-500", hex: "#f97316" },
  5: { label: "Very Poor", color: "bg-red-600", hex: "#dc2626" }
};

export default OWM_API_KEY;
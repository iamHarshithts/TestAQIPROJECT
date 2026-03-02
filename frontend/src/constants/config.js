// src/constants/config.js

// This will look for VITE_API_BASE_URL in your .env file
// If it doesn't find it, it defaults to your local address
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

// This will look for VITE_OWM_API_KEY in your .env file
export const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY

export const AQI_THEMES = {
  1: { label: "Good", color: "bg-green-500", hex: "#308f53ff" ,textColor: "text-green-500" },
  2: { label: "Fair", color: "bg-emerald-500", hex: "#3bb630ff" ,textColor: "text-emerald-500"}, 
  3: { label: "Moderate", color: "bg-yellow-400", hex: "#facc15",textColor: "text-yellow-400" },
  4: { label: "Poor", color: "bg-orange-500", hex: "#f97316",textColor: "text-orange-500" },
  5: { label: "Very Poor", color: "bg-red-600", hex: "#dc2626",textColor: "text-red-600" }
};

export default OWM_API_KEY;
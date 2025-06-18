// src/pages/NotFound.tsx
import React from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-900 text-white px-6">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">
        Page not found. The page you are looking for doesn't exist or has been
        moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Sparkles className="h-5 w-5" />
        <span>Go Back Home</span>
      </button>
    </div>
  );
};

export default NotFound;

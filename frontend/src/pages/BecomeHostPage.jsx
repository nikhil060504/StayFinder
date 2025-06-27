import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";

const BecomeHostPage = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBecomeHost = async () => {
    setLoading(true);
    setError("");
    try {
      await api.put("/auth/become-host");
      await loadUser();
      setSuccess(true);
      window.location.reload(true);
    } catch (err) {
      setError("Failed to become a host. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/host/dashboard");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  if (user?.role === "host") {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          You are already a host!
        </h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition mt-4"
          onClick={() => navigate("/host/dashboard")}
        >
          Go to Host Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow mt-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Become a Host</h2>
      <p className="mb-6 text-gray-600">
        List your property, manage bookings, and earn money by becoming a host
        on StayFinder.
      </p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success ? (
        <>
          <div className="text-green-600 font-semibold mb-4 flex flex-col items-center justify-center">
            <span>You are now a host! Redirecting to your dashboard...</span>
            <LoadingSpinner size="md" />
          </div>
        </>
      ) : (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
          onClick={handleBecomeHost}
          disabled={loading}
        >
          {loading ? "Processing..." : "Become a Host"}
        </button>
      )}
    </div>
  );
};

export default BecomeHostPage;

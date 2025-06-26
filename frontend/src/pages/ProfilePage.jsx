import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

const ProfilePage = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBecomeHost = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.put("/auth/become-host");
      await loadUser(); // Reload user data to get updated role
      navigate("/host/dashboard"); // Redirect to host dashboard after becoming a host
    } catch (err) {
      setError(err.response?.data?.message || "Failed to become a host");
    } finally {
      setLoading(false);
    }
  };



  if (!user) {
    return <div className="max-w-xl mx-auto p-8">No user data found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Profile</h2>
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
          {user?.firstName?.charAt(0)}
          {user?.lastName?.charAt(0)}
        </div>
        <div>
          <div className="text-lg font-semibold">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-gray-500">{user?.email}</div>
        </div>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Role:</span> {user?.role || "user"}
      </div>

      {user?.role === "user" ? (
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Want to earn by sharing your space? Become a host to list your properties and manage bookings.
          </p>
          <button
            onClick={handleBecomeHost}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{loading ? "Processing..." : "Become a Host"}</span>
            {!loading && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
          </button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      ) : null}
      {user?.role === "host" && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Host Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/listings/new")}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition flex items-center justify-between group"
            >
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold">List New Property</span>
                <span className="text-sm opacity-90">Create a new listing</span>
              </div>
              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/host/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition flex items-center justify-between group"
            >
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold">Manage Properties</span>
                <span className="text-sm opacity-90">View and edit listings</span>
              </div>
              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Quick Tips</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Set competitive prices to attract more bookings</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Add high-quality photos to showcase your property</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Respond quickly to booking requests</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

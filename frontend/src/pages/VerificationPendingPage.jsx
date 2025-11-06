import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const VerificationPendingPage = () => {
  const navigate = useNavigate();
  const { user, loadUser, updateUser } = useAuth();
  const [status, setStatus] = useState("pending");
  const [checkCount, setCheckCount] = useState(0);
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        setCheckCount((prev) => prev + 1);
        console.log(`⏳ Still pending... Check count: ${checkCount + 1}`);

        const updatedUser = await loadUser();

        if (updatedUser?.role === "host") {
          console.log("✅ [PENDING] User approved! Role is now 'host'");
          setStatus("approved");
          updateUser({ role: "host", isVerified: true });

          setTimeout(() => {
            console.log(`🚀 [PENDING] Navigating to /profile`);
            navigate("/profile", { replace: true });
          }, 2000);

          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          return;
        }

        console.log(`📊 Verification status from API: ${updatedUser?.role}`);
      } catch (error) {
        console.error("Error checking approval status:", error);
      }
    };

    checkApprovalStatus();
    checkIntervalRef.current = setInterval(checkApprovalStatus, 2000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [loadUser, navigate, updateUser]);

  if (status === "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Congratulations!
          </h1>
          <p className="text-gray-600 mb-6">
            Your host verification has been approved. You can now list properties!
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="mb-6">
          <div className="inline-block">
            <svg
              className="w-16 h-16 text-blue-600 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Application Under Review
        </h1>

        <p className="text-gray-600 mb-6">
          Your host verification application is being reviewed by our admin team.
          We'll notify you as soon as it's approved!
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Status:</strong> Pending Review
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Checks:</strong> {checkCount}
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Checking every 2 seconds...
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Go to Profile
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded transition"
          >
            Back to Home
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          This page will automatically redirect when your application is approved.
        </p>
      </div>
    </div>
  );
};

export default VerificationPendingPage;


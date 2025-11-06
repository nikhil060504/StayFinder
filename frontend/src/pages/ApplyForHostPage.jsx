import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HostVerificationForm from "../components/HostVerificationForm";

const ApplyForHostPage = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {!showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              Become a Host
            </h1>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Why Host with Us?
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Earn money by sharing your property</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Flexible scheduling and pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>24/7 support from our team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Secure payment processing</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-700">
                  What You Need
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Valid government ID</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Property address and photos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Bank account for payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Property details and amenities</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Start Your Application
            </button>
          </div>
        ) : (
          <HostVerificationForm onClose={() => setShowForm(false)} />
        )}
      </div>
    </div>
  );
};

export default ApplyForHostPage;


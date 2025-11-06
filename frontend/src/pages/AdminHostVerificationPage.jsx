import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminHostVerificationPage = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5001/api/host-verification/pending",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setApplications(response.data.verifications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      await axios.put(
        `http://localhost:5001/api/host-verification/${selectedApp._id}/approve`,
        { notes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Application approved!");
      setSelectedApp(null);
      setNotes("");
      fetchPendingApplications();
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Error approving application");
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await axios.put(
        `http://localhost:5001/api/host-verification/${selectedApp._id}/reject`,
        { rejectionReason: reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Application rejected!");
      setSelectedApp(null);
      setNotes("");
      fetchPendingApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Error rejecting application");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Host Verification Applications
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="md:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Pending ({applications.length})
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {applications.map((app) => (
                <div
                  key={app._id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedApp?._id === app._id ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="font-semibold">
                    {app.user?.firstName} {app.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{app.user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Details */}
          <div className="md:col-span-2">
            {selectedApp ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Application Details</h2>

                {/* Personal Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">First Name</p>
                      <p className="font-semibold">
                        {selectedApp.personalInfo?.firstName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Name</p>
                      <p className="font-semibold">
                        {selectedApp.personalInfo?.lastName}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Phone Number</p>
                      <p className="font-semibold">
                        {selectedApp.personalInfo?.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Account Number</p>
                      <p className="font-semibold">
                        {selectedApp.bankDetails?.accountNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">IFSC Code</p>
                      <p className="font-semibold">
                        {selectedApp.bankDetails?.ifscCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <p className="text-gray-700">
                    {selectedApp.locationVerification?.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedApp.locationVerification?.city},{" "}
                    {selectedApp.locationVerification?.state},{" "}
                    {selectedApp.locationVerification?.country}
                  </p>
                </div>

                {/* Admin Notes */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select an application to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHostVerificationPage;


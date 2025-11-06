import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HostVerificationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  // Step 2: Documents
  const [documents, setDocuments] = useState({
    aadharNumber: "",
    aadharFile: null,
    panNumber: "",
    panFile: null,
  });

  // Step 3: Bank Details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  });

  // Step 4: Location
  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setDocuments((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setDocuments((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  };

  const submitStep = async () => {
    try {
      setLoading(true);
      setError("");

      let stepData = {};
      if (currentStep === 1) stepData = personalInfo;
      else if (currentStep === 2) stepData = documents;
      else if (currentStep === 3) stepData = bankDetails;
      else if (currentStep === 4) stepData = location;

      const formData = new FormData();
      Object.keys(stepData).forEach((key) => {
        formData.append(key, stepData[key]);
      });

      await axios.post(
        `http://localhost:5001/api/host-verification/step/${currentStep}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        setSuccess("✅ Verification submitted successfully! Redirecting...");
        setTimeout(() => {
          navigate("/host/verification-pending");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting step");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Host Verification
        </h1>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 mx-1 rounded ${
                  step <= currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
          <p className="text-center text-gray-600">
            Step {currentStep} of 4
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Personal Information
            </h2>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={personalInfo.firstName}
              onChange={handlePersonalInfoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={personalInfo.lastName}
              onChange={handlePersonalInfoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={personalInfo.phoneNumber}
              onChange={handlePersonalInfoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Step 2: Documents */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Documents
            </h2>
            <input
              type="text"
              name="aadharNumber"
              placeholder="Aadhar Number"
              value={documents.aadharNumber}
              onChange={handleDocumentChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              name="aadharFile"
              onChange={handleDocumentChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="panNumber"
              placeholder="PAN Number"
              value={documents.panNumber}
              onChange={handleDocumentChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              name="panFile"
              onChange={handleDocumentChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Step 3: Bank Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Bank Details
            </h2>
            <input
              type="text"
              name="accountNumber"
              placeholder="Account Number"
              value={bankDetails.accountNumber}
              onChange={handleBankDetailsChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="ifscCode"
              placeholder="IFSC Code"
              value={bankDetails.ifscCode}
              onChange={handleBankDetailsChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="accountHolderName"
              placeholder="Account Holder Name"
              value={bankDetails.accountHolderName}
              onChange={handleBankDetailsChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Step 4: Location */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Location Verification
            </h2>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={location.address}
              onChange={handleLocationChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={location.city}
              onChange={handleLocationChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={location.state}
              onChange={handleLocationChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={location.country}
              onChange={handleLocationChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Previous
            </button>
          )}
          <button
            onClick={submitStep}
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition"
          >
            {loading ? "Loading..." : currentStep === 4 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostVerificationForm;


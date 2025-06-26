import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data);
    } catch (err) {
      setError("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleMockPayment = async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    // Simulate payment delay
    setTimeout(async () => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
      try {
        await api.post("/bookings", {
          listingId: id,
          ...bookingData,
        });
        setShowPaymentModal(false);
        alert("Booking request submitted successfully!");
        // Optionally navigate to bookings page
      } catch (err) {
        setPaymentError("Failed to create booking. Please try again.");
      }
    }, 1200);
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    if (!nights || !listing) return 0;

    const basePrice = nights * listing.price.base;
    const cleaningFee = listing.price.cleaningFee || 0;
    const serviceFee = listing.price.serviceFee || 0;

    return basePrice + cleaningFee + serviceFee;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${
            i < fullStars ? "text-yellow-400" : "text-gray-300"
          } fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading property details..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center">
        <div className="text-gray-500 text-lg mb-4">Property not found</div>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Properties
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {listing.title}
          </h1>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {listing.averageRating > 0 && (
              <div className="flex items-center">
                <div className="flex items-center mr-1">
                  {renderStars(listing.averageRating)}
                </div>
                <span className="font-medium">
                  {listing.averageRating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {listing.location.city}, {listing.location.country}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative">
                <img
                  src={
                    listing.images?.[currentImageIndex] ||
                    "https://via.placeholder.com/800x400?text=No+Image"
                  }
                  alt={listing.title}
                  className="w-full h-96 object-cover rounded-lg"
                />

                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                      disabled={currentImageIndex === 0}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          Math.min(
                            listing.images.length - 1,
                            currentImageIndex + 1
                          )
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                      disabled={currentImageIndex === listing.images.length - 1}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {listing.images && listing.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {listing.maxGuests}
                  </div>
                  <div className="text-sm text-gray-600">Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {listing.bedrooms}
                  </div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {listing.beds}
                  </div>
                  <div className="text-sm text-gray-600">Beds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {listing.bathrooms}
                  </div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">About this place</h3>
                <p className="text-gray-700 leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 capitalize">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    ${listing.price.base}
                  </span>
                  <span className="text-gray-600 ml-1">/ night</span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingData.checkIn}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          checkIn: e.target.value,
                        }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingData.checkOut}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          checkOut: e.target.value,
                        }))
                      }
                      min={
                        bookingData.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select
                    value={bookingData.guests}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        guests: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from(
                      { length: listing.maxGuests },
                      (_, i) => i + 1
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                {calculateNights() > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        ${listing.price.base} x {calculateNights()} nights
                      </span>
                      <span>${listing.price.base * calculateNights()}</span>
                    </div>
                    {listing.price.cleaningFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Cleaning fee</span>
                        <span>${listing.price.cleaningFee}</span>
                      </div>
                    )}
                    {listing.price.serviceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>${listing.price.serviceFee}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${calculateTotalPrice()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading || !isAuthenticated}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Processing...
                    </>
                  ) : !isAuthenticated ? (
                    "Login to Book"
                  ) : (
                    "Reserve"
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-600 text-center">
                    You need to{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      sign in
                    </button>{" "}
                    to make a booking
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPaymentModal(false)}
              disabled={paymentLoading}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Mock Payment</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={paymentLoading}
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
                  disabled={paymentLoading}
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
                  disabled={paymentLoading}
                />
              </div>
              <button
                onClick={handleMockPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Pay & Reserve"}
              </button>
              {paymentError && (
                <div className="text-red-500 text-sm text-center">
                  {paymentError}
                </div>
              )}
              {paymentSuccess && (
                <div className="text-green-600 text-sm text-center">
                  Payment successful! Booking created.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;

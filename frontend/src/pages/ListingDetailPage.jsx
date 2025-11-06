import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import StarRating from "../components/StarRating";
import HostContactModal from "../components/HostContactModal";
import VerifiedBadge from "../components/VerifiedBadge";
import { initiateRazorpayPayment } from "../utils/razorpay";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError(null);

      // Create booking first
      const bookingResponse = await api.post("/bookings", {
        listingId: id,
        ...bookingData,
      });

      const bookingId = bookingResponse.data._id;
      const totalPrice = calculateTotalPrice();

      // Create payment order
      const orderResponse = await api.post("/payments/create-order", {
        bookingId,
      });

      // Initiate Razorpay payment
      await initiateRazorpayPayment({
        keyId: orderResponse.data.keyId,
        orderId: orderResponse.data.orderId,
        amount: totalPrice,
        currency: "INR",
        customerName: "Guest User",
        customerEmail: "guest@stayfinder.com",
        customerPhone: "9999999999",
        onSuccess: async (paymentData) => {
          try {
            // Verify payment
            await api.post("/payments/verify", {
              orderId: orderResponse.data.orderId,
              paymentId: paymentData.razorpay_payment_id,
              signature: paymentData.razorpay_signature,
            });

            setPaymentLoading(false);
            alert("Payment successful! Your booking is confirmed.");
            setTimeout(() => {
              navigate("/bookings");
            }, 2000);
          } catch (err) {
            setPaymentError(
              "Payment verification failed. Please contact support."
            );
            setPaymentLoading(false);
          }
        },
        onError: (error) => {
          setPaymentError(error);
          setPaymentLoading(false);
        },
      });
    } catch (err) {
      setPaymentError(
        err.response?.data?.message ||
          "Failed to create booking. Please try again."
      );
      setPaymentLoading(false);
    }
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
                <StarRating rating={listing.averageRating} size="md" />
                <span className="font-medium ml-2">
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
                    listing.images?.[currentImageIndex]?.url ||
                    listing.images?.[currentImageIndex] ||
                    "/images/no-image-placeholder.jpg"
                  }
                  alt={listing.title}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/no-image-placeholder.jpg";
                  }}
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
                        src={typeof image === "object" ? image.url : image}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/no-image-placeholder.jpg";
                        }}
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
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

            {/* Carbon Footprint */}
            {listing.carbonFootprint && listing.carbonFootprint.value > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-900">
                    Carbon Footprint
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">
                      Total Emissions
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {listing.carbonFootprint.value}{" "}
                      {listing.carbonFootprint.unit}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Per Night</div>
                    <div className="text-2xl font-bold text-green-600">
                      {listing.carbonFootprint.perNight}{" "}
                      {listing.carbonFootprint.unit}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-4">
                  ♻️ This property's carbon footprint is calculated based on its
                  size, amenities, and location. Choose eco-friendly stays to
                  reduce your environmental impact!
                </p>
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
                  disabled={paymentLoading || !isAuthenticated}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Processing Payment...
                    </>
                  ) : !isAuthenticated ? (
                    "Login to Book"
                  ) : (
                    "Reserve & Pay"
                  )}
                </button>
                {paymentError && (
                  <div className="text-red-500 text-sm text-center mt-2">
                    {paymentError}
                  </div>
                )}

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

              {/* Host Information */}
              {listing.host && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Hosted by
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {listing.host.firstName} {listing.host.lastName}
                      </p>
                      {listing.host.isVerified && (
                        <div className="mt-1">
                          <VerifiedBadge
                            isVerified={true}
                            size="sm"
                            showText={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Host Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.058.3.102.605.102.924 0 1.748.585 3.364 1.56 4.657l1.548.773a1 1 0 01.54 1.06l-.74 4.435a1 1 0 01-.986.836H3a1 1 0 01-1-1V3z" />
                  </svg>
                  Contact Host
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  📞 Instant phone contact with property owner
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <HostContactModal
        listingId={id}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default ListingDetailPage;

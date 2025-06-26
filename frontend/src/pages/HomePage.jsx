import React, { useEffect, useState } from "react";
import api from "../api";
import PropertyCard from "../components/PropertyCard.jsx";
import HeroSection from "../components/HeroSection.jsx";
import SearchBar from "../components/SearchBar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalListings: 0,
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.keys(searchParams).forEach((key) => {
        if (searchParams[key]) {
          queryParams.append(key, searchParams[key]);
        }
      });

      const response = await api.get(`/listings?${queryParams.toString()}`);
      const { listings, currentPage, totalPages, totalListings } =
        response.data;

      setProperties(listings);
      setPagination({ currentPage, totalPages, totalListings });

      if (Object.keys(searchParams).length > 0) {
        setSearchResults(listings);
      }
    } catch (err) {
      setError("Failed to load properties");
      console.error("Error loading properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchData) => {
    setSearchLoading(true);
    await loadProperties(searchData);
    setSearchLoading(false);
  };

  const clearSearch = () => {
    setSearchResults(null);
    loadProperties();
  };

  if (loading && !searchLoading) {
    return <LoadingSpinner size="lg" text="Loading amazing properties..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={() => loadProperties()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <SearchBar onSearch={handleSearch} loading={searchLoading} />
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Header */}
        {searchResults && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results
              </h2>
              <p className="text-gray-600">
                {pagination.totalListings} properties found
              </p>
            </div>
            <button
              onClick={clearSearch}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {!searchResults && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover handpicked accommodations from around the world. Each
              property is carefully selected to ensure your perfect stay.
            </p>
          </div>
        )}

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500">
              {searchResults
                ? "Try adjusting your search criteria"
                : "Check back later for new listings"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => loadProperties({ page })}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    page === pagination.currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border"
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose StayFinder?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make it easy to find and book the perfect accommodation for
              your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Properties
              </h3>
              <p className="text-gray-600">
                All properties are verified and meet our quality standards
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Booking
              </h3>
              <p className="text-gray-600">
                Simple and secure booking process with instant confirmation
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Round-the-clock customer support for all your needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

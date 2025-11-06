import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import VerifiedBadge from "./VerifiedBadge";

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <Link to={`/listings/${property._id}`}>
        <div className="relative">
          <img
            src={
              property.images?.[0]?.url ||
              property.images?.[0] ||
              "/images/no-image-placeholder.jpg"
            }
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/no-image-placeholder.jpg";
            }}
          />
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize">
              {property.propertyType}
            </span>
          </div>
          {property.averageRating > 0 && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
              <StarRating rating={property.averageRating} size="sm" />
              <span className="text-xs font-semibold text-gray-700 ml-1">
                {property.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              {property.host?.isVerified && (
                <div className="mt-1">
                  <VerifiedBadge isVerified={true} size="sm" showText={true} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-3">
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
              {property.location?.city}, {property.location?.country}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span>{property.maxGuests} guests</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span>
                {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${property.price?.base}
              </span>
              <span className="text-gray-500 text-sm ml-1">/ night</span>
            </div>
            <div className="text-right">
              {property.price?.cleaningFee > 0 && (
                <p className="text-xs text-gray-500">
                  +${property.price.cleaningFee} cleaning fee
                </p>
              )}
            </div>
          </div>

          {property.carbonFootprint?.value > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-700">
                  Carbon Footprint
                </p>
                <p className="text-sm font-bold text-green-600">
                  {property.carbonFootprint.perNight}{" "}
                  {property.carbonFootprint.unit}/night
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;

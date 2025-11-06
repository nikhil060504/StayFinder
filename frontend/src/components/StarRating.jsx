import React from "react";

const StarRating = ({ rating, size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const stars = [];
  const fullStars = Math.floor(rating);

  for (let i = 0; i < 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`${sizeClasses[size]} ${
          i < fullStars ? "text-yellow-400" : "text-gray-300"
        } fill-current`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    );
  }

  return <div className="flex items-center">{stars}</div>;
};

export default StarRating;


import React from "react";

const VerifiedBadge = ({ isVerified, size = "md" }) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      <svg
        className={`${sizeClasses[size]} text-blue-500 fill-current`}
        viewBox="0 0 20 20"
      >
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
      </svg>
      <span className="text-xs font-semibold text-blue-500">Verified</span>
    </div>
  );
};

export default VerifiedBadge;


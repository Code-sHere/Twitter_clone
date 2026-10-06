import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "medium" | "lg";
  className?: string;
}

const Loadingspinner = ({
  size = "medium",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClass = {
    sm: "h-4 w-4",
    medium: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-600 border-t-blue-500 ${sizeClass} ${className}`}
    />
  );
};

export default Loadingspinner;
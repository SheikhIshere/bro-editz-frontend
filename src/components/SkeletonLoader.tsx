import React from "react";

interface SkeletonLoaderProps {
  height?: string;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  height = "h-32", 
  className = "" 
}) => {
  return (
    <div 
      className={`
        animate-pulse 
        bg-white/10 
        rounded-lg 
        ${height}
        w-full
        ${className}
      `}
    >
      <div className="h-full bg-white/20 rounded" />
    </div>
  );
};

export default SkeletonLoader;

import React from "react";

interface LoadingSpinnerProps {
  /** 是否全屏显示 */
  fullScreen?: boolean;
  /** 尺寸：sm|md|lg */
  size?: "sm" | "md" | "lg";
  /** 加载文字 */
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = "md",
  text,
}) => {
  // 尺寸映射
  const sizeMap = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-4",
    lg: "h-16 w-16 border-4",
  };

  // 全屏样式
  const containerClass = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClass}>
      {/* 旋转圆圈 */}
      <div
        className={`${sizeMap[size]} rounded-full border-blue-200 border-t-blue-500 animate-spin`}
      />

      {/* 加载文字 */}
      {text && <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

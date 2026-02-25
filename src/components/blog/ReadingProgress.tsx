import React, { useEffect, useState } from "react";

const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 计算滚动百分比
      const totalScroll = documentHeight - windowHeight;
      const currentProgress =
        totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;

      setProgress(currentProgress);
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div
        className="h-full bg-blue-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;

import React, { useState, useEffect, useRef } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string; // 占位图
  webp?: boolean; // 是否支持WebP
  width?: number;
  height?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Ctext x="50" y="50" font-size="14" text-anchor="middle" dy=".3em" fill="%23999"%3E加载中%3C/text%3E%3C/svg%3E',
  webp = true,
  width,
  height,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 进入视口时加载真实图片
            loadImage();
            observer.disconnect(); // 加载后停止观察
          }
        });
      },
      {
        rootMargin: "50px", // 提前50px加载
        threshold: 0.01,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const loadImage = () => {
    const img = new Image();

    // 检查是否支持WebP
    const useWebP = webp && checkWebPSupport();

    // 构建图片URL（可以根据需要添加WebP版本）
    let imageUrl = src;
    if (useWebP && src.match(/\.(jpg|jpeg|png)$/)) {
      imageUrl = src.replace(/\.(jpg|jpeg|png)$/, ".webp");
    }

    img.src = imageUrl;
    img.onload = () => {
      setImageSrc(imageUrl);
      setIsLoaded(true);
    };
    img.onerror = () => {
      // WebP加载失败，回退到原图
      if (useWebP) {
        loadOriginalImage();
      } else {
        setError(true);
        setImageSrc(placeholder);
      }
    };
  };

  const loadOriginalImage = () => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setError(true);
      setImageSrc(placeholder);
    };
  };

  // 检查浏览器是否支持WebP
  const checkWebPSupport = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("image/webp") === 5;
  };

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {/* 占位图/模糊效果 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* 图片 */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`
          ${className}
          transition-opacity duration-300
          ${isLoaded ? "opacity-100" : "opacity-0"}
          ${error ? "opacity-50" : ""}
        `}
        style={{ width, height }}
        loading="lazy" // 原生懒加载作为后备
      />

      {/* 加载错误提示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm">
          图片加载失败
        </div>
      )}
    </div>
  );
};

export default LazyImage;

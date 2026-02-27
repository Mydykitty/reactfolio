import React, { useState, useEffect, useRef } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  webp?: boolean;
  width?: number;
  height?: number;
  mobile?: string; // 移动端图片
  tablet?: string; // 平板端图片
  desktop?: string; // 桌面端图片
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3C/svg%3E',
  webp = true,
  width,
  height,
  mobile,
  tablet,
  desktop,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 根据屏幕宽度选择图片
  const getResponsiveImage = () => {
    if (typeof window === "undefined") return src;

    const width = window.innerWidth;
    if (mobile && width < 640) return mobile;
    if (tablet && width >= 640 && width < 1024) return tablet;
    if (desktop && width >= 1024) return desktop;
    return src;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px", threshold: 0.01 },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const loadImage = () => {
    const img = new Image();

    // 获取响应式图片
    const responsiveSrc = getResponsiveImage();

    // 检查是否支持WebP
    const useWebP = webp && checkWebPSupport();

    let imageUrl = responsiveSrc;
    if (useWebP && responsiveSrc.match(/\.(jpg|jpeg|png)$/)) {
      imageUrl = responsiveSrc.replace(/\.(jpg|jpeg|png)$/, ".webp");
    }

    img.src = imageUrl;
    img.onload = () => {
      setImageSrc(imageUrl);
      setIsLoaded(true);
    };
    img.onerror = () => {
      if (useWebP) {
        loadOriginalImage(responsiveSrc);
      } else {
        setError(true);
        setImageSrc(placeholder);
      }
    };
  };

  const loadOriginalImage = (originalSrc: string) => {
    const img = new Image();
    img.src = originalSrc;
    img.onload = () => {
      setImageSrc(originalSrc);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setError(true);
      setImageSrc(placeholder);
    };
  };

  const checkWebPSupport = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("image/webp") === 5;
  };

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

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
        loading="lazy"
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm">
          图片加载失败
        </div>
      )}
    </div>
  );
};

export default LazyImage;

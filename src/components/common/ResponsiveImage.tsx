import React from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  mobile?: string; // 移动端图片
  tablet?: string; // 平板端图片
  desktop?: string; // 桌面端图片
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = "",
  sizes = "100vw",
  mobile,
  tablet,
  desktop,
}) => {
  // 生成srcset
  const generateSrcSet = () => {
    const sources = [];

    if (mobile) {
      sources.push(`${mobile} 480w`);
    }
    if (tablet) {
      sources.push(`${tablet} 768w`);
    }
    if (desktop) {
      sources.push(`${desktop} 1024w`);
    }

    // 默认图片
    sources.push(`${src} 1920w`);

    return sources.join(", ");
  };

  return (
    <img
      src={src}
      srcSet={generateSrcSet()}
      sizes={sizes}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export default ResponsiveImage;

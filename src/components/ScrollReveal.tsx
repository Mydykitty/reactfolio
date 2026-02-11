import { useInView } from "react-intersection-observer";
import type { FC, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
}

const ScrollReveal: FC<ScrollRevealProps> = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // 只触发一次
    threshold: 0.2, // 20% 出现在视口才触发
  });

  return (
    <div ref={ref} className={`scroll-section ${inView ? "show" : ""}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;

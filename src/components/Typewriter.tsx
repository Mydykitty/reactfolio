import { useState, useEffect } from "react";

interface TypewriterProps {
  texts: string[]; // 要轮换的文字数组
  delay?: number; // 打字速度
  pause?: number; // 暂停时间
}

const Typewriter: React.FC<TypewriterProps> = ({
  texts,
  delay = 100,
  pause = 2000,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        const fullText = texts[currentTextIndex];

        if (!isDeleting) {
          // 打字
          if (currentText.length < fullText.length) {
            setCurrentText(fullText.slice(0, currentText.length + 1));
          } else {
            // 打完了，等待后开始删除
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          // 删除
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1));
          } else {
            // 删完了，切换到下一个词
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? delay / 2 : delay,
    );

    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, isDeleting, texts, delay, pause]);

  return (
    <span className="inline-block min-w-[200px] text-blue-600 dark:text-blue-400">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default Typewriter;

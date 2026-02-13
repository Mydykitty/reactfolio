import React from "react";
import Typewriter from "./Typewriter";

interface HeaderProps {
  name: string;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ name, title }) => {
  return (
    <header className="text-center py-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {name}
      </h1>
      <h3 className="text-xl text-gray-600 dark:text-gray-300">
        <Typewriter
          texts={[
            "前端开发工程师",
            "React 爱好者",
            "TypeScript 玩家",
            "UI 设计控",
          ]}
        />
      </h3>
    </header>
  );
};

export default Header;

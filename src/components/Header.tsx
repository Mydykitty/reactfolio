import React from "react";
import { Link } from "react-router-dom"; // 添加 Link 导入
import { useAuthStore } from "../store/authStore"; // 导入 auth store
import Typewriter from "./Typewriter";

interface HeaderProps {
  name: string;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ name, title }) => {
  const { user } = useAuthStore(); // 获取当前用户

  return (
    <header className="text-center py-8 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
      {/* 导航栏 - 右上角 */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {/* 博客链接 */}
        <Link
          to="/blog"
          className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-1 text-sm"
        >
          博客
        </Link>

        {/* 个人资料链接（仅登录用户可见） */}
        {user && (
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-1 text-sm"
          >
            <img
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.user_name}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.user_metadata?.user_name}&background=random`;
              }}
            />
            <span>个人资料</span>
          </Link>
        )}
      </div>

      {/* 标题内容 */}
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {name}
      </h1>
      <h3 className="text-xl text-gray-600 dark:text-gray-300">
        <Typewriter
          texts={[title, "React 爱好者", "TypeScript 玩家", "UI 设计控"]}
        />
      </h3>
    </header>
  );
};

export default Header;

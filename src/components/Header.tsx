import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Typewriter from "./Typewriter";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import LazyImage from "./common/LazyImage"; // 🔴 导入 LazyImage

interface HeaderProps {
  name: string;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ name, title }) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <header className="text-center py-8 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
      {/* 导航栏 - 右上角 */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <LanguageSwitcher />

        <Link
          to="/blog"
          className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-1 text-sm"
        >
          {t("common.blog")}
        </Link>

        {user && (
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-1 text-sm"
          >
            {/* 🔴 使用 LazyImage 组件 */}
            <LazyImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.user_name}
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
            <span>{t("common.profile")}</span>
          </Link>
        )}
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {t("header.name")}
      </h1>
      <h3 className="text-xl text-gray-600 dark:text-gray-300">
        <Typewriter
          texts={[
            t("header.title"),
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

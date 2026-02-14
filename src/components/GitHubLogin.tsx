import React, { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const GitHubLogin: React.FC = () => {
  const {
    user,
    isLoading,
    error,
    signInWithGitHub,
    signOut,
    clearError,
    initialize,
  } = useAuthStore();

  // 初始化认证状态
  useEffect(() => {
    initialize();
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  // 已登录状态
  if (user) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <img
          src={user.user_metadata.avatar_url}
          alt={user.user_metadata.user_name}
          className="w-10 h-10 rounded-full border-2 border-blue-500"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">
            {user.user_metadata.user_name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          退出
        </button>
      </div>
    );
  }

  // 未登录状态
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <button
        onClick={signInWithGitHub}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">使用 GitHub 登录</span>
      </button>

      <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
        登录后可以留言、点赞 ✨
      </p>
    </div>
  );
};

export default GitHubLogin;

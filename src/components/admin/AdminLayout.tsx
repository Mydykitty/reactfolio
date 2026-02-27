import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  // 检查是否管理员（可以根据邮箱判断）
  const isAdmin = user?.email === "mydykitty@126.com";

  if (!user) {
    navigate("/");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">无权访问</h1>
        <p className="text-gray-600 dark:text-gray-400">
          只有管理员可以访问后台
        </p>
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/admin"
                className="flex items-center px-4 text-gray-900 dark:text-white font-bold"
              >
                管理后台
              </Link>
              <div className="flex space-x-4 ml-6">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-3 text-gray-700 dark:text-gray-300 hover:text-blue-500"
                >
                  仪表盘
                </Link>
                <Link
                  to="/admin/posts"
                  className="inline-flex items-center px-3 text-gray-700 dark:text-gray-300 hover:text-blue-500"
                >
                  文章管理
                </Link>
                <Link
                  to="/admin/categories"
                  className="inline-flex items-center px-3 text-gray-700 dark:text-gray-300 hover:text-blue-500"
                >
                  分类管理
                </Link>
                {/* 🔴 新增：个人资料链接 */}
                <Link
                  to="/profile"
                  className="inline-flex items-center px-3 text-gray-700 dark:text-gray-300 hover:text-blue-500"
                >
                  个人资料
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500"
              >
                返回网站
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

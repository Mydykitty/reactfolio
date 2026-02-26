import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Stats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
}

interface RecentPost {
  id: number;
  title: string;
  created_at: string;
  view_count: number;
  is_published: boolean;
}

interface CategoryStat {
  name: string;
  post_count: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentPosts();
    fetchCategoryStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 查询文章统计
      const { data: posts } = await supabase
        .from("posts")
        .select("view_count, is_published");

      // 查询分类数量
      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      // 查询评论总数（如果有评论表）
      const { count: commentsCount } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true });

      if (posts) {
        setStats({
          totalPosts: posts.length,
          totalViews: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
          totalComments: commentsCount || 0,
          publishedPosts: posts.filter((p) => p.is_published).length,
          draftPosts: posts.filter((p) => !p.is_published).length,
          totalCategories: categoriesCount || 0,
        });
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    }
  };

  const fetchRecentPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, title, created_at, view_count, is_published")
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentPosts(data || []);
  };

  const fetchCategoryStats = async () => {
    const { data } = await supabase
      .from("categories")
      .select("name, post_count")
      .order("post_count", { ascending: false })
      .limit(5);

    setCategoryStats(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 总文章 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总文章</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalPosts}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-green-600">
              已发布: {stats.publishedPosts}
            </span>
            <span className="text-yellow-600">草稿: {stats.draftPosts}</span>
          </div>
        </div>

        {/* 总阅读量 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                总阅读量
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 总评论 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总评论</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalComments}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg
                className="w-8 h-8 text-purple-600 dark:text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 全部分类 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                全部分类
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalCategories}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <svg
                className="w-8 h-8 text-yellow-600 dark:text-yellow-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近文章 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📝</span> 最近文章
          </h2>
          <div className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="font-medium hover:text-blue-500"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span>👁️ {post.view_count}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          post.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.is_published ? "已发布" : "草稿"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">暂无文章</p>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link
              to="/admin/posts"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              查看全部 →
            </Link>
          </div>
        </div>

        {/* 分类统计 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span> 分类统计
          </h2>
          <div className="space-y-3">
            {categoryStats.length > 0 ? (
              categoryStats.map((cat) => (
                <div
                  key={cat.name}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="font-medium">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {cat.post_count} 篇文章
                    </span>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (cat.post_count / Math.max(...categoryStats.map((c) => c.post_count))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">暂无分类</p>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link
              to="/admin/categories"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              管理分类 →
            </Link>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">⚡ 快捷操作</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/posts/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            写新文章
          </Link>
          <Link
            to="/admin/categories"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            管理分类
          </Link>
          <Link
            to="/blog"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            查看博客
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

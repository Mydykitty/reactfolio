import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BlogCard from "../components/blog/BlogCard";
import type { Post, Category } from "../types/blog";

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 🔴 新增：搜索相关状态
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, searchQuery]); // 分类或搜索变化时重新查询

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    // 🔴 按分类筛选
    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    // 🔴 按搜索词筛选
    if (searchQuery.trim()) {
      query = query.or(
        `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`,
      );
    }

    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("post_count", { ascending: false });
    setCategories(data || []);
  };

  // 🔴 防抖搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value); // 输入框实时更新

    // 清除之前的定时器
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 设置新的定时器（500ms后搜索）
    const timeout = setTimeout(() => {
      fetchPosts(); // 真正执行搜索
    }, 500);

    setSearchTimeout(timeout);
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
        >
          <span>←</span> 返回首页
        </Link>
      </div>

      <div className="flex gap-8">
        {/* 侧边栏 */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sticky top-4">
            <h3 className="font-bold mb-4">分类</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCategory === null
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  全部文章
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex justify-between ${
                      selectedCategory === cat.id
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-sm">{cat.post_count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 文章列表 */}
        <main className="flex-1">
          {/* 🔴 搜索框 */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索文章标题或内容..."
                className="w-full px-4 py-3 pl-10 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {/* 搜索状态提示 */}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    fetchPosts();
                  }}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 搜索结果提示 */}
            {searchQuery && !loading && (
              <p className="mt-2 text-sm text-gray-500">
                找到 {posts.length} 篇包含 "{searchQuery}" 的文章
              </p>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-8">
            {searchQuery ? `搜索: ${searchQuery}` : "博客文章"}
          </h1>

          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? "没有找到相关文章" : "暂无文章"}
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} searchQuery={searchQuery} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BlogPage;

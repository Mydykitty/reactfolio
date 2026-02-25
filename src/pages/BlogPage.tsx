import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BlogCard from "../components/blog/BlogCard";
import BlogTOC from "../components/blog/BlogTOC"; // 1. 导入 TOC 组件
import type { Post, Category } from "../types/blog";

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  // 2. 添加选中的文章内容状态（用于TOC）
  const [selectedPostContent, setSelectedPostContent] = useState<string>("");

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory]);

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

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
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

  // 3. 处理文章点击，显示目录
  const handlePostSelect = (post: Post) => {
    setSelectedPostContent(post.content);
    // 滚动到文章列表顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1">
            <span>←</span> 返回首页
          </Link>
        </div>

        <div className="flex gap-8">
          {/* 左侧：分类侧边栏 */}
          <aside className="w-48 flex-shrink-0">
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

          {/* 中间：文章列表 */}
          <main className="flex-1 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">博客文章</h1>

            {loading ? (
                <div className="text-center py-12">加载中...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无文章</div>
            ) : (
                <div className="grid gap-6">
                  {posts.map((post) => (
                      <div key={post.id} onClick={() => handlePostSelect(post)}>
                        <BlogCard post={post} />
                      </div>
                  ))}
                </div>
            )}
          </main>

          {/* 右侧：目录（只在选中文章时显示） */}
          {selectedPostContent && (
              <aside className="w-64 flex-shrink-0">
                <div className="sticky top-4">
                  <BlogTOC content={selectedPostContent} />
                </div>
              </aside>
          )}
        </div>
      </div>
  );
};

export default BlogPage;
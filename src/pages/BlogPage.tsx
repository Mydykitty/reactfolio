import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import BlogCard from "../components/blog/BlogCard";
import type { Post, Category } from "../types/blog";

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold mb-8">博客文章</h1>

          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无文章</div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BlogPage;

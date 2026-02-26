import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Post } from "../../types/blog";

const PostManager: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
    setLoading(false);
  };

  const deletePost = async (id: number) => {
    if (!window.confirm("确定要删除这篇文章吗？")) return;

    try {
      // 1. 先获取文章的分类ID
      const { data: post } = await supabase
        .from("posts")
        .select("category_id")
        .eq("id", id)
        .single();

      // 2. 删除文章
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;

      // 3. 如果文章有分类，分类文章数减1
      if (post?.category_id) {
        // 先查询当前值
        const { data: category } = await supabase
          .from("categories")
          .select("post_count")
          .eq("id", post.category_id)
          .single();

        if (category) {
          await supabase
            .from("categories")
            .update({ post_count: Math.max(0, category.post_count - 1) })
            .eq("id", post.category_id);
        }
      }

      // 4. 刷新列表
      fetchPosts();
    } catch (err) {
      console.error("删除失败:", err);
      alert("删除失败");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">文章管理</h1>
        <Link
          to="/admin/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          写新文章
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  发布时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  阅读量
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{post.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.is_published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">{post.view_count}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PostManager;

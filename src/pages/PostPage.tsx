import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase";
import type { Post } from "../types/blog";

const PostPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`*, category:categories(*)`)
      .eq("slug", slug)
      .single();

    if (data) {
      setPost(data);
      await supabase
        .from("posts")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;
  if (!post) return <div className="text-center py-12">文章不存在</div>;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* 返回链接 */}
      <Link
        to="/blog"
        className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
      >
        ← 返回博客列表
      </Link>

      {/* 标题 */}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      {/* 元信息 */}
      <div className="flex items-center gap-4 mb-8 text-gray-500 dark:text-gray-400">
        <span>📅 {new Date(post.published_at).toLocaleDateString()}</span>
        <span>👁️ {post.view_count} 阅读</span>
        <span>❤️ {post.like_count} 点赞</span>
      </div>

      {/* 标签 */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Markdown内容 - 这是最关键的部分 */}
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default PostPage;

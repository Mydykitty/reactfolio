import React from "react";
import { Link } from "react-router-dom";
import type { Post } from "../../types/blog";

interface BlogCardProps {
  post: Post;
  searchQuery?: string; // 新增：搜索关键词，用于高亮
}

const BlogCard: React.FC<BlogCardProps> = ({ post, searchQuery = "" }) => {
  // 高亮搜索关键词的函数
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;

    try {
      const parts = text.split(new RegExp(`(${query})`, "gi"));
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      );
    } catch (e) {
      // 如果正则表达式出错（比如特殊字符），返回原文本
      return text;
    }
  };

  // 获取显示的摘要（如果有excerpt就用，否则截取内容）
  const getExcerpt = () => {
    if (post.excerpt) return post.excerpt;
    return post.content.substring(0, 150) + "...";
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        {/* 标签区域 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 标题（可高亮） */}
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
            {searchQuery ? highlightText(post.title, searchQuery) : post.title}
          </h3>
        </Link>

        {/* 摘要（可高亮） */}
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {searchQuery
            ? highlightText(getExcerpt(), searchQuery)
            : getExcerpt()}
        </p>

        {/* 元信息 */}
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{new Date(post.published_at).toLocaleDateString("zh-CN")}</span>
          <div className="flex gap-4">
            <span title="阅读量">👁️ {post.view_count}</span>
            <span title="点赞数">❤️ {post.like_count}</span>
            <span title="评论数">💬 {post.comment_count}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;

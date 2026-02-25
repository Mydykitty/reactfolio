// 博客列表组件
import React from "react";
import { Link } from "react-router-dom";
import type { Post } from "../../types/blog";

interface BlogCardProps {
  post: Post;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
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
        <div className="flex gap-2 mb-2">
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {post.excerpt || post.content.substring(0, 150) + "..."}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{new Date(post.published_at).toLocaleDateString("zh-CN")}</span>
          <div className="flex gap-4">
            <span>👁️ {post.view_count}</span>
            <span>❤️ {post.like_count}</span>
            <span>💬 {post.comment_count}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;

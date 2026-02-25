import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    name: string;
    avatar: string;
  };
  likes_count: number;
}

interface BlogCommentsProps {
  postId: number;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment("");
      fetchComments();
      // 更新文章评论数
      await supabase
        .from("posts")
        .update({ comment_count: comments.length + 1 })
        .eq("id", postId);
    }
    setLoading(false);
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">评论 ({comments.length})</h3>

      {/* 评论表单 */}
      {user ? (
        <form onSubmit={submitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            {loading ? "发布中..." : "发布评论"}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-gray-500">请先登录后再评论</p>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <p>{comment.content}</p>
            <div className="mt-2 text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogComments;

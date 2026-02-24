import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { useLikeStore } from "../store/likeStore";
import type { Message, MessageWithLike } from "../types";

const PAGE_SIZE = 10; // 每页显示10条

const Guestbook = () => {
  const [messages, setMessages] = useState<MessageWithLike[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const user = useAuthStore((state) => state.user);
  const { likedMessages, fetchUserLikes, toggleLike } = useLikeStore();

  // 获取总留言数
  const fetchTotal = async () => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });
    setTotal(count || 0);
  };

  // 读取留言（带分页）
  const fetchMessages = useCallback(
    async (pageNum: number) => {
      setLoading(true);

      const from = (pageNum - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      if (data) {
        // 标记当前用户点赞的留言
        const messagesWithLike = data.map((msg) => ({
          ...msg,
          liked_by_user: likedMessages.has(msg.id),
        }));

        if (pageNum === 1) {
          setMessages(messagesWithLike);
        } else {
          setMessages((prev) => [...prev, ...messagesWithLike]);
        }

        setHasMore(data.length === PAGE_SIZE);
      }

      setLoading(false);
    },
    [likedMessages],
  );

  // 初始化
  useEffect(() => {
    fetchTotal();
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  // 当 likedMessages 变化时，更新 messages 的点赞状态
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        liked_by_user: likedMessages.has(msg.id),
      })),
    );
  }, [likedMessages]);

  // 页面变化时加载数据
  useEffect(() => {
    fetchMessages(page);
  }, [page, fetchMessages]);

  // 发布留言
  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("请先登录后再留言");
      return;
    }

    if (!content.trim()) return;

    setLoading(true);
    const { error, data } = await supabase
      .from("messages")
      .insert([
        {
          name: user.user_metadata?.user_name || "匿名",
          content,
          user_id: user.id,
          avatar_url: user.user_metadata?.avatar_url,
          likes_count: 0,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setContent("");
      // 重新加载第一页
      setPage(1);
      fetchMessages(1);
      fetchTotal();
    }
    setLoading(false);
  };

  // 处理点赞
  const handleLike = async (messageId: number) => {
    await toggleLike(messageId);

    // 更新本地 messages 的点赞数
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            likes_count: (msg.likes_count || 0) + (msg.liked_by_user ? -1 : 1),
            liked_by_user: !msg.liked_by_user,
          };
        }
        return msg;
      }),
    );
  };

  // 加载更多
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <section className="py-8 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          💬 访客留言板
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          共 {total} 条留言
        </span>
      </div>

      {/* 留言表单 - 只有登录才显示 */}
      {user ? (
        <form onSubmit={submitMessage} className="mb-8">
          <div className="flex gap-3">
            <img
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.user_name}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="说点什么..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "发布中..." : "发布留言"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-center rounded-lg">
          请先登录后再留言
        </div>
      )}

      {/* 留言列表 */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <img
              src={msg.avatar_url || `https://github.com/${msg.name}.png`}
              alt={msg.name}
              className="w-10 h-10 rounded-full flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${msg.name}&background=random`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {msg.name}
                  </span>
                  {msg.user_id === user?.id && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                      我
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
              <p className="mt-1 text-gray-700 dark:text-gray-300 break-words">
                {msg.content}
              </p>

              {/* 点赞按钮 */}
              <div className="mt-2 flex items-center gap-4">
                <button
                  onClick={() => handleLike(msg.id)}
                  disabled={!user}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    !user
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-blue-500"
                  } ${
                    msg.liked_by_user
                      ? "text-blue-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${msg.liked_by_user ? "fill-current" : ""}`}
                    fill={msg.liked_by_user ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{msg.likes_count || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 加载更多 */}
        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "加载中..." : "加载更多留言"}
            </button>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            还没有留言，来当第一个访客吧！ ✨
          </p>
        )}

        {loading && page > 1 && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Guestbook;

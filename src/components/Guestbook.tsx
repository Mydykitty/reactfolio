// src/components/Guestbook.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { useLikeStore } from "../store/likeStore";
import type { MessageWithLike } from "../types";
import GuestbookMessage from "./GuestbookMessage";

const PAGE_SIZE = 10;

const Guestbook = () => {
  const [messages, setMessages] = useState<MessageWithLike[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const user = useAuthStore((state) => state.user);
  const { likedMessages, fetchUserLikes, toggleLike } = useLikeStore();

  // 新增：防重复请求 ref
  const fetchingRef = useRef(false);

  // 修改1：稳定的 fetchMessages（依赖数组为空）
  const fetchMessages = useCallback(async (pageNum: number) => {
    // 防止重复请求
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("is_pinned", { ascending: false }) // 置顶的排在前面
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching messages:", error);
      fetchingRef.current = false;
      setLoading(false);
      return;
    }

    if (data) {
      // 直接从 store 获取最新的点赞状态
      const currentLikedMessages = useLikeStore.getState().likedMessages;
      const messagesWithLike = data.map((msg) => ({
        ...msg,
        liked_by_user: currentLikedMessages.has(msg.id),
      }));

      if (pageNum === 1) {
        setMessages(messagesWithLike);
      } else {
        setMessages((prev) => [...prev, ...messagesWithLike]);
      }

      setHasMore(data.length === PAGE_SIZE);
    }

    fetchingRef.current = false;
    setLoading(false);
  }, []); // 空数组，函数永不重新创建

  // 修改2：初始化只执行一次
  useEffect(() => {
    const init = async () => {
      // 获取总数
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });
      setTotal(count || 0);

      // 如果已登录，获取点赞数据
      if (user) {
        await fetchUserLikes();
      }

      // 获取第一页留言
      await fetchMessages(1);
    };

    init();
  }, []); // 空数组，只执行一次

  // 修改3：分页加载
  useEffect(() => {
    if (page > 1) {
      // 避免第一页重复加载
      fetchMessages(page);
    }
  }, [page]); // 只依赖 page

  // 只在组件挂载时同步一次点赞状态
  useEffect(() => {
    if (messages.length > 0 && likedMessages.size > 0) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          liked_by_user: likedMessages.has(msg.id),
        })),
      );
    }
  }, []); // 只在组件挂载时执行一次

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
      setPage(1);
      fetchMessages(1);
      // 更新总数
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });
      setTotal(count || 0);
    }
    setLoading(false);
  };

  // 处理点赞
  const handleLike = async (messageId: number) => {
    if (!user) {
      alert("请先登录后再点赞");
      return;
    }

    // 乐观更新 UI
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

    // 调用 store 的 toggleLike
    await toggleLike(messageId);
  };

  // 加载更多
  const loadMore = () => {
    if (hasMore && !loading && !fetchingRef.current) {
      setPage((prev) => prev + 1);
    }
  };

  // 编辑留言
  const handleEdit = async (messageId: number, newContent: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("messages")
        .update({ content: newContent })
        .eq("id", messageId)
        .eq("user_id", user.id);

      if (error) throw error;

      // 更新本地状态
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg,
        ),
      );
    } catch (error) {
      console.error("Error editing message:", error);
      alert("编辑失败，请重试");
    }
  };

  // 删除留言
  const handleDelete = async (messageId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("user_id", user.id);

      if (error) throw error;

      // 更新本地状态
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // 更新总数
      setTotal((prev) => prev - 1);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("删除失败，请重试");
    }
  };

  const handleTogglePin = async (messageId: number) => {
    if (!user) return;

    // 检查是否有管理员权限
    const isAdmin = user.email === "mydykitty@126.com"; // 改成你的管理员邮箱

    if (!isAdmin) {
      alert("只有管理员可以置顶留言");
      return;
    }

    try {
      // 找到当前消息
      const targetMessage = messages.find((msg) => msg.id === messageId);
      if (!targetMessage) return;

      // 更新数据库
      const { error } = await supabase
        .from("messages")
        .update({ is_pinned: !targetMessage.is_pinned })
        .eq("id", messageId);

      if (error) throw error;

      // **关键修复：重新排序消息列表**
      setMessages((prev) => {
        // 先更新目标消息的 is_pinned 状态
        const updatedMessages = prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_pinned: !msg.is_pinned } : msg,
        );

        // 然后重新排序：置顶的在前，按时间倒序
        return updatedMessages.sort((a, b) => {
          // 先按置顶状态排序
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          // 再按时间排序（新的在前）
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      });
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert("操作失败，请重试");
      // 出错时重新获取数据
      fetchMessages(1);
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

      {/* 留言表单 */}
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

      {/* 留言列表 - 使用 GuestbookMessage 组件 */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <GuestbookMessage
            key={msg.id}
            message={msg}
            currentUser={user}
            onLike={handleLike}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin} // 新增这行
          />
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
      </div>
    </section>
  );
};

export default Guestbook;

// src/components/Guestbook.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { useLikeStore } from "../store/likeStore";
import type { MessageWithLike } from "../types";
import GuestbookMessage from "./GuestbookMessage";
import GuestbookWordCloud from "./GuestbookWordCloud";
import MentionInput from "./MentionInput"; // 新增：导入提及输入组件

const PAGE_SIZE = 10;

// 新增：解析提及的用户名
const parseMentions = (content: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9_\u4e00-\u9fa5]+)/g; // 支持中文用户名
    const matches = content.match(mentionRegex) || [];
    return matches.map(m => m.slice(1)); // 去掉@符号
};

// 新增：高亮显示提及的文本
export const highlightMentions = (content: string): React.ReactNode => {
    const mentionRegex = /(@[a-zA-Z0-9_\u4e00-\u9fa5]+)/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            return (
                <span key={index} className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-1 rounded">
          {part}
        </span>
            );
        }
        return part;
    });
};

const Guestbook = () => {
    const [messages, setMessages] = useState<MessageWithLike[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [showWordCloud, setShowWordCloud] = useState(false);

    const user = useAuthStore((state) => state.user);
    const { likedMessages, fetchUserLikes, toggleLike } = useLikeStore();

    const fetchingRef = useRef(false);

    // 新增：检查URL参数，滚动到指定留言
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const messageId = params.get('message');

        if (messageId) {
            // 等待留言加载完成后滚动
            setTimeout(() => {
                const element = document.getElementById(`message-${messageId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-4', 'ring-yellow-300', 'dark:ring-yellow-600', 'scale-105');
                    setTimeout(() => {
                        element.classList.remove('ring-4', 'ring-yellow-300', 'dark:ring-yellow-600', 'scale-105');
                    }, 2000);
                }
            }, 1000);
        }
    }, [messages]);

    const fetchMessages = useCallback(async (pageNum: number) => {
        if (fetchingRef.current) return;

        fetchingRef.current = true;
        setLoading(true);

        const from = (pageNum - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from("messages")
            .select(`
        *,
        profiles!inner(
          username,
          avatar_url,
          full_name
        )
      `)
            .order("is_pinned", { ascending: false })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching messages:", error);
            fetchingRef.current = false;
            setLoading(false);
            return;
        }

        if (data) {
            const currentLikedMessages = useLikeStore.getState().likedMessages;
            const messagesWithLike = data.map((msg) => ({
                ...msg,
                liked_by_user: currentLikedMessages.has(msg.id),
                // 合并profiles数据
                name: msg.profiles?.username || msg.name,
                avatar_url: msg.profiles?.avatar_url || msg.avatar_url,
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
    }, []);

    useEffect(() => {
        const init = async () => {
            const { count } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true });
            setTotal(count || 0);

            if (user) {
                await fetchUserLikes();
            }

            await fetchMessages(1);
        };

        init();
    }, []);

    useEffect(() => {
        if (page > 1) {
            fetchMessages(page);
        }
    }, [page]);

    // 修改：提交留言，添加提及功能
    const submitMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("请先登录后再留言");
            return;
        }

        if (!content.trim()) return;

        setLoading(true);

        // 先获取用户资料
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

        // 插入留言
        const { error, data } = await supabase
            .from("messages")
            .insert([
                {
                    name: profile?.username || user.user_metadata?.user_name || "匿名",
                    content,
                    user_id: user.id,
                    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
                    likes_count: 0,
                },
            ])
            .select(`
        *,
        profiles!inner(
          username,
          avatar_url,
          full_name
        )
      `)
            .single();

        if (!error && data) {
            // 解析并保存提及
            const mentionedUsernames = parseMentions(content);

            if (mentionedUsernames.length > 0) {
                // 查询这些用户名对应的用户ID（排除自己）
                const { data: users } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('username', mentionedUsernames)
                    .neq('id', user.id); // 不能提及自己

                if (users && users.length > 0) {
                    // 创建提及记录
                    const mentions = users.map(u => ({
                        message_id: data.id,
                        mentioned_user_id: u.id,
                        mentioned_by_user_id: user.id
                    }));

                    const { error: mentionError } = await supabase
                        .from('mentions')
                        .insert(mentions);

                    if (mentionError) {
                        console.error('保存提及失败:', mentionError);
                    } else {
                        // 显示提示
                        console.log(`成功提及 ${users.length} 位用户`);
                    }
                }
            }

            // 添加新留言到列表
            const newMessage = {
                ...data,
                liked_by_user: false,
                name: data.profiles?.username || data.name,
                avatar_url: data.profiles?.avatar_url || data.avatar_url,
            };

            setMessages(prev => [newMessage, ...prev]);
            setContent("");

            // 更新总数
            setTotal(prev => prev + 1);
        }
        setLoading(false);
    };

    const handleLike = async (messageId: number) => {
        if (!user) {
            alert("请先登录后再点赞");
            return;
        }

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

        await toggleLike(messageId);
    };

    const loadMore = () => {
        if (hasMore && !loading && !fetchingRef.current) {
            setPage((prev) => prev + 1);
        }
    };

    const handleEdit = async (messageId: number, newContent: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from("messages")
                .update({ content: newContent })
                .eq("id", messageId)
                .eq("user_id", user.id);

            if (error) throw error;

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId ? { ...msg, content: newContent } : msg,
                )
            );
        } catch (error) {
            console.error("Error editing message:", error);
            alert("编辑失败，请重试");
        }
    };

    const handleDelete = async (messageId: number) => {
        if (!user) return;

        try {
            // 先删除相关的提及记录
            await supabase
                .from('mentions')
                .delete()
                .eq('message_id', messageId);

            // 再删除留言
            const { error } = await supabase
                .from("messages")
                .delete()
                .eq("id", messageId)
                .eq("user_id", user.id);

            if (error) throw error;

            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            setTotal((prev) => prev - 1);
        } catch (error) {
            console.error("Error deleting message:", error);
            alert("删除失败，请重试");
        }
    };

    const handleTogglePin = async (messageId: number) => {
        if (!user) return;

        const isAdmin = user.email === "mydykitty@126.com";

        if (!isAdmin) {
            alert("只有管理员可以置顶留言");
            return;
        }

        try {
            const targetMessage = messages.find((msg) => msg.id === messageId);
            if (!targetMessage) return;

            const { error } = await supabase
                .from("messages")
                .update({ is_pinned: !targetMessage.is_pinned })
                .eq("id", messageId);

            if (error) throw error;

            setMessages((prev) => {
                const updatedMessages = prev.map((msg) =>
                    msg.id === messageId ? { ...msg, is_pinned: !msg.is_pinned } : msg,
                );

                return updatedMessages.sort((a, b) => {
                    if (a.is_pinned && !b.is_pinned) return -1;
                    if (!a.is_pinned && b.is_pinned) return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
            });
        } catch (error) {
            console.error("Error toggling pin:", error);
            alert("操作失败，请重试");
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

            {/* 留言表单 - 使用MentionInput */}
            {user ? (
                <form onSubmit={submitMessage} className="mb-8">
                    <div className="flex gap-3">
                        <img
                            src={user.user_metadata?.avatar_url}
                            alt={user.user_metadata?.user_name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                            onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.user_metadata?.user_name}&background=random`;
                            }}
                        />
                        <div className="flex-1">
                            <MentionInput
                                value={content}
                                onChange={setContent}
                                placeholder="说点什么... 输入 @ 提及某人"
                                disabled={loading}
                            />

                            {/* 提示信息 */}
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    💡 输入 @ 后跟用户名可提及他人
                                </p>
                                <button
                                    type="submit"
                                    disabled={loading || !content.trim()}
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

            {/* 词云开关 */}
            <div className="mb-8">
                <button
                    onClick={() => setShowWordCloud(!showWordCloud)}
                    className="text-blue-500 hover:text-blue-600 mb-4 inline-flex items-center gap-2"
                >
                    <span>{showWordCloud ? "📖" : "☁️"}</span>
                    <span>{showWordCloud ? "隐藏词云" : "显示词云"}</span>
                </button>

                {showWordCloud && <GuestbookWordCloud />}
            </div>

            {/* 留言列表 */}
            <div className="space-y-4">
                {messages.map((msg) => (
                    <GuestbookMessage
                        key={msg.id}
                        message={msg}
                        currentUser={user}
                        onLike={handleLike}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTogglePin={handleTogglePin}
                        highlightMentions={highlightMentions} // 新增：传递高亮函数
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
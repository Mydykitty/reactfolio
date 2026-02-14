import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

interface Message {
  id: number;
  name: string;
  content: string;
  created_at: string;
  avatar_url?: string;
  user_id?: string;
}

const Guestbook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  // 读取留言
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setMessages(data);
  };

  // 发布留言
  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("请先登录后再留言");
      return;
    }

    if (!content.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("messages").insert([
      {
        name: user.user_metadata?.user_name || "匿名",
        content,
        user_id: user.id,
        avatar_url: user.user_metadata?.avatar_url,
      },
    ]);

    if (!error) {
      setContent("");
      fetchMessages();
    }
    setLoading(false);
  };

  return (
    <section className="py-8 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        💬 访客留言板
      </h2>

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          共 {messages.length} 条留言
        </h3>

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
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            还没有留言，来当第一个访客吧！ ✨
          </p>
        )}
      </div>
    </section>
  );
};

export default Guestbook;

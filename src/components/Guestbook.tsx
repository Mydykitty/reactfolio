import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

interface Message {
  id: number;
  name: string;
  content: string;
  created_at: string;
}

const Guestbook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

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
    // 检查是否登录
    const user = useAuthStore.getState().user;
    if (!user) {
      alert("请先登录后再留言");
      return;
    }

    if (!name.trim() || !content.trim()) return;

    // 提交时带上用户ID
    setLoading(true);
    const { error } = await supabase.from("messages").insert([
      {
        name,
        content,
        user_id: user.id, // 新增：关联用户ID
        user_name: user.user_metadata.user_name, // 新增：保存用户名
      },
    ]);

    if (!error) {
      setName("");
      setContent("");
      fetchMessages(); // 刷新列表
    }
    setLoading(false);
  };

  return (
    <section className="py-8 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        💬 访客留言板
      </h2>

      {/* 留言表单 */}
      <form onSubmit={submitMessage} className="mb-8 space-y-4">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="说点什么..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "发布中..." : "发布留言"}
        </button>
      </form>

      {/* 留言列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          共 {messages.length} 条留言
        </h3>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {msg.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(msg.created_at).toLocaleString("zh-CN")}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {msg.content}
            </p>
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

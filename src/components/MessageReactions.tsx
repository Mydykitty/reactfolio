// src/components/MessageReactions.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

interface MessageReactionsProps {
  messageId: number;
  reactions: { [key: string]: number };
  userReactions: string[];
  onReactionUpdate: () => void;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = {},
  userReactions = [],
  onReactionUpdate,
}) => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState<string | null>(null);

  const handleReaction = async (emoji: string) => {
    if (!user) {
      alert("请先登录后再添加表情");
      return;
    }

    setLoading(emoji);

    try {
      const hasReaction = userReactions.includes(emoji);

      if (hasReaction) {
        // 取消表情
        await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", user.id)
          .eq("reaction", emoji);
      } else {
        // 添加表情
        await supabase.from("message_reactions").insert({
          message_id: messageId,
          user_id: user.id,
          reaction: emoji,
        });
      }

      // 通知父组件更新
      onReactionUpdate();
    } catch (error) {
      console.error("操作失败:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {REACTION_EMOJIS.map((emoji) => {
        const count = reactions[emoji] || 0;
        const isActive = userReactions.includes(emoji);
        const isLoading = loading === emoji;

        return (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            disabled={!user || isLoading}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
              transition-all duration-200 border
              ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
                  : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
              ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            title={isActive ? "取消反应" : `添加 ${emoji}`}
          >
            <span className="text-base">{emoji}</span>
            {count > 0 && (
              <span
                className={`text-xs font-medium ${isActive ? "text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}`}
              >
                {count}
              </span>
            )}
            {isLoading && (
              <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MessageReactions;

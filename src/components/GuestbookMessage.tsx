// src/components/GuestbookMessage.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { MessageWithLike } from "../types";
import type { User } from "@supabase/supabase-js";
import MessageReactions from "./MessageReactions"; // 导入表情组件

interface GuestbookMessageProps {
  message: MessageWithLike;
  currentUser: User | null;
  onLike: (id: number) => void;
  onEdit: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onTogglePin: (id: number) => Promise<void>;
}

const GuestbookMessage = ({
  message,
  currentUser,
  onLike,
  onEdit,
  onDelete,
  onTogglePin,
}: GuestbookMessageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表情反应相关状态
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);

  const isOwnMessage = currentUser?.id === message.user_id;

  // 获取表情数据
  const fetchReactions = async () => {
    const { data } = await supabase
      .from("message_reactions")
      .select("reaction, user_id")
      .eq("message_id", message.id);

    if (data) {
      const counts: { [key: string]: number } = {};
      const userEmojis: string[] = [];

      data.forEach((item) => {
        counts[item.reaction] = (counts[item.reaction] || 0) + 1;
        if (currentUser && item.user_id === currentUser.id) {
          userEmojis.push(item.reaction);
        }
      });

      setReactions(counts);
      setUserReactions(userEmojis);
    }
  };

  // 加载时获取表情
  useEffect(() => {
    fetchReactions();
  }, [message.id, currentUser]);

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(message.id, editContent.trim());
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("确定要删除这条留言吗？")) {
      await onDelete(message.id);
    }
  };

  const isAdmin = currentUser?.email === "mydykitty@126.com"; // 改成你的管理员邮箱

  return (
    <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      {/* 头像 */}
      <img
        src={message.avatar_url || `https://github.com/${message.name}.png`}
        alt={message.name}
        className="w-10 h-10 rounded-full flex-shrink-0"
        onError={(e) => {
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${message.name}&background=random`;
        }}
      />

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 头部：用户名 + 时间 + 操作按钮 */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {message.name}
              </span>
              {message.is_pinned && (
                <span className="text-yellow-500" title="置顶留言">
                  📌
                </span>
              )}
            </div>
            {isOwnMessage && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                我
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.created_at).toLocaleString("zh-CN")}
            </span>

            {/* 编辑/删除按钮 - 只有自己的留言才显示 */}
            {!isEditing && (
              <div className="flex gap-1">
                {/* 置顶按钮 - 管理员可见（可以操作所有留言） */}
                {isAdmin && (
                  <button
                    onClick={() => onTogglePin(message.id)}
                    className={`transition-colors p-1 ${
                      message.is_pinned
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-400 hover:text-yellow-500"
                    }`}
                    title={message.is_pinned ? "取消置顶" : "置顶留言"}
                  >
                    📌
                  </button>
                )}

                {/* 编辑/删除按钮 - 只有自己的留言才显示 */}
                {isOwnMessage && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                      title="编辑"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="删除"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 内容区域：编辑模式或显示模式 */}
        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              rows={3}
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                onClick={handleEdit}
                disabled={isSubmitting || !editContent.trim()}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* 点赞按钮 */}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={() => onLike(message.id)}
            disabled={!currentUser}
            className={`flex items-center gap-1 text-sm transition-colors ${
              !currentUser
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-blue-500"
            } ${
              message.liked_by_user
                ? "text-blue-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <svg
              className={`w-5 h-5 ${message.liked_by_user ? "fill-current" : ""}`}
              fill={message.liked_by_user ? "currentColor" : "none"}
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
            <span>{message.likes_count || 0}</span>
          </button>
        </div>

        {/* 使用 MessageReactions 组件 */}
        <MessageReactions
          messageId={message.id}
          reactions={reactions}
          userReactions={userReactions}
          onReactionUpdate={fetchReactions}
        />
      </div>
    </div>
  );
};

export default GuestbookMessage;

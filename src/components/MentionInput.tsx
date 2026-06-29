// src/components/MentionInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    username: string;
    avatar_url: string;
    full_name?: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    onSubmit?: () => void;
}

const MentionInput: React.FC<MentionInputProps> = ({
                                                       value,
                                                       onChange,
                                                       placeholder,
                                                       disabled,
                                                       onSubmit
                                                   }) => {
    const [mentionUsers, setMentionUsers] = useState<User[]>([]);
    const [mentionIndex, setMentionIndex] = useState<number | null>(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [showMentionList, setShowMentionList] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // 检测@符号
    const checkForMention = (text: string, pos: number) => {
        // 找到光标前的最后一个@
        const textBeforeCursor = text.slice(0, pos);
        const atIndex = textBeforeCursor.lastIndexOf('@');

        if (atIndex === -1) return null;

        // 检查@后面是否有空格或已经是单词结束
        const afterAt = textBeforeCursor.slice(atIndex + 1);

        // 如果@后面有空格，或者@是最后一个字符，则不是有效的提及
        if (afterAt.includes(' ') || afterAt.length === 0) {
            return null;
        }

        return {
            index: atIndex,
            query: afterAt
        };
    };

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const pos = e.target.selectionStart || 0;

        onChange(newValue);
        setCursorPosition(pos);

        // 检测@提及
        const mention = checkForMention(newValue, pos);

        if (mention) {
            setShowMentionList(true);
            setMentionIndex(mention.index);
            setSearchQuery(mention.query);
            searchUsers(mention.query);
        } else {
            setShowMentionList(false);
        }
    };

    // 搜索用户
    const searchUsers = async (query: string) => {
        if (!query) {
            // 如果没有查询词，显示最近活跃的用户
            const { data } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, full_name')
                .limit(5);

            setMentionUsers(data || []);
            return;
        }

        const { data } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, full_name')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .limit(5);

        setMentionUsers(data || []);
    };

    // 选择用户
    const selectUser = (user: User) => {
        if (mentionIndex === null) return;

        // 构建新的文本
        const beforeMention = value.slice(0, mentionIndex);
        const afterMention = value.slice(cursorPosition);
        const mentionText = `@${user.username} `;

        const newValue = beforeMention + mentionText + afterMention;
        onChange(newValue);

        setShowMentionList(false);

        // 设置光标位置到提及后面
        setTimeout(() => {
            if (inputRef.current) {
                const newPos = beforeMention.length + mentionText.length;
                inputRef.current.focus();
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    // 点击外部关闭列表
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (listRef.current && !listRef.current.contains(e.target as Node)) {
                setShowMentionList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 键盘导航
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showMentionList || mentionUsers.length === 0) return;

        const selectedIndex = mentionUsers.findIndex(u =>
            u.id === mentionUsers[selectedIndex]?.id
        );

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setMentionUsers(prev => {
                    const newIndex = (selectedIndex + 1) % prev.length;
                    return prev.map((u, i) => ({ ...u, selected: i === newIndex }));
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setMentionUsers(prev => {
                    const newIndex = selectedIndex - 1 >= 0 ? selectedIndex - 1 : prev.length - 1;
                    return prev.map((u, i) => ({ ...u, selected: i === newIndex }));
                });
                break;
            case 'Enter':
            case 'Tab':
                if (selectedIndex >= 0) {
                    e.preventDefault();
                    selectUser(mentionUsers[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowMentionList(false);
                break;
        }
    };

    return (
        <div className="relative">
      <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
      />

            {/* 提及列表 */}
            {showMentionList && mentionUsers.length > 0 && (
                <div
                    ref={listRef}
                    className="absolute left-0 right-0 bottom-full mb-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
                >
                    {mentionUsers.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => selectUser(user)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <img
                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                alt={user.username}
                                className="w-6 h-6 rounded-full"
                            />
                            <div className="text-left">
                                <div className="font-medium text-sm">@{user.username}</div>
                                {user.full_name && (
                                    <div className="text-xs text-gray-500">{user.full_name}</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentionInput;
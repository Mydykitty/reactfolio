// src/store/likeStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface LikeState {
  likedMessages: Set<number>;
  loading: boolean;
  fetchUserLikes: () => Promise<void>;
  toggleLike: (messageId: number) => Promise<void>;
}

export const useLikeStore = create<LikeState>((set, get) => ({
  likedMessages: new Set(),
  loading: false,

  fetchUserLikes: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true });
      const { data } = await supabase
          .from('message_likes')
          .select('message_id')
          .eq('user_id', user.id);

      if (data) {
        set({ likedMessages: new Set(data.map(like => like.message_id)) });
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      set({ loading: false });
    }
  },

  toggleLike: async (messageId: number) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      alert('请先登录后再点赞');
      return;
    }

    const { likedMessages } = get();
    const isLiked = likedMessages.has(messageId);

    try {
      // 先查询当前点赞数
      const { data: message, error: queryError } = await supabase
          .from('messages')
          .select('likes_count')
          .eq('id', messageId)
          .single();

      if (queryError) throw queryError;

      const currentLikes = message?.likes_count || 0;

      if (isLiked) {
        // 取消点赞：删除点赞记录
        const { error: deleteError } = await supabase
            .from('message_likes')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // 更新 messages 表的点赞数（减1）
        const { error: updateError } = await supabase
            .from('messages')
            .update({ likes_count: Math.max(0, currentLikes - 1) })
            .eq('id', messageId);

        if (updateError) throw updateError;

        likedMessages.delete(messageId);
      } else {
        // 添加点赞：插入点赞记录
        const { error: insertError } = await supabase
            .from('message_likes')
            .insert({ message_id: messageId, user_id: user.id });

        if (insertError) throw insertError;

        // 更新 messages 表的点赞数（加1）
        const { error: updateError } = await supabase
            .from('messages')
            .update({ likes_count: currentLikes + 1 })
            .eq('id', messageId);

        if (updateError) throw updateError;

        likedMessages.add(messageId);
      }

      set({ likedMessages: new Set(likedMessages) });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  },
}));
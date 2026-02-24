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
      if (isLiked) {
        // 取消点赞
        await supabase
          .from('message_likes')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id);

        likedMessages.delete(messageId);
      } else {
        // 添加点赞
        await supabase
          .from('message_likes')
          .insert({ message_id: messageId, user_id: user.id });

        likedMessages.add(messageId);
      }

      set({ likedMessages: new Set(likedMessages) });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  },
}));
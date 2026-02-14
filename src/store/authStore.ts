import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  // 状态
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // 方法
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isLoading: true,
      error: null,

      // GitHub 登录
      signInWithGitHub: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: window.location.origin,
              scopes: 'read:user user:email'  // 请求更多权限
            }
          });

          if (error) throw error;
          
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // 退出登录
      signOut: async () => {
        try {
          set({ isLoading: true });
          await supabase.auth.signOut();
          set({ user: null });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // 初始化：检查当前登录状态
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // 获取当前会话
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            set({ user: session.user });
          }

          // 监听认证状态变化
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              set({ user: session?.user || null });
            }
          );

          // 清理函数（会在组件卸载时调用）
          return () => subscription.unsubscribe();
          
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // 清除错误
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage', // localStorage 的 key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }) // 只持久化 user
    }
  )
);
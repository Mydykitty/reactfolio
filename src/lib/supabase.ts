import { createClient } from '@supabase/supabase-js';

// 从 Supabase 项目设置中复制
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('缺少 Supabase 环境变量');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
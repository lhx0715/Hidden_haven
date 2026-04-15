/**
 * Supabase 客户端配置
 * 使用 Vite 环境变量
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase 环境变量未配置。请在 .env.local 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * 健康检查：确保 Supabase 连接正常
 */
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('cities').select('count(*)', { count: 'exact' });
    if (error) throw error;
    console.log('✅ Supabase 连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase 连接失败:', error.message);
    return false;
  }
};

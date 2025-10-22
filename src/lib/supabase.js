import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase 설정 확인:');
console.log('  URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
console.log('  Anon Key:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음');

if (!supabaseUrl || !supabaseAnonKey) {
  const error = `Supabase 환경 변수가 설정되지 않았습니다. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`;
  console.error('❌', error);
  throw new Error(error);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

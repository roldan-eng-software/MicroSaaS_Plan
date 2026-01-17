import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Validar se as variáveis estão configuradas
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '❌ ERRO: Variáveis de ambiente do Supabase não configuradas!',
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_KEY no arquivo .env.local'
  );
  throw new Error('Supabase não configurado. Verifique .env.local');
}

console.log('✅ Supabase inicializado com sucesso');

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
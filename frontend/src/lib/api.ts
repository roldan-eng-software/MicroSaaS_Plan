import { supabase } from './supabaseClient';

// Função para fazer requisições autenticadas
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  // Obter token do Supabase
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Não autenticado');
  }

  // Adicionar token no header
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }

  return response.json();
}

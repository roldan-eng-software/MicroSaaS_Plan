/**
 * Função auxiliar para fazer requisições HTTP autenticadas
 * Automaticamente adiciona o token JWT do Supabase aos headers
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // Pegar token do localStorage
    const token = localStorage.getItem('access_token');

    // Configurar headers padrão
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Adicionar token de autenticação se existir
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Token encontrado, adicionado ao header');
    } else {
      console.warn('⚠️ Nenhum token encontrado no localStorage');
    }

    console.log(`📡 Fazendo requisição para: ${url}`);

    // Fazer requisição
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Tratar erros HTTP
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }

      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      console.error(`❌ Erro na requisição: ${errorMessage}`);

      // Se for erro 401 (não autorizado), limpar token
      if (response.status === 401) {
        console.warn('🚫 Token expirado, limpando localStorage');
        localStorage.removeItem('access_token');
      }

      throw new Error(errorMessage);
    }

    // Retornar dados como JSON
    const data = await response.json();
    console.log(`✅ Resposta recebida:`, data);
    return data;
  } catch (error) {
    console.error('🔥 Erro na requisição autenticada:', error);
    throw error;
  }
}

/**
 * Função auxiliar para fazer requisições sem autenticação
 */
export async function publicFetch(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`📡 Fazendo requisição pública para: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }

      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`❌ Erro na requisição: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ Resposta recebida:`, data);
    return data;
  } catch (error) {
    console.error('🔥 Erro na requisição pública:', error);
    throw error;
  }
}
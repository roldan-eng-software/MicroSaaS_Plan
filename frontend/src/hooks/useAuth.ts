import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setAuthState({ user, loading: false, error: null });
      } catch (err) {
        setAuthState({ user: null, loading: false, error: 'Erro ao verificar autenticação' });
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthState({
        user: session?.user || null,
        loading: false,
        error: null,
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Registrar novo usuário
const signUp = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));
      
      // Primeiro faz o sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      // Depois faz login automático com as mesmas credenciais
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      
      setAuthState({ user: signInData.user, loading: false, error: null });
      return signInData.user;
    } catch (err: any) {
      setAuthState((prev) => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };


  // Login
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setAuthState({ user: data.user, loading: false, error: null });
      return data.user;
    } catch (err: any) {
      setAuthState((prev) => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  // Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthState({ user: null, loading: false, error: null });
    } catch (err: any) {
      setAuthState((prev) => ({ ...prev, error: err.message }));
      throw err;
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
  };
}

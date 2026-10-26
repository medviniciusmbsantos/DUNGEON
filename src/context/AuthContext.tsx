import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to clean up any Supabase session keys from localStorage
const clearLocalStorageAuth = () => {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Erro ao limpar localStorage do Supabase:', e);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for errors in URL (query params or hash fragment)
    try {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.substring(1) : url.hash);

      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        console.warn('OAuth Error detectado na URL:', error, errorDescription);
        clearLocalStorageAuth();
        setUser(null);
        // Clear error params and hash from URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.error('Erro ao verificar parâmetros da URL:', e);
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Erro ao obter sessão:', error);
        clearLocalStorageAuth();
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Falha ao verificar sessão do Supabase:', err);
      clearLocalStorageAuth();
      setUser(null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        console.error('Erro ao iniciar login com Google:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      clearLocalStorageAuth();
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      // Attempt remote signout from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase signOut retornou um aviso/erro:', error.message);
      }
    } catch (error: any) {
      console.error('Erro ao executar signOut no Supabase:', error);
    } finally {
      // Always guarantee local cleanup and user state reset
      clearLocalStorageAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

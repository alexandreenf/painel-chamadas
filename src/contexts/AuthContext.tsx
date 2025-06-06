import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  role?: 'admin' | 'attendant' | 'nurse' | 'doctor';
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      setUser({
        ...authUser,
        name: data.name,
        role: data.role
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signUp = async (email: string, password: string, name: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (!error && data.user) {
      // Insert user data into users table
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        role: role as any
      });
    }
    
    return { error };
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
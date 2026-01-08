import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('admin');
    }
  }, [admin]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check hardcoded demo credentials first
    if (email === 'admin@luxe.com' && password === 'admin123') {
      const adminUser: AdminUser = {
        id: '1',
        email: 'admin@luxe.com',
        firstName: 'ThriftySouq',
        lastName: 'Admin',
        role: 'super_admin',
      };
      setAdmin(adminUser);
      return true;
    }
    
    // Try to authenticate against database
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      
      if (data && !error) {
        // For demo purposes, accept any password for DB users
        // In production, implement proper password hashing
        const adminUser: AdminUser = {
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role,
        };
        setAdmin(adminUser);
        
        // Update last login
        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.id);
        
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    
    return false;
  };

  const logout = () => {
    setAdmin(null);
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        login,
        logout,
        isAuthenticated: admin !== null,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

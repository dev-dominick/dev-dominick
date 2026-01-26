'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function DevAdminToggle() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('dev_admin_mode');
    setIsAdmin(stored === 'true');
  }, []);

  const handleToggle = async () => {
    const newValue = !isAdmin;
    setIsAdmin(newValue);
    
    if (newValue) {
      // Enable admin mode - create a real NextAuth session
      localStorage.setItem('dev_admin_mode', 'true');
      document.cookie = 'dev_admin_mode=true; path=/; max-age=86400'; // 24 hours
      
      // Create dev admin session
      await fetch('/api/dev/admin-session', { method: 'POST' });
      
      // Force redirect to /app
      window.location.href = '/app';
    } else {
      // Disable admin mode
      localStorage.removeItem('dev_admin_mode');
      document.cookie = 'dev_admin_mode=; path=/; max-age=0'; // Delete cookie
      
      // Clear session
      await fetch('/api/dev/admin-session', { method: 'DELETE' });
      
      // Redirect to home
      window.location.href = '/';
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-[9999]">
      <button
        onClick={handleToggle}
        className={`
          px-4 py-2 rounded-lg font-mono text-sm font-semibold
          transition-all duration-200 shadow-lg border-2
          ${isAdmin 
            ? 'bg-green-500 text-white hover:bg-green-600 border-green-400' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
          }
        `}
      >
        {isAdmin ? '👑 Admin Mode' : '👤 User Mode'}
      </button>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration:');
console.log('  URL:', supabaseUrl || '❌ MISSING');
console.log('  Anon Key:', supabaseAnonKey ? '✅ Present' : '❌ MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('💥 Missing Supabase environment variables');
  console.error('  VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'MISSING');
  
  // Show user-friendly error
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      background: #1f2937; 
      color: white; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 9999;
      font-family: system-ui;
    ">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="color: #ef4444; margin-bottom: 1rem;">Configuration Error</h1>
        <p>Missing Supabase environment variables.</p>
        <p>Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.</p>
      </div>
    </div>
  `;
  document.body.appendChild(errorDiv);
  
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

console.log('✅ Supabase client created successfully');

// Add debug logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 Supabase auth event:', {
    event,
    user: session?.user?.email || 'None',
    sessionId: session?.access_token ? session.access_token.substring(0, 10) + '...' : 'None',
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'None'
  });
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  console.log('🧪 Initial connection test:', {
    session: data.session ? 'Present' : 'None',
    user: data.session?.user?.email || 'None',
    error: error?.message || 'None'
  });
});
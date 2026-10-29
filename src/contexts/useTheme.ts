import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCallback } from 'react';

export function useTheme() {
  const { profile, refreshProfile } = useAuth();

  const setTheme = useCallback(
    async (theme: string) => {
      document.body.classList.remove('theme-light');
      if (theme === 'classic-light') {
        document.body.classList.add('theme-light');
      }
      if (profile) {
        await supabase.from('profiles').update({ theme }).eq('id', profile.id);
        refreshProfile();
      }
    },
    [profile, refreshProfile],
  );

  const currentTheme = profile?.theme ?? 'obsidian-dark';
  return { currentTheme, setTheme };
}

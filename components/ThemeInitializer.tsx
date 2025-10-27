'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/lib/store';

export default function ThemeInitializer() {
  const { theme, setTheme } = usePreferencesStore();

  useEffect(() => {
    // Set initial theme on mount
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('wikipedia-reader-preferences');
      if (savedTheme) {
        try {
          const preferences = JSON.parse(savedTheme);
          if (preferences.state?.theme) {
            setTheme(preferences.state.theme);
          }
        } catch (error) {
          // Fallback to system preference
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setTheme(systemTheme);
        }
      } else {
        // Use system preference as default
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
      }
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only change if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('wikipedia-reader-preferences');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return null;
}

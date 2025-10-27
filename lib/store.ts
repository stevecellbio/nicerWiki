import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences, Bookmark } from '@/types';

interface PreferencesStore extends UserPreferences {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setFontSize: (fontSize: 'small' | 'medium' | 'large') => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (title: string) => void;
  isBookmarked: (title: string) => boolean;
  addToRecentlyViewed: (title: string) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      fontSize: 'medium',
      bookmarks: [],
      recentlyViewed: [],

      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      setFontSize: (fontSize) => set({ fontSize }),

      addBookmark: (bookmark) =>
        set((state) => {
          const exists = state.bookmarks.some((b) => b.title === bookmark.title);
          if (exists) return state;
          return { bookmarks: [bookmark, ...state.bookmarks] };
        }),

      removeBookmark: (title) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.title !== title),
        })),

      isBookmarked: (title) => {
        return get().bookmarks.some((b) => b.title === title);
      },

      addToRecentlyViewed: (title) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((t) => t !== title);
          return { recentlyViewed: [title, ...filtered].slice(0, 10) };
        }),
    }),
    {
      name: 'wikipedia-reader-preferences',
    }
  )
);

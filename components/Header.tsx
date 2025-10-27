'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bookmark, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Clock, 
  TrendingUp,
  Command,
  Sparkles,
  ChevronRight,
  Zap,
  BookOpen,
  Settings,
  Info
} from 'lucide-react';
import { usePreferencesStore } from '@/lib/store';
import { searchWikipedia } from '@/lib/wikipedia';
import { WikipediaSearchResult } from '@/types';
import Link from 'next/link';

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikipediaSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const { bookmarks, theme, toggleTheme } = usePreferencesStore();

  useEffect(() => {
    // Load search history from localStorage
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('search-history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.trim().length > 0) {
        const searchResults = await searchWikipedia(query);
        setResults(searchResults);
        setShowResults(true);
        
        // Add to search history
        if (query.trim().length > 2) {
          const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
          setSearchHistory(newHistory);
          if (typeof window !== 'undefined') {
            localStorage.setItem('search-history', JSON.stringify(newHistory));
          }
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query, searchHistory]);

  const handleSelectResult = (title: string) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    router.push(`/wiki/${encodeURIComponent(title)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelectResult(query);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to close results
      if (e.key === 'Escape') {
        setShowResults(false);
      }
      
      // Cmd/Ctrl + B for bookmarks
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        router.push('/bookmarks');
      }
      
      // Cmd/Ctrl + D for theme toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleTheme]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[var(--card-bg)]/80 backdrop-blur-lg supports-[backdrop-filter]:bg-[var(--card-bg)]/60 border-[var(--card-border)] transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 text-xl font-bold text-[var(--foreground)] lowercase group transition-all duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] rounded-xl flex items-center justify-center text-white font-bold lowercase shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-transparent">
              nicer.wiki
            </span>
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5 transition-colors group-focus-within:text-[var(--accent)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="search wikipedia (⌘K)..."
                  className="w-full pl-12 pr-12 py-3 border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent bg-[var(--muted-bg)] text-[var(--foreground)] placeholder-[var(--muted)] lowercase transition-all duration-300 hover:border-[var(--accent)]/50"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs bg-[var(--card-border)] rounded text-[var(--muted)]">⌘</kbd>
                  <kbd className="px-2 py-1 text-xs bg-[var(--card-border)] rounded text-[var(--muted)]">K</kbd>
                </div>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full mt-2 w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-2xl max-h-96 overflow-y-auto animate-slide-up">
                {/* Search History */}
                {searchHistory.length > 0 && results.length === 0 && (
                  <div className="p-3 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2">
                      <Clock className="w-3 h-3" />
                      recent searches
                    </div>
                    <div className="space-y-1">
                      {searchHistory.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectResult(term)}
                          className="w-full text-left px-3 py-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors text-sm"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Search Results */}
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result.title)}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--muted-bg)] border-b border-[var(--card-border)] last:border-b-0 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3">
                      {result.thumbnail ? (
                        <img
                          src={result.thumbnail.source}
                          alt={result.title}
                          className="w-12 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[var(--muted-bg)] rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-[var(--muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-sm text-[var(--muted)] truncate mt-1">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground)] transition-all duration-300 hover:scale-110 relative group"
              aria-label="Toggle theme (⌘D)"
              title="Toggle theme (⌘D)"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              )}
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
            </button>

            {/* Bookmarks */}
            <Link
              href="/bookmarks"
              className="p-3 rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground)] relative transition-all duration-300 hover:scale-110 group"
              aria-label="Bookmarks (⌘B)"
              title="Bookmarks (⌘B)"
            >
              <Bookmark className="w-5 h-5 group-hover:fill-current transition-all duration-300" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-scale-in">
                  {bookmarks.length}
                </span>
              )}
            </Link>

            {/* Burger Menu */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground)] transition-all duration-300 hover:scale-110"
              aria-label="Menu"
            >
              {showMenu ? (
                <X className="w-5 h-5 animate-rotate-90" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Burger Sidebar */}
        {showMenu && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-80 bg-[var(--card-bg)] border-l border-[var(--card-border)] z-50 animate-slide-in-right sm:hidden">
              <div className="h-full overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
                  <h2 className="text-xl font-bold text-[var(--foreground)] lowercase">
                    power user shortcuts
                  </h2>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 hover:bg-[var(--muted-bg)] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--muted)]" />
                  </button>
                </div>
                
                {/* Navigation */}
                <div className="p-4 border-b border-[var(--card-border)]">
                  <Link
                    href="/bookmarks"
                    className="flex items-center justify-between p-4 text-[var(--foreground)] hover:bg-[var(--muted-bg)] rounded-xl transition-colors lowercase group"
                    onClick={() => setShowMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className="w-5 h-5 text-[var(--accent)]" />
                      <span>bookmarks</span>
                    </div>
                    {bookmarks.length > 0 && (
                      <span className="bg-[var(--accent)] text-white text-xs px-2 py-1 rounded-full">
                        {bookmarks.length}
                      </span>
                    )}
                  </Link>
                  
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 text-[var(--foreground)] hover:bg-[var(--muted-bg)] rounded-xl transition-colors lowercase"
                  >
                    {theme === 'light' ? (
                      <Moon className="w-5 h-5 text-[var(--accent)]" />
                    ) : (
                      <Sun className="w-5 h-5 text-[var(--accent)]" />
                    )}
                    <span>toggle theme</span>
                  </button>
                </div>
                
                {/* Keyboard Shortcuts */}
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      keyboard shortcuts
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] transition-colors">
                        <div className="flex items-center gap-3">
                          <kbd className="px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-[var(--foreground)] font-mono font-bold text-xs">⌘</kbd>
                          <kbd className="px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-[var(--foreground)] font-mono font-bold text-xs">K</kbd>
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-[var(--accent)]" />
                            <span className="text-sm text-[var(--foreground)]">Quick Search</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] transition-colors">
                        <div className="flex items-center gap-3">
                          <kbd className="px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-[var(--foreground)] font-mono font-bold text-xs">⌘</kbd>
                          <kbd className="px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-[var(--foreground)] font-mono font-bold text-xs">B</kbd>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                            <span className="text-sm text-[var(--foreground)]">Bookmarks</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] transition-colors">
                        <div className="flex items-center gap-3">
                          <kbd className="px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-[var(--foreground)] font-mono font-bold text-xs">⌘</kbd>
                          <kbd className="px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded text-[var(--foreground)] font-mono font-bold text-xs">D</kbd>
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-[var(--accent)]" />
                            <span className="text-sm text-[var(--foreground)]">Toggle Theme</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* About */}
                  <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
                    <div className="flex items-center gap-3 p-4 bg-[var(--muted-bg)] rounded-xl">
                      <Info className="w-4 h-4 text-[var(--muted)]" />
                      <span className="text-sm text-[var(--muted)]">Experience Wikipedia beautifully</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

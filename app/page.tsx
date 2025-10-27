'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { usePreferencesStore } from '@/lib/store';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { 
  Clock, 
  Bookmark as BookmarkIcon, 
  Eye,
  Calendar,
  ArrowRight
} from 'lucide-react';



export default function Home() {
  const { recentlyViewed, bookmarks } = usePreferencesStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Simulate loading for better animation effect
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-[var(--accent)] animate-pulse" />
            <div className="absolute inset-0 animate-ping">
              <Sparkles className="w-12 h-12 text-[var(--accent)] opacity-20" />
            </div>
          </div>
          <p className="mt-4 text-[var(--muted)] animate-pulse">loading nicer.wiki...</p>
        </div>
      </div>
    );
  }

  // Calculate reading stats
  const totalArticlesRead = recentlyViewed.length;
  const totalBookmarks = bookmarks.length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section with Enhanced Animation */}
        <section className="text-center mb-16 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            {/* Animated background elements */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-96 h-96 bg-[var(--accent)] rounded-full blur-3xl animate-pulse" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white px-6 py-3 rounded-full text-sm font-medium mb-8 animate-slide-up shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  Beautiful Wikipedia Reading Experience
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--foreground)] mb-6 lowercase leading-tight animate-slide-up animation-delay-100">
              explore knowledge
              <span className="block text-3xl md:text-5xl mt-4 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--accent)] bg-clip-text text-transparent animate-gradient-x">
                beautifully simplified
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--muted)] max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up animation-delay-200">
              Experience Wikipedia like never before. Clean, fast, and focused on what matters - the content.
            </p>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mb-12 animate-slide-up animation-delay-300">
              <div className="group p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:border-[var(--accent)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {totalArticlesRead}
                </div>
                <div className="text-sm text-[var(--muted)] mt-2 lowercase">articles read</div>
              </div>
              <div className="group p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:border-[var(--accent)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {totalBookmarks}
                </div>
                <div className="text-sm text-[var(--muted)] mt-2 lowercase">bookmarks</div>
              </div>
              <div className="group p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:border-[var(--accent)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  ∞
                </div>
                <div className="text-sm text-[var(--muted)] mt-2 lowercase">knowledge</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recently Viewed with Enhanced Animation */}
        {recentlyViewed.length > 0 && (
          <section className="mb-16 animate-slide-up animation-delay-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-xl shadow-lg animate-pulse">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full animate-ping" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] lowercase">
                recently viewed
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[var(--card-border)] to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.slice(0, 6).map((title, index) => (
                <Link
                  key={title}
                  href={`/wiki/${encodeURIComponent(title)}`}
                  className="group relative p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:border-[var(--accent)] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                        {title.replace(/_/g, ' ')}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Recently read
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Today
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bookmarks Preview with Enhanced Animation */}
        {bookmarks.length > 0 && (
          <section className="mb-16 animate-slide-up animation-delay-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-xl shadow-lg">
                  <BookmarkIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] lowercase">
                  your bookmarks
                </h2>
              </div>
              <Link
                href="/bookmarks"
                className="flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-medium group"
              >
                view all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.slice(0, 3).map((bookmark, index) => (
                <Link
                  key={bookmark.title}
                  href={`/wiki/${encodeURIComponent(bookmark.title)}`}
                  className="group relative p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:border-[var(--accent)] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="absolute top-4 right-4">
                      <BookmarkIcon className="w-5 h-5 text-[var(--accent)] fill-current" />
                    </div>
                    
                    <div className="pr-8">
                      <h3 className="font-bold text-lg text-[var(--foreground)] mb-3 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                        {bookmark.title.replace(/_/g, ' ')}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(bookmark.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        

        {/* Footer with Enhanced Animation */}
        <footer className="mt-24 text-center pb-12 animate-fade-in">
          <div className="mb-4 text-[var(--muted)]">
            Made with love for knowledge enthusiasts
          </div>
          <p className="text-sm text-[var(--muted)]">
            Experience Wikipedia beautifully • Read faster • Learn more
          </p>
        </footer>
      </main>
    </div>
  );
}

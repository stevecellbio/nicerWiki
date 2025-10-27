'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { usePreferencesStore } from '@/lib/store';
import Link from 'next/link';
import { 
  Bookmark as BookmarkIcon, 
  BookmarkCheck, 
  Clock, 
  Search, 
  Calendar,
  ExternalLink,
  Filter,
  Grid,
  List,
  Sparkles,
  Trash2,
  Share2
} from 'lucide-react';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, isBookmarked } = usePreferencesStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bookmark.excerpt && bookmark.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  const handleRemoveBookmark = (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    removeBookmark(title);
  };

  const handleShare = async (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/wiki/${encodeURIComponent(title)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <section className="mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-xl">
                  <BookmarkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] lowercase">
                    your bookmarks
                  </h1>
                  <p className="text-[var(--muted)] mt-1">
                    {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'} saved
                  </p>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-[var(--accent)] text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-[var(--accent)] text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search bookmarks..."
                className="w-full pl-12 pr-4 py-3 border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--muted)]"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1">
              <button
                onClick={() => setSortBy('date')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  sortBy === 'date'
                    ? 'bg-[var(--accent)] text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Recent</span>
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  sortBy === 'title'
                    ? 'bg-[var(--accent)] text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Alphabetical</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bookmarks Content */}
        {filteredBookmarks.length === 0 ? (
          <section className="text-center py-16 animate-slide-up">
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl mb-6 inline-block">
                <BookmarkIcon className="w-12 h-12 text-[var(--muted)]" />
              </div>
              
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 lowercase">
                {searchQuery ? 'no bookmarks found' : 'no bookmarks yet'}
              </h2>
              
              <p className="text-[var(--muted)] mb-8 leading-relaxed">
                {searchQuery 
                  ? 'try adjusting your search terms or browse all bookmarks'
                  : 'start building your personal knowledge library by bookmarking interesting articles'
                }
              </p>
              
              {!searchQuery && (
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  explore articles
                </Link>
              )}
            </div>
          </section>
        ) : (
          <section className="animate-slide-up">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map((bookmark, index) => (
                  <div
                    key={bookmark.title}
                    className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-2">
                          <Link
                            href={`/wiki/${encodeURIComponent(bookmark.title)}`}
                            className="block"
                          >
                            <h3 className="font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                              {bookmark.title.replace(/_/g, ' ')}
                            </h3>
                            
                            {bookmark.excerpt && (
                              <p className="text-sm text-[var(--muted)] line-clamp-3 leading-relaxed">
                                {bookmark.excerpt}
                              </p>
                            )}
                          </Link>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleShare(bookmark.title, e)}
                            className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleRemoveBookmark(bookmark.title, e)}
                            className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(bookmark.timestamp)}
                        </span>
                        <BookmarkCheck className="w-4 h-4 text-[var(--accent)] fill-current" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookmarks.map((bookmark, index) => (
                  <div
                    key={bookmark.title}
                    className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg transition-all duration-300 overflow-hidden"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Link
                      href={`/wiki/${encodeURIComponent(bookmark.title)}`}
                      className="block p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3 mb-2">
                            <BookmarkCheck className="w-5 h-5 text-[var(--accent)] fill-current" />
                            <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                              {bookmark.title.replace(/_/g, ' ')}
                            </h3>
                          </div>
                          
                          {bookmark.excerpt && (
                            <p className="text-[var(--muted)] mb-3 line-clamp-2">
                              {bookmark.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(bookmark.timestamp)}
                            </span>
                            <span className="flex items-center gap-1 text-[var(--accent)]">
                              <ExternalLink className="w-3 h-3" />
                              read article
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleShare(bookmark.title, e)}
                            className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleRemoveBookmark(bookmark.title, e)}
                            className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Stats Section */}
        {bookmarks.length > 0 && (
          <section className="mt-16 p-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 lowercase">
              reading statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--accent)] mb-2">
                  {bookmarks.length}
                </div>
                <div className="text-sm text-[var(--muted)] lowercase">
                  total bookmarks
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--accent)] mb-2">
                  {Math.floor(bookmarks.length * 18)} min
                </div>
                <div className="text-sm text-[var(--muted)] lowercase">
                  estimated reading time
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--accent)] mb-2">
                  {bookmarks.length > 0 ? formatDate(bookmarks[0].timestamp) : 'N/A'}
                </div>
                <div className="text-sm text-[var(--muted)] lowercase">
                  most recent bookmark
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePreferencesStore } from '@/lib/store';
import { WikipediaArticle, WikipediaSearchResult } from '@/types';
import { processWikipediaHTML, extractTableOfContents, estimateReadingTime, getArticleStats } from '@/lib/wikipedia';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkCheck,
  Type,
  List,
  ChevronRight,
  ExternalLink,
  Clock,
  Eye,
  Share2,
  Sun,
  Moon,
  ArrowUp,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface ArticleViewProps {
  article: WikipediaArticle;
  relatedArticles: WikipediaSearchResult[];
}

export function ArticleView({ article, relatedArticles }: ArticleViewProps) {
  const [processedHTML, setProcessedHTML] = useState('');
  const [toc, setToc] = useState<{ id: string; title: string; level: number }[]>([]);
  const [showTOC, setShowTOC] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [articleStats, setArticleStats] = useState({ wordCount: 0, imageCount: 0, tableCount: 0, sectionCount: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const articleRef = useRef<HTMLDivElement>(null);
  const headingsRef = useRef<{ id: string; element: HTMLElement }[]>([]);

  const {
    fontSize,
    setFontSize,
    addBookmark,
    removeBookmark,
    isBookmarked,
    addToRecentlyViewed,
    theme,
    toggleTheme
  } = usePreferencesStore();

  const bookmarked = isBookmarked(article.title);

  useEffect(() => {
    const processed = processWikipediaHTML(article.html);
    setProcessedHTML(processed);
    const tableOfContents = extractTableOfContents(article.html);
    setToc(tableOfContents);
    
    // Estimate reading time and get article stats
    const time = estimateReadingTime(processed);
    setReadingTime(time);
    
    const stats = getArticleStats(processed);
    setArticleStats(stats);
    
    addToRecentlyViewed(article.title);

    // Track headings for current section detection
    setTimeout(() => {
      const headings = articleRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings) {
        headingsRef.current = Array.from(headings).map(heading => ({
          id: heading.id || heading.textContent?.replace(/\s+/g, '-').toLowerCase() || '',
          element: heading as HTMLElement
        }));
      }
    }, 100);
  }, [article, addToRecentlyViewed]);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;

      const articleElement = articleRef.current;
      const articleHeight = articleElement.scrollHeight - articleElement.clientHeight;
      const scrolled = articleElement.scrollTop;
      const progress = (scrolled / articleHeight) * 100;
      setReadingProgress(Math.min(Math.max(progress, 0), 100));

      // Show/hide scroll to top button
      setShowScrollTop(scrolled > 500);

      // Update current section
      const currentHeading = headingsRef.current.find(heading => {
        const rect = heading.element.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 200;
      });
      
      if (currentHeading) {
        setCurrentSection(currentHeading.title);
      }
    };

    const articleElement = articleRef.current;
    if (articleElement) {
      articleElement.addEventListener('scroll', handleScroll);
      return () => articleElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(article.title);
    } else {
      addBookmark({
        title: article.title,
        timestamp: new Date().toISOString(),
        excerpt: article.description || ''
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const scrollToTop = () => {
    if (articleRef.current) {
      articleRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element && articleRef.current) {
      const offset = element.offsetTop - 100;
      articleRef.current.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Reading Progress Bar */}
      <div className="sticky top-0 z-40 h-1 bg-[var(--card-border)]">
        <div 
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* TOC Toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowTOC(!showTOC)}
                  className="w-full flex items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] transition-colors"
                >
                  <span className="flex items-center gap-2 text-[var(--foreground)]">
                    <List className="w-5 h-5" />
                    Table of Contents
                  </span>
                  <ChevronRight className={`w-5 h-5 text-[var(--muted)] transition-transform ${showTOC ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Desktop TOC */}
              <div className={`hidden lg:block bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 ${showTOC ? 'block' : ''}`}>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <List className="w-5 h-5 text-[var(--accent)]" />
                  contents
                </h3>
                
                {currentSection && (
                  <div className="mb-4 p-3 bg-[var(--accent)]/10 rounded-lg">
                    <div className="text-xs text-[var(--accent)] font-medium mb-1">currently reading</div>
                    <div className="text-sm text-[var(--foreground)] font-medium truncate">{currentSection}</div>
                  </div>
                )}
                
                <nav className="space-y-1 max-h-96 overflow-y-auto">
                  {toc.map((item, index) => (
                    <button
                      key={item.id || index}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentSection === item.title
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                      }`}
                      style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Reading Stats */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[var(--accent)]" />
                  article stats
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-[var(--muted-bg)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--accent)]">{readingTime}</div>
                    <div className="text-xs text-[var(--muted)]">min read</div>
                  </div>
                  <div className="text-center p-3 bg-[var(--muted-bg)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--accent)]">{articleStats.wordCount.toLocaleString()}</div>
                    <div className="text-xs text-[var(--muted)]">words</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">reading progress</span>
                    <span className="text-[var(--foreground)] font-medium">{Math.round(readingProgress)}%</span>
                  </div>
                  <div className="bg-[var(--card-border)] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                  
                  <div className="pt-3 space-y-2 border-t border-[var(--card-border)]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        🖼️ images
                      </span>
                      <span className="text-[var(--foreground)] font-medium">{articleStats.imageCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        📊 tables
                      </span>
                      <span className="text-[var(--foreground)] font-medium">{articleStats.tableCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        📑 sections
                      </span>
                      <span className="text-[var(--foreground)] font-medium">{articleStats.sectionCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Article Header */}
            <header className="mb-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
                    {article.title.replace(/_/g, ' ')}
                  </h1>
                  
                  {article.description && (
                    <p className="text-lg text-[var(--muted)] leading-relaxed">
                      {article.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Article Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    bookmarked
                      ? 'bg-[var(--accent)] text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] hover:scale-105'
                  }`}
                >
                  {bookmarked ? (
                    <>
                      <BookmarkCheck className="w-5 h-5 fill-current" />
                      bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-5 h-5" />
                      bookmark
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-xl font-medium hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="w-5 h-5" />
                  share
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl font-medium">
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
                <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--muted)]">
                  {article.lastModified && (
                    <div>
                      Last modified: {formatDate(article.lastModified)}
                    </div>
                  )}
                  {article.image && (
                    <div className="flex items-center gap-2">
                      <img src={article.image.source} alt="" className="w-8 h-8 rounded object-cover" />
                      <span>Main image available</span>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Font Size Controls */}
            <div className="mb-6 flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
              <Type className="w-5 h-5 text-[var(--accent)]" />
              <span className="text-sm text-[var(--muted)]">font size:</span>
              <div className="flex items-center gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      fontSize === size
                        ? 'bg-[var(--accent)] text-white shadow-lg'
                        : 'bg-[var(--muted-bg)] text-[var(--foreground)] hover:bg-[var(--card-border)]'
                    }`}
                  >
                    {size === 'small' ? 'Aa' : size === 'medium' ? 'Aa' : 'Aa'}
                    <span className="ml-1 text-xs">{size === 'small' ? 'small' : size === 'medium' ? 'medium' : 'large'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Article Content */}
            <div 
              ref={articleRef}
              className={`article-content font-${fontSize} resizable bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 max-h-[calc(100vh-200px)] overflow-y-auto`}
              dangerouslySetInnerHTML={{ __html: processedHTML }}
            />

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
                  related articles
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedArticles.slice(0, 4).map((related) => (
                    <Link
                      key={related.id}
                      href={`/wiki/${encodeURIComponent(related.title)}`}
                      className="group p-4 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-lg hover:border-[var(--accent)] hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-3">
                        {related.thumbnail && (
                          <img
                            src={related.thumbnail.source}
                            alt={related.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {related.title}
                          </h3>
                          {related.description && (
                            <p className="text-sm text-[var(--muted)] truncate mt-1">
                              {related.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-[var(--accent)] text-white rounded-full shadow-lg hover:bg-[var(--accent-hover)] transition-all duration-300 hover:scale-110 z-50 animate-scale-in"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Mobile TOC Modal */}
      {showTOC && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowTOC(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--card-bg)] border-l border-[var(--card-border)] overflow-y-auto animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--foreground)]">Table of Contents</h3>
                <button
                  onClick={() => setShowTOC(false)}
                  className="p-2 hover:bg-[var(--muted-bg)] rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <nav className="space-y-1">
                {toc.map((item, index) => (
                  <button
                    key={item.id || index}
                    onClick={() => {
                      scrollToSection(item.id);
                      setShowTOC(false);
                    }}
                    className="block w-full text-left px-4 py-3 rounded-lg transition-colors text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                    style={{ paddingLeft: `${(item.level - 1) * 16 + 16}px` }}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

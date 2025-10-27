export interface WikipediaSearchResult {
  id: number;
  title: string;
  description?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

export interface WikipediaArticle {
  title: string;
  displayTitle?: string;
  description?: string;
  extract?: string;
  content: string;
  html: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalImage?: {
    source: string;
    width: number;
    height: number;
  };
  lastModified?: string;
  categories?: string[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export interface Bookmark {
  title: string;
  timestamp: number;
  thumbnail?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  bookmarks: Bookmark[];
  recentlyViewed: string[];
}

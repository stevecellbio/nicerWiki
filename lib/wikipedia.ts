import { WikipediaSearchResult, WikipediaArticle } from '@/types';

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';
const WIKIPEDIA_ACTION_API = 'https://en.wikipedia.org/w/api.php';

export async function searchWikipedia(query: string, limit: number = 10): Promise<WikipediaSearchResult[]> {
  try {
    const response = await fetch(
      `${WIKIPEDIA_ACTION_API}?action=query&format=json&generator=prefixsearch&prop=pageimages|pageterms&piprop=thumbnail&pithumbsize=100&pilimit=${limit}&wbptterms=description&gpssearch=${encodeURIComponent(query)}&gpslimit=${limit}&origin=*`
    );

    const data = await response.json();

    if (!data.query?.pages) {
      return [];
    }

    const results: WikipediaSearchResult[] = Object.values(data.query.pages).map((page: any) => ({
      id: page.pageid,
      title: page.title,
      description: page.terms?.description?.[0],
      thumbnail: page.thumbnail ? {
        source: page.thumbnail.source,
        width: page.thumbnail.width,
        height: page.thumbnail.height,
      } : undefined,
    }));

    return results;
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    return [];
  }
}

export async function getWikipediaArticle(title: string): Promise<WikipediaArticle | null> {
  try {
    // Fetch the article HTML
    const htmlResponse = await fetch(
      `${WIKIPEDIA_API_BASE}/page/html/${encodeURIComponent(title)}`
    );

    if (!htmlResponse.ok) {
      throw new Error('Article not found');
    }

    const html = await htmlResponse.text();

    // Fetch summary for metadata
    const summaryResponse = await fetch(
      `${WIKIPEDIA_API_BASE}/page/summary/${encodeURIComponent(title)}`
    );

    const summary = await summaryResponse.json();

    return {
      title: summary.title,
      displayTitle: summary.displaytitle,
      description: summary.description,
      extract: summary.extract,
      content: summary.extract || '',
      html: html,
      thumbnail: summary.thumbnail,
      originalImage: summary.originalimage,
    };
  } catch (error) {
    console.error('Error fetching Wikipedia article:', error);
    return null;
  }
}

export async function getRelatedArticles(title: string, limit: number = 5): Promise<WikipediaSearchResult[]> {
  try {
    const response = await fetch(
      `${WIKIPEDIA_API_BASE}/page/related/${encodeURIComponent(title)}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.pages) {
      return [];
    }

    return data.pages.slice(0, limit).map((page: any) => ({
      id: page.pageid || 0,
      title: page.title,
      description: page.description,
      thumbnail: page.thumbnail,
    }));
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

export function extractTableOfContents(html: string): { id: string; title: string; level: number }[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h2, h3, h4');

  return Array.from(headings).map((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const id = heading.id || `heading-${index}`;

    // Get text content, removing edit links
    const clone = heading.cloneNode(true) as Element;
    const editLinks = clone.querySelectorAll('.mw-editsection');
    editLinks.forEach(link => link.remove());

    return {
      id,
      title: clone.textContent?.trim() || '',
      level,
    };
  }).filter(item => item.title.length > 0);
}

export function estimateReadingTime(html: string): number {
  if (typeof window === 'undefined') {
    return 15; // Default fallback
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Get all text content from meaningful elements
  const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote');
  let totalText = '';
  
  textElements.forEach(element => {
    const text = element.textContent?.trim();
    if (text && text.length > 10) { // Filter out very short text fragments
      totalText += text + ' ';
    }
  });
  
  // Count words more accurately
  const words = totalText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Use 100 words per minute as requested (10 minutes for 1000 words)
  const wordsPerMinute = 100;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
}

export function getArticleStats(html: string): { wordCount: number; imageCount: number; tableCount: number; sectionCount: number } {
  if (typeof window === 'undefined') {
    return { wordCount: 0, imageCount: 0, tableCount: 0, sectionCount: 0 };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Count meaningful words
  const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote');
  let totalText = '';
  
  textElements.forEach(element => {
    const text = element.textContent?.trim();
    if (text && text.length > 10) {
      totalText += text + ' ';
    }
  });
  
  const words = totalText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Count other elements
  const imageCount = doc.querySelectorAll('img').length;
  const tableCount = doc.querySelectorAll('table').length;
  const sectionCount = doc.querySelectorAll('h2, h3, h4').length;
  
  return { wordCount, imageCount, tableCount, sectionCount };
}

export function processWikipediaHTML(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove edit sections
  doc.querySelectorAll('.mw-editsection').forEach(el => el.remove());

  // Remove font-size styles from elements that could override our font size
  doc.querySelectorAll('[style]').forEach(el => {
    const htmlEl = el as HTMLElement;
    const currentStyle = htmlEl.getAttribute('style') || '';
    // Remove font-size declarations from inline styles
    const cleanedStyle = currentStyle.replace(/font-size\s*:\s*[^;]+;?/gi, '');
    htmlEl.setAttribute('style', cleanedStyle);
  });

  // Remove unnecessary elements that cause white spots
  doc.querySelectorAll('.magnify, .thumb.tright, .thumb.tleft').forEach(el => {
    el.classList.remove('magnify');
    el.classList.add('responsive-image-container');
  });

  // Style images to be responsive and beautiful
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('//')) {
      img.setAttribute('src', `https:${src}`);
    }
    
    // Add comprehensive image styling
    img.classList.add(
      'resizable-horizontal',
      'max-w-full', 
      'h-auto', 
      'rounded-xl', 
      'shadow-lg', 
      'mx-auto', 
      'block',
      'transition-all',
      'duration-300',
      'hover:shadow-xl'
    );
    
    // Add loading="lazy" for performance
    img.setAttribute('loading', 'lazy');
    
    // Add proper alt text if missing
    if (!img.getAttribute('alt')) {
      img.setAttribute('alt', 'Wikipedia image');
    }
    
    // Wrap image in a figure for better semantics if not already wrapped
    if (!img.closest('figure')) {
      const figure = doc.createElement('figure');
      figure.classList.add('my-8', 'text-center', 'resizable-horizontal');
      const parentNode = img.parentNode;
      parentNode?.insertBefore(figure, img);
      figure.appendChild(img);
      
      // Add caption if there's one
      const caption = img.getAttribute('title');
      if (caption) {
        const figcaption = doc.createElement('figcaption');
        figcaption.textContent = caption;
        figcaption.classList.add('text-sm', 'text-gray-500', 'dark:text-gray-400', 'mt-3', 'italic');
        figure.appendChild(figcaption);
      }
    }
  });

  // Handle thumbnail containers
  doc.querySelectorAll('.thumbinner, .thumb').forEach(container => {
    container.classList.add('max-w-full', 'overflow-hidden', 'mx-auto');
    container.style.width = 'auto';
    container.style.maxWidth = '100%';
  });

  // Reference brackets styling
  doc.querySelectorAll('sup.reference').forEach(el => {
    const bracket = el.textContent?.trim();
    if (bracket && bracket.startsWith('[') && bracket.endsWith(']')) {
      const htmlEl = el as HTMLElement;
      htmlEl.style.fontSize = '0.75em';
      htmlEl.style.lineHeight = '0';
      htmlEl.style.verticalAlign = 'super';
    }
  });

  // Convert internal Wikipedia links
  doc.querySelectorAll('a[href^="./"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const title = href.substring(2);
      link.setAttribute('href', `/wiki/${title}`);
    }
  });

  // Add IDs to headings for TOC navigation
  doc.querySelectorAll('h2, h3, h4').forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
  });

  // Style tables to be responsive
  doc.querySelectorAll('table').forEach(table => {
    table.classList.add('border-collapse', 'border', 'border-gray-300', 'dark:border-gray-600', 'my-4', 'w-full', 'overflow-x-auto', 'bg-white', 'dark:bg-slate-900');
    
    // Add proper data attributes for dark mode
    table.setAttribute('data-table', 'wikipedia');
    
    // Wrap table in responsive container if not already wrapped
    if (!table.parentElement?.classList.contains('table-container')) {
      const wrapper = doc.createElement('div');
      wrapper.classList.add('table-container', 'overflow-x-auto', 'w-full', 'bg-white', 'dark:bg-slate-900');
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });

  // Style table cells
  doc.querySelectorAll('th').forEach(cell => {
    cell.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'p-2', 'text-sm', 'bg-gray-50', 'dark:bg-slate-800', 'text-gray-900', 'dark:text-gray-100');
  });

  doc.querySelectorAll('td').forEach(cell => {
    cell.classList.add('border', 'border-gray-300', 'dark:border-gray-600', 'p-2', 'text-sm', 'bg-white', 'dark:bg-slate-900', 'text-gray-900', 'dark:text-gray-100');
  });

  // Remove problematic infobox elements that might cause white spots
  doc.querySelectorAll('.infobox').forEach(infobox => {
    infobox.classList.add('max-w-full', 'overflow-hidden', 'mx-auto');
  });

  return doc.body.innerHTML;
}

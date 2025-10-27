# Wikipedia Reader

A modern, clean web application for reading Wikipedia articles with an enhanced, distraction-free interface. Built with Next.js 14+, React 18+, TypeScript, and Tailwind CSS.

## Features

### Core Features

- **Search Interface**: Real-time search with autocomplete suggestions and article previews
- **Enhanced Article Display**: Clean typography optimized for readability with responsive layout
- **Table of Contents**: Smooth scroll navigation with automatically generated TOC
- **Dark/Light Mode**: Eye-friendly dark mode with theme persistence
- **Reading Enhancements**:
  - Adjustable font sizes (small, medium, large)
  - Reading progress indicator
  - Optimized line length for comfortable reading
- **Bookmark System**: Save articles for later with thumbnail previews
- **Recently Viewed**: Track your reading history
- **Related Articles**: Discover related content with sidebar recommendations
- **Mobile-First Design**: Fully responsive layout optimized for all devices

### Technical Features

- **Server-Side Rendering**: Fast initial page loads with Next.js App Router
- **Client-Side Navigation**: Smooth in-app navigation between articles
- **State Management**: Zustand for preferences and bookmarks with localStorage persistence
- **Image Optimization**: Properly styled images with lazy loading
- **SEO Optimized**: Meta tags and structured data for article content
- **TypeScript**: Full type safety throughout the application
- **Wikipedia API Integration**: Uses Wikipedia REST API for reliable content fetching

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd wikipedia-reader
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
wikipedia-reader/
├── app/                    # Next.js app directory
│   ├── bookmarks/         # Bookmarks page
│   ├── wiki/[title]/      # Dynamic article pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ArticleView.tsx   # Article display component
│   ├── Header.tsx        # Navigation header
│   └── ThemeProvider.tsx # Theme context provider
├── lib/                   # Utility libraries
│   ├── store.ts          # Zustand store for state management
│   └── wikipedia.ts      # Wikipedia API service
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types
└── public/               # Static assets
```

## Key Technologies

- **Framework**: Next.js 16.0.0 with App Router
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.16
- **State Management**: Zustand 5.0.8
- **Icons**: Lucide React 0.548.0
- **API**: Wikipedia REST API v1

## Features in Detail

### Search Functionality

The search interface provides:
- Real-time autocomplete as you type
- Article thumbnails and descriptions in search results
- Keyboard navigation support
- Debounced API calls to reduce load

### Article Display

Articles are displayed with:
- Clean, serif typography for body text
- Responsive images with proper attribution
- Styled tables and infoboxes
- Preserved internal Wikipedia links that navigate within the app
- Citation support with formatted references
- Smooth scroll navigation to sections

### User Preferences

All preferences are persisted to localStorage:
- Theme selection (light/dark)
- Font size preference
- Bookmarked articles
- Recently viewed history (last 10 articles)

### Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible sidebar on smaller screens
- Touch-friendly navigation
- Optimized layouts for tablets and desktops

## API Usage

This application uses the Wikipedia REST API:
- Article content: `https://en.wikipedia.org/api/rest_v1/page/html/{title}`
- Article summary: `https://en.wikipedia.org/api/rest_v1/page/summary/{title}`
- Search: `https://en.wikipedia.org/w/api.php?action=query&generator=prefixsearch`
- Related articles: `https://en.wikipedia.org/api/rest_v1/page/related/{title}`

## Future Enhancements

Potential features to add:
- Print-friendly layout
- Multilingual support (switch Wikipedia language editions)
- Offline reading with service workers
- Citation export (BibTeX, APA, MLA)
- Text-to-speech integration
- Article annotations and highlights
- Reading statistics and analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Wikipedia for providing the free API
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- All contributors to the open-source libraries used in this project

import { getWikipediaArticle, getRelatedArticles } from '@/lib/wikipedia';
import { ArticleView } from '@/components/ArticleView';
import { Header } from '@/components/Header';
import { notFound } from 'next/navigation';

interface ArticlePageProps {
  params: Promise<{
    title: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);
  const article = await getWikipediaArticle(decodedTitle);

  if (!article) {
    return {
      title: 'article not found - nicer.wiki',
    };
  }

  return {
    title: `${article.title} - nicer.wiki`,
    description: article.description || article.extract,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);

  const [article, relatedArticles] = await Promise.all([
    getWikipediaArticle(decodedTitle),
    getRelatedArticles(decodedTitle),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <ArticleView article={article} relatedArticles={relatedArticles} />
    </div>
  );
}

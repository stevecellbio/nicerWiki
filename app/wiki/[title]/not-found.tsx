import Link from 'next/link';
import { Header } from '@/components/Header';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded p-12">
            <AlertCircle className="w-16 h-16 text-[#ff6b35] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4 lowercase">
              article not found
            </h1>
            <p className="text-gray-400 mb-8 lowercase">
              sorry, we couldn't find the wikipedia article you're looking for.
              it may have been moved, deleted, or the title might be incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-[#ff6b35] text-white rounded hover:bg-[#ff8555] transition-colors lowercase"
              >
                go home
              </Link>
              <a
                href="https://en.wikipedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#1a1a1a] text-gray-300 rounded hover:bg-[#2a2a2a] transition-colors lowercase"
              >
                visit wikipedia
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

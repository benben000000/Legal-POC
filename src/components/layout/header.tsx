'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SearchResult {
  matters: Array<{ id: string; caseTitle: string; docketNumber: string | null; status: string }>;
  documents: Array<{ id: string; title: string; fileName: string; category?: string; matterId: string; matter: { caseTitle: string } }>;
  tasks: Array<{ id: string; title: string; status: string; matterId: string }>;
}

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
  };

  const totalResults = (results?.matters.length || 0) + (results?.documents.length || 0) + (results?.tasks.length || 0);

  return (
    <header className="bg-white/90 backdrop-blur-xs border-b border-gray-200 sticky top-0 z-30 transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Global Search Bar */}
        <div ref={containerRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (results) setIsOpen(true); }}
              placeholder="Quick search cases, documents, tasks... (Press Esc to close)"
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50/80 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            <svg
              className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isLoading && (
              <svg className="absolute right-3 top-2.5 w-3.5 h-3.5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults(null); }}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 w-4 h-4 rounded-full flex items-center justify-center bg-gray-200 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Floating Dropdown Results */}
          {isOpen && results && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-soft-in">
              {totalResults > 0 ? (
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 text-xs">
                  {/* Matters Section */}
                  {results.matters.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Cases & Matters ({results.matters.length})
                      </div>
                      {results.matters.map((m) => (
                        <Link
                          key={m.id}
                          href={`/matters/${m.id}`}
                          onClick={handleSelect}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-blue-50/60 hover:text-blue-700 transition-colors group"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                              {m.caseTitle}
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono">
                              {m.docketNumber || 'No Docket'}
                            </p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {m.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Documents Section */}
                  {results.documents.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Documents ({results.documents.length})
                      </div>
                      {results.documents.map((d) => (
                        <Link
                          key={d.id}
                          href="/documents"
                          onClick={handleSelect}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-blue-50/60 hover:text-blue-700 transition-colors group"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                              {d.title}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Case: {d.matter.caseTitle}
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {d.category ? d.category.replace('_', ' ') : 'DOCUMENT'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Tasks Section */}
                  {results.tasks.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Workflow Tasks ({results.tasks.length})
                      </div>
                      {results.tasks.map((t) => (
                        <Link
                          key={t.id}
                          href="/tasks"
                          onClick={handleSelect}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-blue-50/60 hover:text-blue-700 transition-colors group"
                        >
                          <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                            {t.title}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono">
                            {t.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-500">
                  No matching records found for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center border border-blue-200">
              AG
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-900 leading-tight">Atty. Benedict Garcia</span>
              <span className="text-[10px] text-gray-500">Managing Partner</span>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={handleLogout} className="text-xs">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

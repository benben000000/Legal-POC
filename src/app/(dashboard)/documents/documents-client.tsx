'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { UploadDocumentModal } from '@/components/documents/upload-document-modal';
import { format } from 'date-fns';
import Link from 'next/link';

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  matterId: string;
  matter: { caseTitle: string };
}

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface DocumentsClientProps {
  documents: DocumentItem[];
  matters: MatterOption[];
}

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Documents' },
  { id: 'PLEADINGS_MOTIONS', label: 'Pleadings & Motions' },
  { id: 'COURT_ORDERS', label: 'Court Orders' },
  { id: 'EVIDENCE_ANNEXES', label: 'Evidence & Annexes' },
  { id: 'CORRESPONDENCE_BILLING', label: 'Correspondence' },
];

export function DocumentsClient({ documents, matters }: DocumentsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedMatterId, setSelectedMatterId] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'size'>('newest');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Multi-Filter & Search Logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Category filter
      if (activeCategory !== 'ALL' && doc.category !== activeCategory) {
        return false;
      }

      // 2. Matter filter
      if (selectedMatterId !== 'ALL' && doc.matterId !== selectedMatterId) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = doc.title.toLowerCase().includes(query);
        const matchFile = doc.fileName.toLowerCase().includes(query);
        const matchMatter = doc.matter.caseTitle.toLowerCase().includes(query);
        if (!matchTitle && !matchFile && !matchMatter) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'size') {
        return b.fileSize - a.fileSize;
      }
      return 0;
    });
  }, [documents, activeCategory, selectedMatterId, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || activeCategory !== 'ALL' || selectedMatterId !== 'ALL' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('ALL');
    setSelectedMatterId('ALL');
    setSortBy('newest');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Case Binder (Document Vault)"
        description="Encrypted, indexed case documents organized across procedural legal categories with instant search and multi-filtering."
        action={
          <Button onClick={() => setIsUploadOpen(true)} size="sm">
            + Upload Document
          </Button>
        }
      />

      {/* Category Taxonomy Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.id === 'ALL'
              ? documents.length
              : documents.filter((d) => d.category === tab.id).length;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} <span className="ml-1 text-xs text-gray-400">({count})</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Real-time Text Search */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document title, filename, or matter..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            <svg
              className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter by Matter */}
          <div className="md:col-span-4">
            <select
              value={selectedMatterId}
              onChange={(e) => setSelectedMatterId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="ALL">All Matters ({matters.length})</option>
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.caseTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="size">Sort: File Size (Largest)</option>
            </select>
          </div>
        </div>

        {/* Results Metadata & Reset Filters */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <span>
              Showing <strong className="text-gray-900">{filteredDocuments.length}</strong> of{' '}
              <strong className="text-gray-900">{documents.length}</strong> documents
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                Filters Active
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Documents Table View */}
      <Card>
        {filteredDocuments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-gray-900">
                    <div>
                      <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {doc.fileName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <Link href={`/matters/${doc.matterId}`} className="hover:underline text-blue-600">
                      {doc.matter.caseTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">
                      {doc.category.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs font-mono">
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs font-mono">
                    {formatFileSize(doc.fileSize)}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Opening document: ${doc.title}`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      View &rarr;
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center space-y-3">
            <EmptyState
              title={hasActiveFilters ? "No matching documents" : "No documents uploaded"}
              description={
                hasActiveFilters
                  ? "No documents matched your search and filter criteria. Try clearing search keywords or selecting 'All Matters'."
                  : "Upload legal pleadings, court resolutions, evidence annexes, or correspondence."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setIsUploadOpen(true)}>
                    Upload First Document
                  </Button>
                )
              }
            />
          </div>
        )}
      </Card>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        matters={matters}
      />
    </div>
  );
}

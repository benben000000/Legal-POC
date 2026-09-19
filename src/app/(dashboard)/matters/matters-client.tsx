'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';
import Link from 'next/link';

interface MatterItem {
  id: string;
  caseTitle: string;
  docketNumber: string | null;
  courtBranch: string;
  presidingJudge: string | null;
  clientName: string;
  status: string;
  priority: string;
  caseType: string | null;
  updatedAt: string;
  openedAt: string;
}

interface MattersClientProps {
  matters: MatterItem[];
  userRole: string;
}

const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'FOR_PLEADING', label: 'For Pleading' },
  { id: 'UNDER_SUBMISSION', label: 'Under Submission' },
  { id: 'PROMULGATED', label: 'Promulgated' },
  { id: 'ARCHIVED', label: 'Archived' },
];

const PRIORITY_OPTIONS = [
  { id: 'ALL', label: 'All Priorities' },
  { id: 'URGENT', label: 'Urgent' },
  { id: 'HIGH', label: 'High' },
  { id: 'NORMAL', label: 'Normal' },
  { id: 'LOW', label: 'Low' },
];

export function MattersClient({ matters, userRole }: MattersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'opened'>('updated');

  // Multi-Filter & Search Logic
  const filteredMatters = useMemo(() => {
    return matters.filter((m) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && m.status !== statusFilter) {
        return false;
      }

      // 2. Priority Filter
      if (priorityFilter !== 'ALL' && m.priority !== priorityFilter) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = m.caseTitle.toLowerCase().includes(query);
        const matchDocket = (m.docketNumber || '').toLowerCase().includes(query);
        const matchClient = m.clientName.toLowerCase().includes(query);
        const matchCourt = m.courtBranch.toLowerCase().includes(query);
        const matchJudge = (m.presidingJudge || '').toLowerCase().includes(query);
        const matchType = (m.caseType || '').toLowerCase().includes(query);

        if (!matchTitle && !matchDocket && !matchClient && !matchCourt && !matchJudge && !matchType) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'title') {
        return a.caseTitle.localeCompare(b.caseTitle);
      }
      if (sortBy === 'opened') {
        return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
      }
      return 0;
    });
  }, [matters, statusFilter, priorityFilter, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || sortBy !== 'updated';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('updated');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matters"
        description="Comprehensive case tracking across Philippine trial and appellate courts, arbitration bodies, and corporate retainers."
        action={
          userRole !== 'STAFF' && (
            <Link href="/matters/new">
              <Button size="sm">
                + New Matter
              </Button>
            </Link>
          )
        }
      />

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Real-time Search */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case title, docket, client, or court branch..."
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

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Status: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Priority: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="updated">Recently Updated</option>
              <option value="title">Case Title (A-Z)</option>
              <option value="opened">Newest Opened</option>
            </select>
          </div>
        </div>

        {/* Results Metadata & Reset Filters */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <span>
              Showing <strong className="text-gray-900">{filteredMatters.length}</strong> of{' '}
              <strong className="text-gray-900">{matters.length}</strong> matters
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

      {/* Matters Table */}
      <Card>
        {filteredMatters.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Title & Docket</TableHead>
                <TableHead>Court / Venue</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatters.map((matter) => (
                <TableRow key={matter.id}>
                  <TableCell className="font-medium text-gray-900">
                    <div>
                      <Link
                        href={`/matters/${matter.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                      >
                        {matter.caseTitle}
                      </Link>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono mt-0.5">
                        <span>{matter.docketNumber || 'Unassigned Docket'}</span>
                        {matter.caseType && (
                          <>
                            <span>•</span>
                            <span className="font-sans truncate max-w-[200px]">{matter.caseType}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-[220px]">
                    <p className="truncate font-medium text-gray-800">{matter.courtBranch}</p>
                    {matter.presidingJudge && (
                      <p className="text-gray-500 truncate mt-0.5">Judge: {matter.presidingJudge}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700 text-xs font-medium">
                    {matter.clientName}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        matter.status === 'ACTIVE' || matter.status === 'FOR_PLEADING' ? 'success' : 
                        matter.status === 'ARCHIVED' ? 'neutral' : 'warning'
                      }
                    >
                      {matter.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        matter.priority === 'URGENT' || matter.priority === 'CRITICAL'
                          ? 'error'
                          : matter.priority === 'HIGH'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {matter.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/matters/${matter.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      View Matter &rarr;
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center space-y-3">
            <EmptyState
              title={hasActiveFilters ? "No matching matters" : "No matters found"}
              description={
                hasActiveFilters
                  ? "No cases matched your search query or filter options. Try adjusting keywords or resetting filters."
                  : "Get started by creating a new legal matter."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                ) : userRole !== 'STAFF' ? (
                  <Link href="/matters/new">
                    <Button size="sm">Create New Matter</Button>
                  </Link>
                ) : undefined
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}

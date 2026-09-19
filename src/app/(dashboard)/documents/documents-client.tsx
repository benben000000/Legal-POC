'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { UploadDocumentModal } from '@/components/documents/upload-document-modal';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredDocuments = activeCategory === 'ALL'
    ? documents
    : documents.filter((d) => d.category === activeCategory);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Case Binder (Document Vault)"
        description="Encrypted, indexed case documents organized across procedural legal categories."
        action={
          <Button onClick={() => setIsUploadOpen(true)}>
            Upload Document
          </Button>
        }
      />

      {/* Category Taxonomy Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.id === 'ALL'
              ? documents.length
              : documents.filter((d) => d.category === tab.id).length;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-100 ${
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
                      <p>{doc.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{doc.fileName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <Link href={`/matters/${doc.matterId}`} className="hover:underline text-blue-600">
                      {doc.matter.caseTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">
                      {doc.category.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs">
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs font-mono">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => alert(`Accessing encrypted vault copy of: ${doc.fileName}`)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Download
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No documents in this category"
            description="Upload initial pleadings, annexes, or court resolutions to populate this binder."
            action={
              <Button onClick={() => setIsUploadOpen(true)}>
                Upload Document
              </Button>
            }
          />
        )}
      </Card>

      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        matters={matters}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  matters: MatterOption[];
  defaultMatterId?: string;
  onSuccess?: () => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  matters,
  defaultMatterId,
  onSuccess,
}: UploadDocumentModalProps) {
  const [matterId, setMatterId] = useState(defaultMatterId || matters[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PLEADINGS_MOTIONS');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 25MB limit check (PRD FR-4.2)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File exceeds maximum allowed size of 25MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!matterId) throw new Error('Please select a matter');
      if (!title) throw new Error('Document title is required');

      const payload = {
        matterId,
        title,
        category,
        description,
        fileName: selectedFile?.name || `${title}.pdf`,
        fileSize: selectedFile?.size || 1024 * 512,
        mimeType: selectedFile?.type || 'application/pdf',
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Upload Case Document to Vault</ModalTitle>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Select
            label="Associated Matter *"
            id="doc-matter"
            value={matterId}
            onChange={(e) => setMatterId(e.target.value)}
            options={matters.map((m) => ({ value: m.id, label: m.caseTitle }))}
          />

          <Select
            label="Category Taxonomy *"
            id="doc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'PLEADINGS_MOTIONS', label: 'Pleadings & Motions' },
              { value: 'COURT_ORDERS', label: 'Court Orders & Resolutions' },
              { value: 'EVIDENCE_ANNEXES', label: 'Evidence & Annexes' },
              { value: 'CORRESPONDENCE_BILLING', label: 'Correspondence & Billing Notes' },
            ]}
          />

          <Input
            label="Document Title *"
            id="doc-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Formal Offer of Evidence"
          />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Document File (PDF, DOCX, JPG, PNG - Max 25MB)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="block w-full text-xs text-gray-700 border border-gray-300 rounded-[4px] file:mr-3 file:py-2 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-gray-100 hover:file:bg-gray-200"
            />
          </div>

          <Textarea
            label="Description / Filing Remarks"
            id="doc-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes or references..."
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Upload to Vault
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

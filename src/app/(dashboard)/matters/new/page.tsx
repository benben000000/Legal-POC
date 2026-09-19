'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

const createMatterSchema = z.object({
  caseTitle: z.string().min(3, 'Case title must be at least 3 characters'),
  docketNumber: z.string().optional(),
  courtBranch: z.string().min(3, 'Court branch is required'),
  clientName: z.string().min(3, 'Client name is required'),
  clientContact: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  status: z.enum(['ACTIVE', 'FOR_PLEADING', 'UNDER_SUBMISSION', 'PROMULGATED', 'ARCHIVED']),
});

export default function NewMatterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    caseTitle: '',
    docketNumber: '',
    courtBranch: '',
    clientName: '',
    clientContact: '',
    description: '',
    priority: 'NORMAL',
    status: 'ACTIVE',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      createMatterSchema.parse(formData);

      const res = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create matter');
      }

      const matter = await res.json();
      router.push(`/matters/${matter.id}`);
    } catch (err: any) {
      if (err.name === 'ZodError' || err instanceof z.ZodError) {
        const issues = err.issues || err.errors || [];
        setError(issues[0]?.message || 'Validation Error');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Create New Matter"
        description="Fill in the details to open a new case or matter."
      />

      <Card>
        <CardBody>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
               <div className="bg-red-50 border-l-4 border-red-600 p-4">
                 <p className="text-sm text-red-700">{error}</p>
               </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Case Title *"
                  id="caseTitle"
                  name="caseTitle"
                  required
                  value={formData.caseTitle}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Docket Number"
                id="docketNumber"
                name="docketNumber"
                value={formData.docketNumber}
                onChange={handleChange}
              />

              <Input
                label="Court Branch *"
                id="courtBranch"
                name="courtBranch"
                required
                value={formData.courtBranch}
                onChange={handleChange}
              />

              <Input
                label="Client Name *"
                id="clientName"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleChange}
              />

              <Input
                label="Client Contact"
                id="clientContact"
                name="clientContact"
                value={formData.clientContact}
                onChange={handleChange}
              />

              <Select
                label="Status"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'FOR_PLEADING', label: 'For Pleading' },
                  { value: 'UNDER_SUBMISSION', label: 'Under Submission' },
                  { value: 'PROMULGATED', label: 'Promulgated / Decided' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ]}
              />

              <Select
                label="Priority"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Description / Notes"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Create Matter
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

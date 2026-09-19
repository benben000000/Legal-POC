'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  matters: MatterOption[];
  defaultMatterId?: string;
  onSuccess?: () => void;
}

const BILLING_TYPES = [
  { value: 'APPEARANCE_FEE', label: 'Court Appearance Fee' },
  { value: 'DRAFTING_FEE', label: 'Pleading / Document Drafting Fee' },
  { value: 'ACCEPTANCE_RETAINER', label: 'Acceptance / Retainer Fee' },
  { value: 'COURT_FILING_FEE', label: 'Court Docket / Filing Fee (Disbursement)' },
  { value: 'NOTARIAL_FEE', label: 'Notarial Fee (Disbursement)' },
  { value: 'TRANSPORT_FEE', label: 'Transportation & Travel (Disbursement)' },
  { value: 'SHERIFF_FEE', label: "Sheriff's Fee / Service of Summons (Disbursement)" },
  { value: 'OTHER_DISBURSEMENT', label: 'Other Out-of-Pocket Disbursement' },
];

export function CreateEntryModal({
  isOpen,
  onClose,
  matters,
  defaultMatterId,
  onSuccess,
}: CreateEntryModalProps) {
  const [matterId, setMatterId] = useState(defaultMatterId || matters[0]?.id || '');
  const [billingType, setBillingType] = useState('APPEARANCE_FEE');
  const [description, setDescription] = useState('');
  const [datePerformed, setDatePerformed] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isTimeBased = billingType === 'DRAFTING_FEE' || billingType === 'APPEARANCE_FEE';

  const handleHoursRateChange = (newHours: string, newRate: string) => {
    setHours(newHours);
    setHourlyRate(newRate);
    const h = parseFloat(newHours);
    const r = parseFloat(newRate);
    if (!isNaN(h) && !isNaN(r) && h > 0 && r > 0) {
      setAmount((h * r).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!matterId) throw new Error('Please select a matter');
      if (!description) throw new Error('Description is required');
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        throw new Error('Valid amount is required');
      }

      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matterId,
          billingType,
          description,
          datePerformed,
          hours: hours ? parseFloat(hours) : undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          amount: numAmount,
          isBillable: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record billing entry');
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
        <ModalTitle>Record Legal Fee or Disbursement</ModalTitle>
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
            id="billing-matter"
            value={matterId}
            onChange={(e) => setMatterId(e.target.value)}
            options={matters.map((m) => ({ value: m.id, label: m.caseTitle }))}
          />

          <Select
            label="Fee / Disbursement Classification *"
            id="billing-type"
            value={billingType}
            onChange={(e) => setBillingType(e.target.value)}
            options={BILLING_TYPES}
          />

          <Input
            label="Description of Service / Expense *"
            id="billing-desc"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Attendance at Hearing for Preliminary Conference"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Date Performed *"
              id="billing-date"
              type="date"
              required
              value={datePerformed}
              onChange={(e) => setDatePerformed(e.target.value)}
            />

            <Input
              label="Total Amount (₱ PHP) *"
              id="billing-amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {isTimeBased && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-[4px] space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase">Optional Time Tracking (0.1-hr blocks)</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Hours Spent"
                  id="billing-hours"
                  type="number"
                  step="0.1"
                  min="0"
                  value={hours}
                  onChange={(e) => handleHoursRateChange(e.target.value, hourlyRate)}
                  placeholder="e.g. 1.5"
                />
                <Input
                  label="Hourly Rate (₱)"
                  id="billing-rate"
                  type="number"
                  step="100"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => handleHoursRateChange(hours, e.target.value)}
                  placeholder="e.g. 3000"
                />
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Record Entry
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

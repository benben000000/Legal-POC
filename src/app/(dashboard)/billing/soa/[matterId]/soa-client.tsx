'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';

interface SOAClientProps {
  matter: {
    id: string;
    caseTitle: string;
    docketNumber: string | null;
    courtBranch: string;
    clientName: string;
    clientAddress: string | null;
    clientEmail: string | null;
    clientPhone: string | null;
    billingEntries: Array<{
      id: string;
      title: string;
      description: string | null;
      billingType: string;
      amount: number;
      hours: number | null;
      hourlyRate: number | null;
      datePerformed: string;
    }>;
  };
}

export function SOAClient({ matter }: SOAClientProps) {
  const professionalFees = matter.billingEntries.filter(
    (e) => !e.billingType.includes('DISBURSEMENT') && !e.billingType.includes('FEE') || e.billingType === 'APPEARANCE_FEE' || e.billingType === 'DRAFTING_FEE' || e.billingType === 'ACCEPTANCE_RETAINER'
  );

  const disbursements = matter.billingEntries.filter(
    (e) => e.billingType.includes('DISBURSEMENT') || e.billingType === 'COURT_FILING_FEE' || e.billingType === 'NOTARIAL_FEE' || e.billingType === 'TRANSPORT_FEE' || e.billingType === 'SHERIFF_FEE' || e.billingType === 'OTHER_DISBURSEMENT'
  );

  const totalFees = professionalFees.reduce((sum, e) => sum + e.amount, 0);
  const totalDisbursements = disbursements.reduce((sum, e) => sum + e.amount, 0);
  const grandTotal = totalFees + totalDisbursements;

  const soaNumber = `SOA-${new Date().getFullYear()}-${matter.id.slice(-6).toUpperCase()}`;

  const formatPHP = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="space-y-6">
      {/* Action Bar (hidden on print) */}
      <div className="print:hidden flex items-center justify-between pb-4 border-b border-gray-200">
        <Link href={`/matters/${matter.id}`} className="text-sm font-medium text-blue-600 hover:underline">
          &larr; Back to Matter
        </Link>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Statement of Account Letterhead Document */}
      <div className="bg-white p-8 sm:p-12 border border-gray-200 rounded-[4px] shadow-sm max-w-4xl mx-auto print:border-0 print:p-0 print:shadow-none text-gray-900 font-sans">
        {/* Law Firm Header */}
        <div className="text-center pb-6 border-b-2 border-gray-900">
          <h1 className="text-2xl font-bold tracking-tight uppercase text-gray-900">
            Law Offices of Benedict Garcia
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Litigation, Corporate Advisory & Appellate Practice
          </p>
          <p className="text-xs text-gray-500">
            Metro Manila, Philippines | Contact: info@legal-suite.com
          </p>
        </div>

        {/* Statement Title & Meta */}
        <div className="mt-8 flex justify-between items-start text-sm">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Billed To:</span>
            <p className="font-bold text-base text-gray-900 mt-1">{matter.clientName}</p>
            {matter.clientAddress && <p className="text-gray-600 text-xs">{matter.clientAddress}</p>}
            {matter.clientEmail && <p className="text-gray-600 text-xs">{matter.clientEmail}</p>}
            {matter.clientPhone && <p className="text-gray-600 text-xs">{matter.clientPhone}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase tracking-wider text-blue-900">
              Statement of Account
            </h2>
            <p className="font-mono text-xs text-gray-500 mt-1">No: {soaNumber}</p>
            <p className="text-xs text-gray-500">Date: {format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
        </div>

        {/* Case Matter Details */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-[2px] text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold text-gray-700">Case Matter:</span>{' '}
              <span className="text-gray-900">{matter.caseTitle}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Docket Number:</span>{' '}
              <span className="text-gray-900">{matter.docketNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Court / Tribunal:</span>{' '}
              <span className="text-gray-900">{matter.courtBranch}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Billing Period:</span>{' '}
              <span className="text-gray-900">Through {format(new Date(), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Itemized Table of Professional Fees */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 pb-1">
            I. Professional Legal Services
          </h3>
          <table className="w-full mt-2 text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 font-semibold">
                <th className="py-2">Date</th>
                <th className="py-2">Description of Legal Service</th>
                <th className="py-2">Hours</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {professionalFees.length > 0 ? (
                professionalFees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="py-2 font-mono text-gray-600">
                      {format(new Date(fee.datePerformed), 'MMM d, yyyy')}
                    </td>
                    <td className="py-2 text-gray-900">
                      {fee.description}
                      <span className="text-[10px] text-gray-500 block">
                        ({fee.billingType.replace(/_/g, ' ')})
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">
                      {fee.hours ? `${fee.hours} hrs @ ${fee.hourlyRate ? formatPHP(fee.hourlyRate) : ''}` : '-'}
                    </td>
                    <td className="py-2 text-right font-mono font-medium text-gray-900">
                      {formatPHP(fee.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-gray-400 italic">
                    No unbilled professional fees recorded.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-300 font-bold">
                <td colSpan={3} className="pt-2 text-right text-gray-700">Subtotal Professional Fees:</td>
                <td className="pt-2 text-right font-mono text-gray-900">{formatPHP(totalFees)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Itemized Table of Advanced Disbursements */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 pb-1">
            II. Out-of-Pocket Disbursements & Expenses
          </h3>
          <table className="w-full mt-2 text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 font-semibold">
                <th className="py-2">Date</th>
                <th className="py-2">Expense / Disbursement Description</th>
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {disbursements.length > 0 ? (
                disbursements.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2 font-mono text-gray-600">
                      {format(new Date(d.datePerformed), 'MMM d, yyyy')}
                    </td>
                    <td className="py-2 text-gray-900">{d.description}</td>
                    <td className="py-2 text-gray-600 text-[11px]">{d.billingType.replace(/_/g, ' ')}</td>
                    <td className="py-2 text-right font-mono font-medium text-gray-900">
                      {formatPHP(d.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-gray-400 italic">
                    No unbilled out-of-pocket disbursements recorded.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-300 font-bold">
                <td colSpan={3} className="pt-2 text-right text-gray-700">Subtotal Advanced Disbursements:</td>
                <td className="pt-2 text-right font-mono text-gray-900">{formatPHP(totalDisbursements)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Grand Total Summary Box */}
        <div className="mt-8 pt-4 border-t-2 border-gray-900 flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Legal Fees:</span>
              <span className="font-mono">{formatPHP(totalFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Disbursements:</span>
              <span className="font-mono">{formatPHP(totalDisbursements)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-bold text-gray-900">
              <span>TOTAL AMOUNT DUE:</span>
              <span className="font-mono text-blue-900">{formatPHP(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Remittance Details */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800">Settlement Instructions:</p>
          <p>Please make check payments payable to: <span className="font-medium text-gray-800">Benedict Garcia Law Offices</span>.</p>
          <p>For electronic bank transfers: <span className="font-medium text-gray-800">Bank of the Philippine Islands (BPI)</span> | Acct: 1234-5678-90.</p>
          <p className="italic text-[11px] text-gray-500 pt-2">
            This is an official Statement of Account generated under LegalSuite Core practice management.
          </p>
        </div>
      </div>
    </div>
  );
}

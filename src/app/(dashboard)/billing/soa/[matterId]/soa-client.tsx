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
    <div className="space-y-6 print:space-y-0 print:m-0 print:p-0">
      {/* Action Bar (strictly hidden on print) */}
      <div className="print:hidden flex items-center justify-between pb-4 border-b border-gray-200">
        <Link href={`/matters/${matter.id}`} className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1.5">
          <span>&larr;</span> Return to Case Matter
        </Link>
        <div className="flex items-center gap-3">
          <Button onClick={() => window.print()} className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Statement of Account (PDF)
          </Button>
        </div>
      </div>

      {/* Printable Statement of Account Letterhead Document */}
      <div className="printable-soa bg-white p-8 sm:p-12 border border-gray-200 rounded-[4px] shadow-none max-w-4xl mx-auto print:border-0 print:p-0 print:m-0 print:max-w-none print:w-full print:shadow-none text-gray-900 font-sans">
        {/* Law Firm Header */}
        <div className="text-center pb-5 border-b-2 border-gray-900">
          <h1 className="text-2xl font-bold tracking-tight uppercase text-gray-900">
            Garcia Law Offices
          </h1>
          <p className="text-xs font-semibold text-gray-700 mt-1 uppercase tracking-wider">
            Makati & Pasig Chambers • Republic of the Philippines
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            28th Floor, Ayala Tower One, Ayala Triangle, Makati City | Tel: (02) 8888-0100 | TIN: 245-891-320-000
          </p>
        </div>

        {/* Statement Title & Meta */}
        <div className="mt-8 flex justify-between items-start text-sm print-avoid-break">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Billed To:</span>
            <p className="font-bold text-base text-gray-900 mt-1">{matter.clientName}</p>
            {matter.clientAddress && <p className="text-gray-600 text-xs">{matter.clientAddress}</p>}
            {matter.clientEmail && <p className="text-gray-600 text-xs">{matter.clientEmail}</p>}
            {matter.clientPhone && <p className="text-gray-600 text-xs">{matter.clientPhone}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900">
              Statement of Account
            </h2>
            <p className="font-mono text-xs text-gray-600 mt-1">No: {soaNumber}</p>
            <p className="text-xs text-gray-600">Date: {format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
        </div>

        {/* Case Matter Details */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-[2px] text-xs print:bg-gray-50/50 print-avoid-break">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold text-gray-700">Case Matter:</span>{' '}
              <span className="text-gray-900 font-medium">{matter.caseTitle}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Docket Number:</span>{' '}
              <span className="text-gray-900 font-medium">{matter.docketNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Court / Tribunal:</span>{' '}
              <span className="text-gray-900 font-medium">{matter.courtBranch}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Billing Period:</span>{' '}
              <span className="text-gray-900 font-medium">Through {format(new Date(), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Itemized Table of Professional Fees */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1">
            I. Professional Legal Services
          </h3>
          <table className="w-full mt-2 text-xs">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-600 font-semibold">
                <th className="py-2">Date</th>
                <th className="py-2">Description of Legal Service</th>
                <th className="py-2">Hours</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {professionalFees.length > 0 ? (
                professionalFees.map((fee) => (
                  <tr key={fee.id} className="print-avoid-break">
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
              <tr className="border-t-2 border-gray-400 font-bold print-avoid-break">
                <td colSpan={3} className="pt-2 text-right text-gray-700">Subtotal Professional Fees:</td>
                <td className="pt-2 text-right font-mono text-gray-900">{formatPHP(totalFees)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Itemized Table of Advanced Disbursements */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1">
            II. Out-of-Pocket Disbursements & Expenses
          </h3>
          <table className="w-full mt-2 text-xs">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-600 font-semibold">
                <th className="py-2">Date</th>
                <th className="py-2">Expense / Disbursement Description</th>
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {disbursements.length > 0 ? (
                disbursements.map((d) => (
                  <tr key={d.id} className="print-avoid-break">
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
              <tr className="border-t-2 border-gray-400 font-bold print-avoid-break">
                <td colSpan={3} className="pt-2 text-right text-gray-700">Subtotal Advanced Disbursements:</td>
                <td className="pt-2 text-right font-mono text-gray-900">{formatPHP(totalDisbursements)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Grand Total Summary Box */}
        <div className="mt-8 pt-4 border-t-2 border-gray-900 flex justify-end print-avoid-break">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Professional Fees:</span>
              <span className="font-mono">{formatPHP(totalFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Disbursements:</span>
              <span className="font-mono">{formatPHP(totalDisbursements)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-bold text-gray-900">
              <span>TOTAL AMOUNT DUE:</span>
              <span className="font-mono text-gray-900">{formatPHP(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Remittance Details */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600 space-y-1 print-avoid-break">
          <p className="font-semibold text-gray-900">Settlement Instructions:</p>
          <p>Please make check payments payable to: <strong className="text-gray-900">Garcia Law Offices</strong>.</p>
          <p>Electronic Bank Transfer: <strong className="text-gray-900">Bank of the Philippine Islands (BPI)</strong> | Current Account: <span className="font-mono font-semibold text-gray-900">1234-5678-90</span></p>
          <p className="text-[11px] text-gray-500">Please send proof of remittance to <span className="underline">billing@garcialaw.ph</span> for immediate official receipt issuance.</p>
        </div>

        {/* Official Certification & Signatures */}
        <div className="mt-10 pt-6 border-t border-gray-300 print-avoid-break">
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Prepared By:</p>
              <div className="mt-8 border-t border-gray-400 pt-1 w-48">
                <p className="font-semibold text-gray-900">Billing & Accounting Dept.</p>
                <p className="text-gray-500 text-[11px]">Garcia Law Offices</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Certified Correct & Approved:</p>
              <div className="mt-8 border-t border-gray-400 pt-1 w-56 ml-auto">
                <p className="font-bold text-gray-900">ATTY. BENEDICT GARCIA</p>
                <p className="text-gray-600 text-[11px]">Managing Partner • Roll No. 48912</p>
                <p className="text-gray-500 text-[10px]">IBP Lifetime No. 01842 • MCLE Compliance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

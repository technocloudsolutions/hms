import React from 'react';

interface InvoiceSignaturesProps {
  guestName: string;
  ownerName: string;
}

const InvoiceSignatures = ({ guestName, ownerName }: InvoiceSignaturesProps) => (
  <section className="mt-8 flex flex-col gap-8 w-full max-w-2xl" aria-label="Signatures Section">
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-sm text-gray-700" htmlFor="guest-signature">Guest Signature</label>
      <div className="border-b-2 border-gray-400 h-10 w-64" tabIndex={0} aria-label="Guest Signature Line" />
      <span className="text-xs text-gray-500 mt-1">{guestName}</span>
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-sm text-gray-700" htmlFor="owner-signature">Owner Signature</label>
      <div className="border-b-2 border-gray-400 h-10 w-64" tabIndex={0} aria-label="Owner Signature Line" />
      <span className="text-xs text-gray-500 mt-1">{ownerName}</span>
    </div>
  </section>
);

export default InvoiceSignatures; 
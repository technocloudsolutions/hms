import * as React from "react";

interface InvoiceSignaturesProps {
  guestName: string;
  ownerName: string;
}

const InvoiceSignatures = ({ guestName, ownerName }: InvoiceSignaturesProps) => (
  <section className="grid grid-cols-2 gap-6 w-full" aria-label="Signatures Section">
    <div className="flex flex-col gap-1">
      <div className="border-b-2 border-gray-400 h-8 w-full" tabIndex={0} aria-label="Guest Signature Line" />
      <span className="text-xs text-gray-500 mt-1">{guestName}</span>
    </div>
    <div className="flex flex-col gap-1">
      <div className="border-b-2 border-gray-400 h-8 w-full" tabIndex={0} aria-label="Owner Signature Line" />
      <span className="text-xs text-gray-500 mt-1">{ownerName}</span>
    </div>
  </section>
);

export default InvoiceSignatures; 
import React from 'react';

export type GuestInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

interface InvoiceBillToProps {
  guest: GuestInfo;
}

const InvoiceBillTo = ({ guest }: InvoiceBillToProps) => {
  // Format address to ensure proper line breaks
  const formattedAddress = guest.address?.replace(/,/g, '\n').replace(/\s*\n\s*/g, '\n') || '';

  return (
    <section
      className="p-4 rounded-md w-full"
      aria-label="Billing Information"
    >
      <h2 className="text-base font-bold text-primary border-b border-gray-200 pb-1 mb-2">Bill To</h2>
      <div className="space-y-1">
        <div className="font-semibold text-sm">{guest.name}</div>
        <div className="text-xs">{guest.email}</div>
        <div className="text-xs">{guest.phone}</div>
        <div className="text-xs text-muted-foreground whitespace-pre-line">{formattedAddress}</div>
      </div>
    </section>
  );
};

export default InvoiceBillTo; 
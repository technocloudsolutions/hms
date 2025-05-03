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

const InvoiceBillTo = ({ guest }: InvoiceBillToProps) => (
  <section
    className="bg-gray-800 p-4 rounded-md text-white w-full max-w-sm"
    aria-label="Billing Information"
  >
    <h2 className="text-lg font-bold text-amber-600 border-b border-gray-700 pb-1 mb-2">Bill To</h2>
    <div className="space-y-1">
      <div className="font-semibold text-base">{guest.name}</div>
      <div className="text-sm">{guest.email}</div>
      <div className="text-sm text-blue-300">{guest.phone}</div>
      <div className="text-sm text-gray-300">{guest.address}</div>
    </div>
  </section>
);

export default InvoiceBillTo; 
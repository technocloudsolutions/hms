import React from 'react';
import type { Invoice, Guest, Room } from '@/lib/types';
import InvoiceBillTo, { GuestInfo } from "@/components/InvoiceBillTo";
import InvoiceSignatures from "./InvoiceSignatures";
import Image from 'next/image';

interface InvoiceImplLiveProps {
  invoice: Invoice;
  guest: Guest;
  room: Record<string, any>;
  onSaveInvoice?: (updatedInvoice: Partial<Invoice>) => void;
}

/**
 * This component acts as an adapter between the application's data model and our Invoice UI components
 */
const InvoiceImplLive: React.FC<InvoiceImplLiveProps> = ({ invoice, guest, room }) => {
  // Convert app data model to our component's expected format
  const guestInfo: GuestInfo = {
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    address: guest.address || "No address provided"
  };

  // Format dates
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="print-container bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 text-black dark:text-white border border-gray-200 max-w-[210mm] w-full mx-auto">
      {/* Invoice Header with Logo */}
      <div className="print-header flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div className="flex flex-col items-start">
          <div className="flex flex-row items-start gap-4">
            <div className="print-logo">
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28">
                  <Image 
                    src="/logo.webp" 
                    alt="Rajini by The Waters Logo" 
                    width={130} 
                    height={130}
                    className="object-contain" 
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'%3E%3C/path%3E%3Cpolyline points='9 22 9 12 15 12 15 22'%3E%3C/polyline%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <h1 className="text-base font-bold text-center mt-1">Rajini by The Waters</h1>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground dark:text-gray-300 ml-2 leading-tight max-w-[220px] pt-2">
              <p>437 Beralihela, Colony 5</p>
              <p>82600 Tissamaharama</p>
              <p>Sri Lanka</p>
              <p>+94 76 281 0000</p>
              <p>info@rajinihotels.com</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="print-invoice-title text-3xl font-bold mb-1 text-primary">INVOICE</div>
          <div className="print-invoice-number text-muted-foreground dark:text-gray-300">#{invoice.invoiceNumber || invoice.id}</div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              invoice.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
              invoice.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
              invoice.status === 'Issued' ? 'bg-blue-500/10 text-blue-500' :
              invoice.status === 'Draft' ? 'bg-gray-500/10 text-gray-500' :
              'bg-yellow-500/10 text-yellow-500'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>
      
      {/* Rest of invoice content */}
    </div>
  );
};

export default InvoiceImplLive; 
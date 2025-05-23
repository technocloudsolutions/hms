import React from 'react';
import type { Invoice, Guest, Room } from '@/lib/types';
import InvoiceBillTo, { GuestInfo } from "./InvoiceBillTo";
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

      {/* Invoice Details */}
      <div className="print-details grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 dark:bg-gray-700/20 p-4 rounded-md">
        {/* Bill To Section */}
        <div className="print-section">
          <div className="print-section-title font-semibold text-primary border-b pb-1 mb-2">Bill To</div>
          <div className="mt-2 space-y-1">
            <div className="font-medium">{guest.name}</div>
            <div className="text-sm">{guest.email}</div>
            <div className="text-sm">{guest.phone}</div>
            <div className="text-xs text-muted-foreground dark:text-gray-300 whitespace-pre-line">{guest.address}</div>
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="print-section">
          <div className="print-section-title font-semibold text-primary border-b pb-1 mb-2">Invoice Details</div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground dark:text-gray-300 text-sm">Issue Date:</span>
              <span className="font-medium text-sm">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground dark:text-gray-300 text-sm">Due Date:</span>
              <span className="font-medium text-sm">{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground dark:text-gray-300 text-sm">Currency:</span>
              <span className="font-medium text-sm">{invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="print-section">
          <div className="print-section-title font-semibold text-primary border-b pb-1 mb-2">Payment Information</div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground dark:text-gray-300 text-sm">Payment Status:</span>
              <span className="font-medium text-sm">{invoice.status === 'Paid' ? 'Paid' : 'Pending'}</span>
            </div>
            {invoice.status === 'Paid' && invoice.paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground dark:text-gray-300 text-sm">Payment Method:</span>
                <span className="font-medium text-sm">{invoice.paymentMethod}</span>
              </div>
            )}
            {invoice.status === 'Paid' && invoice.paymentDate && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground dark:text-gray-300 text-sm">Payment Date:</span>
                <span className="font-medium text-sm">{formatDate(invoice.paymentDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="print-items mb-6">
        <div className="print-section-title font-semibold text-primary border-b pb-1 mb-3">Invoice Items</div>
        <table className="print-table w-full dark:border-gray-700 border rounded-md overflow-hidden text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 bg-gray-50 dark:bg-gray-700">Description</th>
              <th className="text-left py-2 px-3 bg-gray-50 dark:bg-gray-700">Type</th>
              <th className="text-right py-2 px-3 bg-gray-50 dark:bg-gray-700">Quantity</th>
              <th className="text-right py-2 px-3 bg-gray-50 dark:bg-gray-700">Unit Price</th>
              <th className="text-right py-2 px-3 bg-gray-50 dark:bg-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={`${index % 2 === 1 ? 'bg-gray-50' : ''} dark:border-gray-700`}>
                <td className="py-2 px-3 dark:border-gray-700">{item.description}</td>
                <td className="py-2 px-3 dark:border-gray-700">{item.type}</td>
                <td className="text-right py-2 px-3 dark:border-gray-700">{item.quantity}</td>
                <td className="text-right py-2 px-3 dark:border-gray-700">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: invoice.currency,
                    minimumFractionDigits: 2,
                  }).format(item.unitPrice || 0)}
                </td>
                <td className="text-right py-2 px-3 dark:border-gray-700 font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: invoice.currency,
                    minimumFractionDigits: 2,
                  }).format(item.amount || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="print-totals ml-auto w-full md:w-1/2 space-y-1.5 text-sm">
        <div className="print-total-row flex justify-between border-b pb-1.5">
          <span className="text-muted-foreground dark:text-gray-300">Subtotal:</span>
          <span className="font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: invoice.currency,
              minimumFractionDigits: 2,
            }).format(invoice.subtotal || 0)}
          </span>
        </div>
        <div className="print-total-row flex justify-between border-b pb-1.5 pt-1.5">
          <span className="text-muted-foreground dark:text-gray-300">Tax ({invoice.taxRate}%):</span>
          <span className="font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: invoice.currency,
              minimumFractionDigits: 2,
            }).format(invoice.taxAmount || 0)}
          </span>
        </div>
        {invoice.discountAmount > 0 && (
          <div className="print-total-row flex justify-between border-b pb-1.5 pt-1.5">
            <span className="text-muted-foreground dark:text-gray-300">Discount:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              -{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: invoice.currency,
                minimumFractionDigits: 2,
              }).format(invoice.discountAmount || 0)}
            </span>
          </div>
        )}
        <div className="print-total-row print-grand-total flex justify-between border-t border-b-2 border-gray-300 py-2 my-1.5">
          <span className="font-bold text-gray-900 dark:text-white">Total:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: invoice.currency,
              minimumFractionDigits: 2,
            }).format(invoice.totalAmount || 0)}
          </span>
        </div>
        
        {/* Only show advance payment when invoice is not fully paid */}
        {(invoice.advancePayment || 0) > 0 && invoice.status !== 'Paid' && (
          <div className="print-total-row print-advance-payment flex justify-between pt-1.5 pb-1.5">
            <span className="text-muted-foreground dark:text-gray-300">Advance Payment:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              -{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: invoice.currency,
                minimumFractionDigits: 2,
              }).format(invoice.advancePayment || 0)}
            </span>
          </div>
        )}
        
        {/* Only show remaining balance when invoice is not fully paid */}
        {(invoice.remainingBalance || 0) > 0 && invoice.status !== 'Paid' && (
          <div className="print-total-row print-remaining-balance flex justify-between border-t border-gray-300 pt-1.5">
            <span className="font-bold text-gray-900 dark:text-white">Remaining Balance:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: invoice.currency,
                minimumFractionDigits: 2,
              }).format(invoice.remainingBalance || 0)}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="print-notes bg-muted/50 dark:bg-gray-700/50 p-3 rounded-md mt-6 text-sm">
          <div className="print-notes-title font-medium">Notes</div>
          <p className="text-muted-foreground dark:text-gray-300">{invoice.notes}</p>
        </div>
      )}

      {/* Signature Component */}
      <div className="print-signatures mt-8 mb-4">
        <InvoiceSignatures 
          guestName={guest.name} 
          ownerName="Rajini by The Waters" 
        />
      </div>
      
      {/* Add print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-header {
            margin-bottom: 15px !important;
            padding-bottom: 10px !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceImplLive; 
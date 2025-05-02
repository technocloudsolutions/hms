'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getInvoiceById, getExchangeRate } from '@/lib/firebase';
import { Invoice, Guest, Room } from '@/lib/types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ArrowLeft, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Head from 'next/head';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertedCurrency, setConvertedCurrency] = useState<'USD' | 'LKR' | null>(null);
  const [convertedRate, setConvertedRate] = useState<number>(1);
  const [convertedTotal, setConvertedTotal] = useState<number>(0);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const id = params.id as string;
        const invoiceData = await getInvoiceById(id);
        
        if (!invoiceData) {
          toast({
            title: 'Error',
            description: 'Invoice not found',
            variant: 'destructive',
          });
          router.push('/dashboard/invoices');
          return;
        }
        
        setInvoice(invoiceData);
        
        // In a real app, you would fetch the guest and room data here
        // For now, we'll just set placeholders
        setGuest({
          id: invoiceData.guestId,
          name: 'Guest Name',
          email: 'guest@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, Country',
          idType: 'Passport',
          idNumber: 'AB123456',
          createdAt: invoiceData.createdAt,
          updatedAt: invoiceData.updatedAt,
        });
        
        setRoom({
          id: 'room-id',
          number: '101',
          type: 'Deluxe',
          price: 150,
          status: 'Occupied',
          amenities: ['WiFi', 'TV', 'AC'],
          description: 'Deluxe room with ocean view',
          images: [],
          floor: 1,
          capacity: 2,
          size: 30,
          view: 'Ocean',
          bedType: 'King',
          lastCleaned: invoiceData.createdAt,
          lastMaintenance: invoiceData.createdAt,
          rating: 4.5,
          reviews: 10,
          specialOffers: [],
          accessibility: true,
          smoking: false,
        });
        
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoice details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [params.id, router, toast]);

  const handleCurrencyConversion = async () => {
    if (!invoice) return;
    
    try {
      const targetCurrency = invoice.currency === 'USD' ? 'LKR' : 'USD';
      const rate = await getExchangeRate(invoice.currency, targetCurrency);
      
      setConvertedCurrency(targetCurrency as 'USD' | 'LKR');
      setConvertedRate(rate);
      setConvertedTotal(invoice.totalAmount * rate);
      
      toast({
        title: 'Currency Converted',
        description: `Showing equivalent in ${targetCurrency}`,
      });
    } catch (error) {
      console.error('Error converting currency:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert currency',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date in a more readable format
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      // Show loading toast
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we generate your invoice PDF...',
      });

      // Get the print-invoice element
      const element = document.getElementById('print-invoice');
      if (!element) {
        throw new Error('Could not find invoice element');
      }

      // Make the element visible temporarily for capturing
      const originalDisplay = element.style.display;
      element.style.display = 'block';

      // Apply direct styles to ensure text is dark and visible
      const applyDarkTextStyles = (element: HTMLElement) => {
        element.style.color = '#000000';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.textShadow = 'none';
        element.style.backgroundColor = '#ffffff';
        
        if (element.classList.contains('text-muted-foreground')) {
          element.style.color = '#333333';
        }
        
        if (element.tagName === 'TABLE') {
          element.style.borderCollapse = 'collapse';
          element.style.border = '1px solid #ddd';
        }
        
        if (element.tagName === 'TH' || element.tagName === 'TD') {
          element.style.padding = '8px';
          element.style.border = '1px solid #ddd';
          element.style.color = '#000000';
        }
        
        if (element.tagName === 'TH') {
          element.style.fontWeight = 'bold';
          element.style.backgroundColor = '#f2f2f2';
          element.style.color = '#000000';
        }
        
        // Ensure images are visible
        if (element.tagName === 'IMG') {
          element.style.maxWidth = '100%';
          element.style.height = 'auto';
          element.style.display = 'block';
        }
        
        Array.from(element.children).forEach(child => {
          applyDarkTextStyles(child as HTMLElement);
        });
      };
      
      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '800px'; // Fixed width for better rendering
      clone.style.padding = '40px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.borderRadius = '0'; // Remove any border radius for PDF
      clone.style.boxShadow = 'none'; // Remove any box shadows
      clone.style.border = '2px solid #e5e7eb'; // Add a decorative border
      
      // Apply styles to ensure text is visible
      applyDarkTextStyles(clone);
      
      // Temporarily append the clone to the document
      document.body.appendChild(clone);

      // Make sure images are loaded before taking screenshot
      const loadImage = (image: HTMLImageElement): Promise<void> => {
        return new Promise((resolve) => {
          if (image.complete) {
            resolve();
          } else {
            image.onload = () => resolve();
            image.onerror = () => resolve(); // Continue even if image fails
          }
        });
      };

      // Wait for all images to load
      const images = Array.from(clone.getElementsByTagName('img'));
      await Promise.all(images.map(img => loadImage(img)));

      // Use html2canvas with improved settings for better text quality
      const canvas = await html2canvas(clone, {
        scale: 4, // Higher scale for better text quality (increased from 3)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 15000, // Longer timeout for image loading
        removeContainer: false
      });
      
      // Remove the clone from the document
      document.body.removeChild(clone);

      // Hide the element again
      element.style.display = originalDisplay;

      // Create PDF with proper dimensions (A4)
      const imgData = canvas.toDataURL('image/png', 1.0); // Use maximum quality
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false, // Disable compression for better quality
        hotfixes: ['px_scaling']
      });

      // Calculate dimensions to fit the image properly on the page
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the invoice image
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      // Add footer text with page number
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Rajini by The Waters - Invoice ${invoice.invoiceNumber} - Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
      
      // Save the PDF
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);

      // Show success toast
      toast({
        title: 'PDF Downloaded',
        description: 'Your invoice has been downloaded successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error generating the PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
            <Button onClick={() => router.push('/dashboard/invoices')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <style type="text/css" media="print">{`
          /* Print styles omitted for brevity */
        `}</style>
      </Head>
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/dashboard/invoices')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
              <Badge className={
                invoice.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                invoice.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                invoice.status === 'Issued' ? 'bg-blue-500/10 text-blue-500' :
                invoice.status === 'Draft' ? 'bg-gray-500/10 text-gray-500' :
                'bg-yellow-500/10 text-yellow-500'
              }>
                {invoice.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCurrencyConversion}>
                Show in {invoice.currency === 'USD' ? 'LKR' : 'USD'}
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Printable Invoice */}
          <div id="print-invoice" className="print-container bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 text-black dark:text-white border border-gray-200">
            {/* Invoice Header */}
            <div className="print-header flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
              <div>
                <div className="print-logo mb-3">
                  <Image 
                    src="/logo.png" 
                    alt="Rajini by The Waters" 
                    width={180} 
                    height={60}
                    className="mb-2"
                    priority
                    unoptimized
                  />
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-300">
                  <p>437 Beralihela, Colony 5</p>
                  <p>82600 Tissamaharama <br />
                  Sri Lanka</p>
                  <p>+94 76 281 0000</p>
                  <p>info@rajinihotels.com</p>
                </div>
              </div>
              <div className="text-right">
                <div className="print-invoice-title text-3xl font-bold mb-1 text-primary">INVOICE</div>
                <div className="print-invoice-number text-muted-foreground dark:text-gray-300">#{invoice.invoiceNumber}</div>
                <div className="mt-4">
                  <Badge className={
                    invoice.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                    invoice.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                    invoice.status === 'Issued' ? 'bg-blue-500/10 text-blue-500' :
                    invoice.status === 'Draft' ? 'bg-gray-500/10 text-gray-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  } style={{ fontWeight: 'bold' }}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="print-details grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50 dark:bg-gray-700/20 p-4 rounded-md">
              <div className="print-section">
                <div className="print-section-title font-semibold text-primary border-b pb-1 mb-2">Bill To</div>
                {guest && (
                  <div className="mt-2 space-y-1">
                    <div className="font-medium">{guest.name}</div>
                    <div>{guest.email}</div>
                    <div>{guest.phone}</div>
                    <div className="text-sm text-muted-foreground dark:text-gray-300">{guest.address}</div>
                  </div>
                )}
              </div>

              <div className="print-section">
                <div className="print-section-title font-semibold text-primary border-b pb-1 mb-2">Invoice Details</div>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground dark:text-gray-300">Issue Date:</span>
                    <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground dark:text-gray-300">Due Date:</span>
                    <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground dark:text-gray-300">Currency:</span>
                    <span className="font-medium">{invoice.currency}</span>
                  </div>
                </div>
              </div>

              <div className="print-section">
                <div className="print-section-title font-semibold text-primary border-b pb-1 mb-2">Payment Information</div>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground dark:text-gray-300">Payment Status:</span>
                    <span className="font-medium">{invoice.status === 'Paid' ? 'Paid' : 'Pending'}</span>
                  </div>
                  {invoice.status === 'Paid' && invoice.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground dark:text-gray-300">Payment Method:</span>
                      <span className="font-medium">{invoice.paymentMethod}</span>
                    </div>
                  )}
                  {invoice.status === 'Paid' && invoice.paymentDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground dark:text-gray-300">Payment Date:</span>
                      <span className="font-medium">{formatDate(invoice.paymentDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="print-section mb-8">
              <div className="print-section-title font-semibold text-primary border-b pb-1 mb-4">Invoice Items</div>
              <table className="print-table w-full dark:border-gray-700 border rounded-md overflow-hidden">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 bg-gray-50 dark:bg-gray-700">Description</th>
                    <th className="text-left py-3 px-4 bg-gray-50 dark:bg-gray-700">Type</th>
                    <th className="text-right py-3 px-4 bg-gray-50 dark:bg-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 bg-gray-50 dark:bg-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-4 bg-gray-50 dark:bg-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 1 ? 'bg-gray-50' : ''} dark:border-gray-700`}>
                      <td className="py-3 px-4 dark:border-gray-700">{item.description}</td>
                      <td className="py-3 px-4 dark:border-gray-700">{item.type}</td>
                      <td className="text-right py-3 px-4 dark:border-gray-700">{item.quantity}</td>
                      <td className="text-right py-3 px-4 dark:border-gray-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                      <td className="text-right py-3 px-4 dark:border-gray-700 font-medium">{formatCurrency(item.amount, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="print-totals ml-auto w-full md:w-1/2 lg:w-2/5 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-800/20 p-4">
              <div className="print-total-row border-b pb-2">
                <span className="text-muted-foreground dark:text-gray-300">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="print-total-row border-b pb-2 pt-2">
                <span className="text-muted-foreground dark:text-gray-300">Tax ({invoice.taxRate}%):</span>
                <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="print-total-row border-b pb-2 pt-2">
                  <span className="text-muted-foreground dark:text-gray-300">Discount:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="print-total-row print-grand-total border-t border-b-2 border-gray-300 py-3 my-2">
                <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
              </div>
              
              {(invoice.advancePayment || 0) > 0 && (
                <div className="print-total-row print-advance-payment pt-2 pb-2">
                  <span className="text-muted-foreground dark:text-gray-300">Advance Payment:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">-{formatCurrency(invoice.advancePayment || 0, invoice.currency)}</span>
                </div>
              )}
              
              {(invoice.advancePayment || 0) > 0 && (
                <div className="print-total-row print-remaining-balance border-t border-gray-300 pt-2">
                  <span className="font-bold text-gray-900 dark:text-white">Remaining Balance:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.remainingBalance || 0, invoice.currency)}</span>
                </div>
              )}
              
              {convertedCurrency && (
                <div className="print-total-row text-sm text-muted-foreground dark:text-gray-300 border-t border-dashed border-gray-200 mt-3 pt-3">
                  <span>Equivalent in {convertedCurrency}:</span>
                  <span>{formatCurrency(convertedTotal, convertedCurrency)}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="print-notes bg-muted/50 dark:bg-gray-700/50 p-4 rounded-md mt-8">
                <div className="print-notes-title font-medium">Notes</div>
                <p className="text-muted-foreground dark:text-gray-300">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="print-footer mt-12 pt-6 border-t text-center text-sm text-muted-foreground dark:text-gray-300 relative">
              <div className="absolute top-[-2px] left-0 h-[3px] w-1/2 bg-gradient-to-r from-primary to-transparent"></div>
              <p>Thank you for your business!</p>
              <p className="mt-1">For any inquiries regarding this invoice, please contact our finance department at finance@rajinihotels.com</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
} 
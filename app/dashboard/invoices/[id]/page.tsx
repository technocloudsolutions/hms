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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
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
        
        if (element.classList.contains('text-muted-foreground')) {
          element.style.color = '#333333';
        }
        
        if (element.tagName === 'TABLE') {
          element.style.borderCollapse = 'collapse';
        }
        
        if (element.tagName === 'TH' || element.tagName === 'TD') {
          element.style.padding = '8px';
          element.style.border = '1px solid #ddd';
        }
        
        if (element.tagName === 'TH') {
          element.style.fontWeight = 'bold';
          element.style.backgroundColor = '#f2f2f2';
        }
        
        Array.from(element.children).forEach(child => {
          applyDarkTextStyles(child as HTMLElement);
        });
      };
      
      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '800px'; // Fixed width for better rendering
      clone.style.padding = '20px';
      clone.style.backgroundColor = '#ffffff';
      
      // Apply styles to ensure text is visible
      applyDarkTextStyles(clone);
      
      // Temporarily append the clone to the document
      document.body.appendChild(clone);

      // Use html2canvas with improved settings for better text quality
      const canvas = await html2canvas(clone, {
        scale: 3, // Higher scale for better text quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
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
        compress: false // Disable compression for better quality
      });

      // Calculate dimensions to fit the image properly on the page
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
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
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          /* These print styles are kept for PDF generation purposes */
          /* They help style the cloned element that's used for PDF creation */
          @media print {
            body {
              font-family: 'Arial', sans-serif;
              color: #333;
              background: white;
            }
            
            /* Hide non-printable elements */
            header, nav, footer, .no-print, button {
              display: none !important;
            }
            
            /* Show the invoice container at full width */
            .print-container {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            
            /* Invoice header styling */
            .print-header {
              display: flex !important;
              justify-content: space-between !important;
              margin-bottom: 2rem !important;
              border-bottom: 2px solid #f0f0f0 !important;
              padding-bottom: 1rem !important;
            }
            
            .print-logo {
              font-size: 1.5rem !important;
              font-weight: bold !important;
              color: #2563eb !important;
            }
            
            .print-invoice-title {
              font-size: 2rem !important;
              font-weight: bold !important;
              color: #333 !important;
              margin-bottom: 0.5rem !important;
            }
            
            .print-invoice-number {
              font-size: 1rem !important;
              color: #666 !important;
            }
            
            /* Invoice details styling */
            .print-details {
              display: grid !important;
              grid-template-columns: 1fr 1fr 1fr !important;
              gap: 2rem !important;
              margin-bottom: 2rem !important;
            }
            
            .print-section {
              margin-bottom: 1.5rem !important;
            }
            
            .print-section-title {
              font-size: 1.1rem !important;
              font-weight: bold !important;
              margin-bottom: 0.5rem !important;
              border-bottom: 1px solid #eee !important;
              padding-bottom: 0.25rem !important;
            }
            
            /* Table styling */
            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-bottom: 2rem !important;
            }
            
            .print-table th {
              background-color: #f9fafb !important;
              text-align: left !important;
              padding: 0.75rem !important;
              font-weight: bold !important;
              border-bottom: 2px solid #e5e7eb !important;
            }
            
            .print-table td {
              padding: 0.75rem !important;
              border-bottom: 1px solid #e5e7eb !important;
            }
            
            .print-table tr:last-child td {
              border-bottom: none !important;
            }
            
            .print-amount-col {
              text-align: right !important;
            }
            
            /* Totals section */
            .print-totals {
              margin-left: auto !important;
              width: 40% !important;
              margin-bottom: 2rem !important;
            }
            
            .print-total-row {
              display: flex !important;
              justify-content: space-between !important;
              padding: 0.5rem 0 !important;
              border-bottom: 1px solid #eee !important;
            }
            
            .print-total-row.print-grand-total {
              font-weight: bold !important;
              font-size: 1.1rem !important;
              border-top: 2px solid #e5e7eb !important;
              border-bottom: 2px solid #e5e7eb !important;
              padding: 0.75rem 0 !important;
            }
            
            /* Footer */
            .print-footer {
              margin-top: 3rem !important;
              padding-top: 1rem !important;
              border-top: 1px solid #eee !important;
              font-size: 0.9rem !important;
              color: #666 !important;
              text-align: center !important;
            }
            
            /* Notes */
            .print-notes {
              margin-top: 2rem !important;
              padding: 1rem !important;
              background-color: #f9fafb !important;
              border-radius: 0.25rem !important;
            }
            
            .print-notes-title {
              font-weight: bold !important;
              margin-bottom: 0.5rem !important;
            }
          }
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
          <div id="print-invoice" className="print-container bg-white rounded-lg shadow-lg p-8 mb-8">
            {/* Invoice Header */}
            <div className="print-header flex justify-between items-start mb-8 pb-6 border-b">
              <div>
                <div className="print-logo text-primary text-2xl font-bold mb-1" style={{ color: '#2563eb' }}>LUXURY HOTEL</div>
                <div className="text-sm text-muted-foreground" style={{ color: '#333333' }}>
                  <p>123 Luxury Avenue</p>
                  <p>Colombo, Sri Lanka</p>
                  <p>+94 123 456 789</p>
                  <p>info@luxuryhotel.com</p>
                </div>
              </div>
              <div className="text-right">
                <div className="print-invoice-title text-3xl font-bold mb-1" style={{ color: '#000000' }}>INVOICE</div>
                <div className="print-invoice-number text-muted-foreground" style={{ color: '#333333' }}>#{invoice.invoiceNumber}</div>
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
            <div className="print-details grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="print-section">
                <div className="print-section-title">Bill To</div>
                {guest && (
                  <div className="mt-2">
                    <div className="font-medium">{guest.name}</div>
                    <div>{guest.email}</div>
                    <div>{guest.phone}</div>
                    <div className="text-sm text-muted-foreground">{guest.address}</div>
                  </div>
                )}
              </div>

              <div className="print-section">
                <div className="print-section-title">Invoice Details</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span>{invoice.issueDate.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{invoice.dueDate.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span>{invoice.currency}</span>
                  </div>
                </div>
              </div>

              <div className="print-section">
                <div className="print-section-title">Payment Information</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span>{invoice.status === 'Paid' ? 'Paid' : 'Pending'}</span>
                  </div>
                  {invoice.status === 'Paid' && invoice.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span>{invoice.paymentMethod}</span>
                    </div>
                  )}
                  {invoice.status === 'Paid' && invoice.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Date:</span>
                      <span>{invoice.paymentDate.toDate().toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="print-section mb-8">
              <div className="print-section-title mb-4">Invoice Items</div>
              <table className="print-table w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-right py-3 px-4">Quantity</th>
                    <th className="text-right py-3 px-4">Unit Price</th>
                    <th className="text-right py-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4">{item.type}</td>
                      <td className="text-right py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.amount, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="print-totals ml-auto w-full md:w-1/2 lg:w-2/5">
              <div className="print-total-row">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="print-total-row">
                <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="print-total-row">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-red-500">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="print-total-row print-grand-total">
                <span>Total:</span>
                <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
              </div>
              
              {convertedCurrency && (
                <div className="print-total-row text-sm text-muted-foreground">
                  <span>Equivalent in {convertedCurrency}:</span>
                  <span>{formatCurrency(convertedTotal, convertedCurrency)}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="print-notes bg-muted/50 p-4 rounded-md mt-8">
                <div className="print-notes-title font-medium">Notes</div>
                <p className="text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="print-footer mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Thank you for your business!</p>
              <p className="mt-1">For any inquiries regarding this invoice, please contact our finance department at finance@luxuryhotel.com</p>
            </div>
          </div>

          {/* Original UI Cards - These will be hidden when printing */}
          <div className="no-print">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Number:</span>
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span className="font-medium">{invoice.issueDate.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{invoice.dueDate.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {guest && (
                    <>
                      <div className="font-medium">{guest.name}</div>
                      <div>{guest.email}</div>
                      <div>{guest.phone}</div>
                      <div className="text-sm text-muted-foreground">{guest.address}</div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge className={
                      invoice.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }>
                      {invoice.status === 'Paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  {invoice.status === 'Paid' && invoice.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{invoice.paymentMethod}</span>
                    </div>
                  )}
                  {invoice.status === 'Paid' && invoice.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Date:</span>
                      <span className="font-medium">{invoice.paymentDate.toDate().toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{invoice.currency}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">Quantity</th>
                        <th className="text-right py-3 px-4">Unit Price</th>
                        <th className="text-right py-3 px-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4">{item.type}</td>
                          <td className="text-right py-3 px-4">{item.quantity}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(item.amount, invoice.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                    <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium text-red-500">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                    </div>
                  )}
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                  </div>
                  
                  {convertedCurrency && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Equivalent in {convertedCurrency}:</span>
                      <span>{formatCurrency(convertedTotal, convertedCurrency)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
} 
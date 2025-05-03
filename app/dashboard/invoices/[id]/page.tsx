'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { getInvoiceById, getExchangeRate, getGuestById, getRoomById, updateInvoice } from '@/lib/firebase';
import { Invoice, Guest, Room } from '@/lib/types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ArrowLeft, Download, Edit, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Head from 'next/head';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import InvoiceSignatures from '@/components/InvoiceSignatures';
import InvoiceImplLive from '@/components/InvoiceImplLive';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extend the Invoice type to include roomId property that might be present
interface ExtendedInvoice extends Invoice {
  roomId?: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<ExtendedInvoice | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  // Use Record<string, any> to avoid type issues with Room
  const [room, setRoom] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertedCurrency, setConvertedCurrency] = useState<'USD' | 'LKR' | null>(null);
  const [convertedRate, setConvertedRate] = useState<number>(1);
  const [convertedTotal, setConvertedTotal] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<ExtendedInvoice | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const id = params.id as string;
        const invoiceData = await getInvoiceById(id) as ExtendedInvoice | null;
        
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
        
        // Fetch real guest data
        if (invoiceData.guestId) {
          try {
            const guestData = await getGuestById(invoiceData.guestId);
            if (guestData) {
              setGuest(guestData);
            } else {
              // Fallback if guest not found
              setGuest({
                id: invoiceData.guestId,
                name: 'Guest',
                email: 'guest@example.com',
                phone: '+1234567890',
                address: 'Address not available',
                idType: 'Unknown',
                idNumber: 'Unknown',
                createdAt: invoiceData.createdAt,
                updatedAt: invoiceData.updatedAt,
              });
            }
          } catch (error) {
            console.error('Error fetching guest:', error);
            // Fallback if guest fetch fails
        setGuest({
          id: invoiceData.guestId,
              name: 'Guest',
          email: 'guest@example.com',
          phone: '+1234567890',
              address: 'Address not available',
              idType: 'Unknown',
              idNumber: 'Unknown',
          createdAt: invoiceData.createdAt,
          updatedAt: invoiceData.updatedAt,
        });
          }
        }
        
        // Fetch real room data
        const roomId = invoiceData.roomId || 'default-room-id';
        try {
          const roomData = await getRoomById(roomId);
          if (roomData) {
            setRoom(roomData);
          } else {
            // Create fallback room data
            const extractedRoomNumber = 
              invoiceData.items?.[0]?.description?.split(' - ')?.[0]?.replace('Room ', '') || '101';
            
            const extractedRoomType = 
              (invoiceData.items?.[0]?.description?.split(' - ')?.[1] || 'Suite');
            
            setRoom({
              id: 'room-id',
              number: extractedRoomNumber,
              type: extractedRoomType,
              price: invoiceData.items?.[0]?.unitPrice || 150,
              status: 'Occupied',
              amenities: ['WiFi', 'TV', 'AC'],
              description: 'Room details not available',
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
          }
        } catch (error) {
          console.error('Error fetching room:', error);
          // Fallback with room data
        setRoom({
          id: 'room-id',
            number: invoiceData.items?.[0]?.description?.split(' - ')?.[0]?.replace('Room ', '') || '101',
            type: 'Suite',
            price: invoiceData.items?.[0]?.unitPrice || 150,
          status: 'Occupied',
          amenities: ['WiFi', 'TV', 'AC'],
            description: 'Room details not available',
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
        }
        
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

  // Update the PDF generation to better handle images, especially the logo
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

      // Update address text handling to prevent cropping in PDF
      const applyDarkTextStyles = (element: HTMLElement) => {
        element.style.color = '#000000';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.textShadow = 'none';
        element.style.backgroundColor = '#ffffff';
        
        // Fix text cropping in the header section
        if (element.classList.contains('print-header')) {
          const addressDiv = element.querySelector('.text-muted-foreground');
          if (addressDiv) {
            (addressDiv as HTMLElement).style.lineHeight = '1.4';
            (addressDiv as HTMLElement).style.marginTop = '5px';
            
            // Make sure each paragraph in the address has sufficient height
            const paragraphs = addressDiv.querySelectorAll('p');
            paragraphs.forEach(p => {
              (p as HTMLElement).style.marginBottom = '4px';
              (p as HTMLElement).style.paddingBottom = '1px';
            });
          }
        }
        
        if (element.classList.contains('text-muted-foreground')) {
          element.style.color = '#333333';
          element.style.lineHeight = '1.4';
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
        
        // Ensure images are visible and properly sized
        if (element.tagName === 'IMG') {
          element.style.maxWidth = '100%';
          element.style.height = 'auto';
          element.style.display = 'block';
        }
        
        // Improve logo image rendering
        if (element.classList.contains('print-logo')) {
          const img = element.querySelector('img');
          if (img) {
            img.style.width = '110px';
            img.style.height = '110px';
            img.style.objectFit = 'contain';
          }
        }
        
        Array.from(element.children).forEach(child => {
          applyDarkTextStyles(child as HTMLElement);
        });
      };
      
      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Set the exact width for A4 paper size
      clone.style.width = '210mm'; // A4 width
      clone.style.padding = '10mm'; // Standard margin
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxSizing = 'border-box';
      clone.style.borderRadius = '0'; // Remove any border radius for PDF
      clone.style.boxShadow = 'none'; // Remove any box shadows
      clone.style.border = 'none'; // Remove border for PDF
      
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
        scale: 2.5, // Higher scale for better image quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 15000, // Longer timeout for image loading
        removeContainer: false,
        width: 210 * 3.78, // A4 width in pixels (210mm * 3.78 pixels/mm at 96 DPI)
        height: 297 * 3.78 // A4 height in pixels
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
      const imgHeight = 297; // A4 height in mm

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

  // Handler to start editing
  const handleStartEdit = () => {
    setEditedInvoice(invoice);
    setIsEditing(true);
  };

  // Handler to save edited invoice
  const handleSaveInvoice = async () => {
    if (!editedInvoice) return;
    
    try {
      toast({
        title: 'Saving changes...',
        description: 'Please wait while we update the invoice.',
      });
      
      // Final calculation of all financial values
      let finalInvoice = {...editedInvoice};
      
      // Ensure all item amounts are correctly calculated
      finalInvoice.items = finalInvoice.items.map(item => ({
        ...item,
        amount: (item.quantity || 1) * (item.unitPrice || 0)
      }));
      
      // Recalculate all totals
      const subtotal = finalInvoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      finalInvoice.subtotal = parseFloat(subtotal.toFixed(2));
      
      const taxAmount = (subtotal * (finalInvoice.taxRate || 0)) / 100;
      finalInvoice.taxAmount = parseFloat(taxAmount.toFixed(2));
      
      const discountAmount = finalInvoice.discountAmount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;
      finalInvoice.totalAmount = parseFloat(totalAmount.toFixed(2));
      
      const advancePayment = finalInvoice.advancePayment || 0;
      finalInvoice.remainingBalance = parseFloat((totalAmount - advancePayment).toFixed(2));
      
      await updateInvoice(finalInvoice.id, finalInvoice);
      
      // Update the invoice state with edited data
      setInvoice(finalInvoice);
      setIsEditing(false);
      
      toast({
        title: 'Success',
        description: 'Invoice updated successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice.',
        variant: 'destructive',
      });
    }
  };

  // Handler for invoice field changes
  const handleInvoiceChange = (field: string, value: any) => {
    if (!editedInvoice) return;
    
    let updatedInvoice = {
      ...editedInvoice,
      [field]: value
    };
    
    // Recalculate totals when items, tax rate, or discount changes
    if (field === 'items' || field === 'taxRate' || field === 'discountAmount') {
      // Calculate subtotal from all items
      const subtotal = updatedInvoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      updatedInvoice.subtotal = subtotal;
      
      // Calculate tax amount based on subtotal and tax rate
      const taxAmount = (subtotal * (updatedInvoice.taxRate || 0)) / 100;
      updatedInvoice.taxAmount = parseFloat(taxAmount.toFixed(2));
      
      // Calculate total with tax and subtract discount
      const discountAmount = updatedInvoice.discountAmount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;
      updatedInvoice.totalAmount = parseFloat(totalAmount.toFixed(2));
      
      // Calculate remaining balance (total minus advance payment)
      const advancePayment = updatedInvoice.advancePayment || 0;
      updatedInvoice.remainingBalance = parseFloat((totalAmount - advancePayment).toFixed(2));
    } else if (field === 'advancePayment') {
      // Recalculate remaining balance when advance payment changes
      const totalAmount = updatedInvoice.totalAmount || 0;
      const advancePayment = updatedInvoice.advancePayment || 0;
      updatedInvoice.remainingBalance = parseFloat((totalAmount - advancePayment).toFixed(2));
    }
    
    setEditedInvoice(updatedInvoice);
  };

  // Add a function to handle payment of the due amount
  const handlePayDueAmount = async () => {
    if (!invoice) return;
    
    try {
      toast({
        title: 'Processing payment...',
        description: 'Please wait while we process your payment.',
      });
      
      // Create an updated invoice object with payment applied
      const paidInvoice: ExtendedInvoice = {
        ...invoice,
        status: 'Paid',
        paymentDate: invoice.paymentDate || Timestamp.now(),
        paymentMethod: invoice.paymentMethod || 'Cash',
        advancePayment: (invoice.advancePayment || 0) + (invoice.remainingBalance || 0),
        remainingBalance: 0
      };
      
      // Save the updated invoice to the database
      await updateInvoice(paidInvoice.id, paidInvoice);
      
      // Update the invoice state
      setInvoice(paidInvoice);
      
      toast({
        title: 'Payment successful',
        description: `Payment of ${formatCurrency(invoice.remainingBalance || 0, invoice.currency)} has been processed.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment failed',
        description: 'There was an error processing your payment. Please try again.',
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
              <h1 className="text-3xl font-bold">Invoice #{invoice?.invoiceNumber || invoice?.id}</h1>
              <Badge className={
                invoice?.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                invoice?.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                invoice?.status === 'Issued' ? 'bg-blue-500/10 text-blue-500' :
                invoice?.status === 'Draft' ? 'bg-gray-500/10 text-gray-500' :
                'bg-yellow-500/10 text-yellow-500'
              }>
                {invoice?.status}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCurrencyConversion}>
                Show in {invoice?.currency === 'USD' ? 'LKR' : 'USD'}
              </Button>
              {invoice && invoice.status !== 'Paid' && (invoice.remainingBalance || 0) > 0 && (
                <Button 
                  variant="outline" 
                  className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                  onClick={handlePayDueAmount}
                >
                  <span className="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </span>
                  Pay {formatCurrency(invoice.remainingBalance || 0, invoice.currency)}
                </Button>
              )}
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={handleStartEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1225px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Invoice</DialogTitle>
                    <DialogDescription>
                      Make changes to the invoice details. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  {editedInvoice && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="invoiceNumber" className="text-right">
                          Invoice Number
                        </Label>
                        <Input
                          id="invoiceNumber"
                          value={editedInvoice.invoiceNumber}
                          onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <Select
                          value={editedInvoice.status}
                          onValueChange={(value) => handleInvoiceChange('status', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Issued">Issued</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="currency" className="text-right">
                          Currency
                        </Label>
                        <Select
                          value={editedInvoice.currency}
                          onValueChange={(value) => handleInvoiceChange('currency', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="LKR">LKR</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {editedInvoice.status === 'Paid' && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentMethod" className="text-right">
                              Payment Method
                            </Label>
                            <Select
                              value={editedInvoice.paymentMethod || ''}
                              onValueChange={(value) => handleInvoiceChange('paymentMethod', value)}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Credit Card">Credit Card</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="PayPal">PayPal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentDate" className="text-right">
                              Payment Date
                            </Label>
                            <Input
                              id="paymentDate"
                              type="date"
                              value={
                                editedInvoice.paymentDate ? 
                                (typeof editedInvoice.paymentDate.toDate === 'function'
                                  ? editedInvoice.paymentDate.toDate().toISOString().split('T')[0]
                                  : new Date(editedInvoice.paymentDate as any).toISOString().split('T')[0]) 
                                : ''
                              }
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                handleInvoiceChange('paymentDate', date);
                              }}
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issueDate" className="text-right">
                          Issue Date
                        </Label>
                        <Input
                          id="issueDate"
                          type="date"
                          value={
                            editedInvoice.issueDate ? 
                            (typeof editedInvoice.issueDate.toDate === 'function'
                              ? editedInvoice.issueDate.toDate().toISOString().split('T')[0]
                              : new Date(editedInvoice.issueDate as any).toISOString().split('T')[0]) 
                            : ''
                          }
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            handleInvoiceChange('issueDate', date);
                          }}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={
                            editedInvoice.dueDate ? 
                            (typeof editedInvoice.dueDate.toDate === 'function'
                              ? editedInvoice.dueDate.toDate().toISOString().split('T')[0]
                              : new Date(editedInvoice.dueDate as any).toISOString().split('T')[0]) 
                            : ''
                          }
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            handleInvoiceChange('dueDate', date);
                          }}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taxRate" className="text-right">
                          Tax Rate (%)
                        </Label>
                        <Input
                          id="taxRate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={editedInvoice.taxRate || 0}
                          onChange={(e) => handleInvoiceChange('taxRate', parseFloat(e.target.value))}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discountAmount" className="text-right">
                          Discount Amount
                        </Label>
                        <Input
                          id="discountAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={editedInvoice.discountAmount || 0}
                          onChange={(e) => handleInvoiceChange('discountAmount', parseFloat(e.target.value))}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="advancePayment" className="text-right">
                          Advance Payment
                        </Label>
                        <Input
                          id="advancePayment"
                          type="number"
                          step="0.01"
                          min="0"
                          value={editedInvoice.advancePayment || 0}
                          onChange={(e) => handleInvoiceChange('advancePayment', parseFloat(e.target.value))}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={editedInvoice.notes || ''}
                          onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="col-span-4 mt-2">
                        <h3 className="font-medium text-sm mb-2">Invoice Items</h3>
                        <div className="border rounded-md p-3 space-y-3">
                          {editedInvoice.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center border-b pb-3">
                              <div className="col-span-5">
                                <Label htmlFor={`item-${index}-description`} className="text-xs mb-1 block">
                                  Description
                                </Label>
                                <Input
                                  id={`item-${index}-description`}
                                  value={item.description}
                                  onChange={(e) => {
                                    const updatedItems = [...editedInvoice.items];
                                    updatedItems[index] = {
                                      ...updatedItems[index],
                                      description: e.target.value
                                    };
                                    handleInvoiceChange('items', updatedItems);
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                <Label htmlFor={`item-${index}-type`} className="text-xs mb-1 block">
                                  Type
                                </Label>
                                <Select
                                  value={item.type}
                                  onValueChange={(value) => {
                                    const updatedItems = [...editedInvoice.items];
                                    updatedItems[index] = {
                                      ...updatedItems[index],
                                      type: value as any
                                    };
                                    handleInvoiceChange('items', updatedItems);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Room">Room</SelectItem>
                                    <SelectItem value="Service">Service</SelectItem>
                                    <SelectItem value="Activity">Activity</SelectItem>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-1">
                                <Label htmlFor={`item-${index}-quantity`} className="text-xs mb-1 block">
                                  Qty
                                </Label>
                                <Input
                                  id={`item-${index}-quantity`}
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const updatedItems = [...editedInvoice.items];
                                    const quantity = parseInt(e.target.value) || 1;
                                    updatedItems[index] = {
                                      ...updatedItems[index],
                                      quantity,
                                      amount: quantity * (updatedItems[index].unitPrice || 0)
                                    };
                                    handleInvoiceChange('items', updatedItems);
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                <Label htmlFor={`item-${index}-unitPrice`} className="text-xs mb-1 block">
                                  Unit Price
                                </Label>
                                <Input
                                  id={`item-${index}-unitPrice`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.unitPrice || 0}
                                  onChange={(e) => {
                                    const updatedItems = [...editedInvoice.items];
                                    const unitPrice = parseFloat(e.target.value) || 0;
                                    updatedItems[index] = {
                                      ...updatedItems[index],
                                      unitPrice,
                                      amount: (updatedItems[index].quantity || 1) * unitPrice
                                    };
                                    handleInvoiceChange('items', updatedItems);
                                  }}
                                />
                              </div>
                              <div className="col-span-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="mt-6"
                                  onClick={() => {
                                    const updatedItems = [...editedInvoice.items];
                                    updatedItems.splice(index, 1);
                                    handleInvoiceChange('items', updatedItems);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={() => {
                              const updatedItems = [...editedInvoice.items];
                              updatedItems.push({
                                description: 'New Item',
                                type: 'Other',
                                quantity: 1,
                                unitPrice: 0,
                                amount: 0
                              });
                              handleInvoiceChange('items', updatedItems);
                            }}
                          >
                            Add Item
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter className="flex justify-between">
                    {editedInvoice && editedInvoice.status !== 'Paid' && (editedInvoice.remainingBalance || 0) > 0 && (
                      <Button 
                        variant="outline" 
                        className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                        onClick={() => {
                          // Mark as paid
                          const today = Timestamp.now();
                          handleInvoiceChange('status', 'Paid');
                          handleInvoiceChange('paymentDate', today);
                          handleInvoiceChange('paymentMethod', editedInvoice.paymentMethod || 'Cash');
                          handleInvoiceChange('advancePayment', (editedInvoice.advancePayment || 0) + (editedInvoice.remainingBalance || 0));
                          handleInvoiceChange('remainingBalance', 0);
                        }}
                      >
                        <span className="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <line x1="2" x2="22" y1="10" y2="10" />
                          </svg>
                        </span>
                        Pay {formatCurrency(editedInvoice.remainingBalance || 0, editedInvoice.currency || 'USD')}
                      </Button>
                    )}
                    <Button type="submit" onClick={handleSaveInvoice}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* New Invoice Component */}
          <div id="print-invoice" className="print-container">
            {invoice && guest && room && (
              <InvoiceImplLive 
                invoice={invoice} 
                guest={guest} 
                room={room}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
} 
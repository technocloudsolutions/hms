'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, Phone } from 'lucide-react';

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-destructive/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Trial Expired
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <CardDescription className="text-lg leading-relaxed">
            Your subscription trial period has ended. Please renew your subscription to continue using the system without interruption.
          </CardDescription>
          
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Contact Us to Renew</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@olexto.com</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+94714245192</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              size="lg" 
              className="w-full"
              onClick={() => window.location.href = 'mailto:info@olexto.com?subject=Subscription Renewal Request'}
            >
              Renew Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

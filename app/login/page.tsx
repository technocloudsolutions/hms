'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/auth/AuthLayout';
import { signIn } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { user, error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    if (user) {
      router.push('/dashboard');
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to access your hotel management dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        {error && (
          <div className="text-sm text-destructive text-center bg-destructive/10 py-2 px-4 rounded-md border border-destructive/20 shadow-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full animate-gradient"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center space-y-2 pt-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent hover:text-accent/80 hover:underline font-medium transition-colors">
              Sign up
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:text-accent/80 hover:underline block font-medium transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
} 
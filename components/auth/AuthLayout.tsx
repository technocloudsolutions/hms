import React from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-accent/10 to-background dark:from-primary/20 dark:via-accent/5 dark:to-background">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-bounce-slow opacity-70" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-3xl animate-bounce-slow [animation-delay:1s] opacity-70" />
      </div>

      <div className="relative w-full max-w-[400px] p-8 rounded-2xl bg-card/60 shadow-xl dark:shadow-primary/5 backdrop-blur-xl border border-primary/20 animate-fade-up">
        {/* Card decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent opacity-10 rounded-2xl animate-gradient" />
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-grid-dark/5" />
        <div className="absolute inset-0 shimmer rounded-2xl" />
        
        <div className="relative flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-6 relative animate-bounce-slow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl animate-pulse" />
            <Image
              src="/hotel-logo.svg"
              alt="Hotel Logo"
              fill
              className="object-contain drop-shadow-xl dark:brightness-110"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
            {title}
          </h1>
          <p className="text-muted-foreground text-center mt-2 max-w-[80%]">{subtitle}</p>
        </div>

        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 
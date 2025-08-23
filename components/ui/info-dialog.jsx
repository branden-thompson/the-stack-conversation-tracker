/**
 * InfoDialog Component - "The Stack"
 * Enhanced app information dialog with tech stack and attribution
 * 
 * Features:
 * - Tech stack information with stack icon
 * - Profile pictures and attribution for creators
 * - GitHub repository and documentation links
 * - Two-column responsive layout
 * - Build version and hash display
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Info, ExternalLink, Github, BookOpen } from 'lucide-react';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

export function InfoDialog({ 
  trigger,
  className = "",
  size = "sm"
}) {
  const dynamicTheme = useDynamicAppTheme();

  const appVersion = "1.0.000";
  const nextVersion = "15.4.6";
  const reactVersion = "19.1.0";
  const githubUrl = "https://github.com/bthompso/conversation-tracker";
  const docsUrl = `${githubUrl}/blob/main/docs`;
  const buildHash = process.env.NEXT_PUBLIC_BUILD_HASH || "dev-build";

  // Stack SVG Component
  const StackIcon = () => (
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stackGradient" x1="20" y1="8" x2="44" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F59E0B"/>
          <stop offset="1" stopColor="#C2410C"/>
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="24" height="32" rx="5" fill="url(#stackGradient)" opacity="0.35"/>
      <rect x="20" y="12" width="24" height="32" rx="5" fill="url(#stackGradient)" opacity="0.55"/>
      <rect x="24" y="8" width="24" height="32" rx="5" fill="url(#stackGradient)"/>
      <rect x="24" y="8" width="24" height="32" rx="5" stroke="#FFFFFF" strokeOpacity="0.15"/>
    </svg>
  );

  // Claude logo component
  const ClaudeLogo = () => (
    <img 
      src="/claude-logo.svg" 
      alt="Claude AI"
      className="w-10 h-10 rounded-full bg-white p-1"
    />
  );

  const TriggerButton = trigger || (
    <Button
      variant="outline"
      size={size}
      className={`${className} cursor-pointer`}
      title="App information"
      aria-label="App information"
    >
      <Info className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>The Stack</DialogTitle>
        </DialogHeader>
        
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Tech Stack */}
          <div className="space-y-4">
            {/* Stack Icon and Version */}
            <div className="flex items-center gap-3">
              <StackIcon />
              <div>
                <div className={`text-sm font-medium ${dynamicTheme.colors.text.primary}`}>
                  Version {appVersion}
                </div>
                <div className={`text-xs ${dynamicTheme.colors.text.secondary}`}>
                  Next.js {nextVersion}
                </div>
              </div>
            </div>
            
            {/* Tech Stack List */}
            <div className={`text-xs ${dynamicTheme.colors.text.muted} space-y-1`}>
              <div>React, ShadCN, Radix UI, Tailwind</div>
            </div>
          </div>

          {/* Right Column - Attribution & Links */}
          <div className="space-y-4">
            {/* Branden's Attribution */}
            <div className="flex items-center gap-3">
              <img 
                src="/branden-profile.png" 
                alt="Branden's profile"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className={`text-sm font-medium ${dynamicTheme.colors.text.primary}`}>
                  Designed & Built by Branden
                </div>
              </div>
            </div>

            {/* Claude's Attribution */}
            <div className="flex items-center gap-3">
              <ClaudeLogo />
              <div className="flex-1">
                <div className={`text-sm font-medium ${dynamicTheme.colors.text.primary}`}>
                  Collaboration by Claude
                </div>
              </div>
            </div>

            {/* GitHub Links */}
            <div className="space-y-2 pt-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm ${dynamicTheme.colors.text.secondary} hover:${dynamicTheme.colors.text.primary} transition-colors cursor-pointer`}
              >
                <Github className="w-4 h-4" />
                Get this on GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
              
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm ${dynamicTheme.colors.text.secondary} hover:${dynamicTheme.colors.text.primary} transition-colors cursor-pointer`}
              >
                <BookOpen className="w-4 h-4" />
                Check the Docs
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center pt-4 border-t ${dynamicTheme.colors.border.secondary}`}>
          <p className={`text-xs ${dynamicTheme.colors.text.muted}`}>
            Version: {appVersion} | Build {buildHash}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
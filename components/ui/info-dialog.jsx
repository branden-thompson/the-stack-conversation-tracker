/**
 * InfoDialog Component
 * Display application version information and GitHub links
 * 
 * Features:
 * - App version display
 * - GitHub repository link
 * - Documentation links
 * - Responsive dialog layout
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

  const appVersion = "1.0.0"; // TODO: Get from package.json
  const githubUrl = "https://github.com/yourusername/conversation-tracker";
  const docsUrl = `${githubUrl}#readme`;

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>App Information</DialogTitle>
        </DialogHeader>
      <div className="space-y-6">
        {/* Version Information */}
        <div className={`text-center p-4 rounded-lg ${dynamicTheme.colors.background.card}`}>
          <h3 className={`text-lg font-semibold ${dynamicTheme.colors.text.primary} mb-2`}>
            The Stack
          </h3>
          <p className={`text-sm ${dynamicTheme.colors.text.secondary} mb-1`}>
            Conversation tracking and facilitation
          </p>
          <p className={`text-xs ${dynamicTheme.colors.text.muted} font-mono`}>
            Version {appVersion}
          </p>
        </div>

        {/* Links */}
        <div className="space-y-3">
          <h4 className={`text-sm font-medium ${dynamicTheme.colors.text.primary} mb-3`}>
            Resources
          </h4>
          
          {/* GitHub Repository */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-lg ${dynamicTheme.colors.background.hover} ${dynamicTheme.colors.text.secondary} hover:${dynamicTheme.colors.text.primary} transition-colors cursor-pointer`}
          >
            <Github className="w-4 h-4" />
            <span className="flex-1 text-sm">View on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Documentation */}
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-lg ${dynamicTheme.colors.background.hover} ${dynamicTheme.colors.text.secondary} hover:${dynamicTheme.colors.text.primary} transition-colors cursor-pointer`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="flex-1 text-sm">Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Footer */}
        <div className={`text-center pt-4 border-t ${dynamicTheme.colors.border.secondary}`}>
          <p className={`text-xs ${dynamicTheme.colors.text.muted}`}>
            Built with Next.js • Powered by React
          </p>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
/**
 * SectionCard Component
 * 
 * A modular card component with header, content, and footer sections
 * for consistent layout and controls across the application
 */

'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { THEME, getThemeClasses } from '@/lib/utils/ui-constants';

/**
 * Section Header Component
 */
export function SectionHeader({ title, controls, className }) {
  return (
    <div className={cn(
      `flex items-center justify-between border-b ${THEME.colors.border.primary} pb-3 mb-4`,
      className
    )}>
      <h3 className={`text-lg font-semibold ${THEME.colors.text.primary}`}>
        {title}
      </h3>
      {controls && (
        <div className="flex items-center gap-2">
          {controls}
        </div>
      )}
    </div>
  );
}

/**
 * Section Content Component
 */
export function SectionContent({ children, className }) {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  );
}

/**
 * Section Footer Component
 */
export function SectionFooter({ controls, pagination, className }) {
  if (!controls && !pagination) return null;
  
  return (
    <div className={cn(
      `flex items-center justify-between border-t ${THEME.colors.border.primary} pt-3 mt-4`,
      className
    )}>
      <div className="flex items-center gap-2">
        {pagination}
      </div>
      <div className="flex items-center gap-2">
        {controls}
      </div>
    </div>
  );
}

/**
 * Main SectionCard Component
 * Combines Card with structured sections
 */
export function SectionCard({ 
  title,
  headerControls,
  footerControls,
  pagination,
  children,
  className,
  contentClassName,
  ...props 
}) {
  return (
    <Card 
      className={cn(
        getThemeClasses('section'),
        className
      )}
      {...props}
    >
      <SectionHeader title={title} controls={headerControls} />
      <SectionContent className={contentClassName}>
        {children}
      </SectionContent>
      <SectionFooter controls={footerControls} pagination={pagination} />
    </Card>
  );
}

/**
 * Export individual components for custom layouts
 */
export default SectionCard;
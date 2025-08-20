/**
 * Timeline Card Component Factory
 * 
 * Creates standardized timeline card components with consistent patterns for
 * layout, interactions, responsive behavior, and theming.
 * Reduces code duplication across timeline and card components.
 * 
 * Part of: Mini-Project 2 - Pattern Extraction & API Standardization
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Default card configurations
 */
const DEFAULT_CARD_CONFIG = {
  animations: {
    entrance: 'animate-slide-in-left',
    hover: 'hover:scale-105 hover:shadow-lg hover:-translate-y-1',
    transition: 'transition-all duration-300 ease-out',
    iconHover: 'group-hover:scale-110 group-hover:shadow-md transition-all duration-200',
  },
  spacing: {
    padding: 'p-4',
    gap: 'gap-2',
    iconPadding: 'p-1.5',
    contentPadding: 'pt-0',
    headerPadding: 'pb-2',
  },
  styling: {
    cursor: 'cursor-pointer',
    borderRadius: 'rounded-xl',
    backdrop: 'backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95',
  },
  responsive: {
    breakpoints: {
      mobile: 320,
      tablet: 768,
      desktop: 1024,
      large: 1440,
    },
  },
};

/**
 * Create base timeline card component
 */
export function createTimelineCard(config) {
  const {
    name,
    defaultProps = {},
    layout = 'horizontal',
    animationConfig = {},
    styleOverrides = {},
    interactionHandlers = {},
  } = config;

  const mergedAnimations = { ...DEFAULT_CARD_CONFIG.animations, ...animationConfig };
  const mergedSpacing = { ...DEFAULT_CARD_CONFIG.spacing, ...styleOverrides.spacing };
  const mergedStyling = { ...DEFAULT_CARD_CONFIG.styling, ...styleOverrides.styling };

  return function TimelineCard(props) {
    const {
      // Content props
      icon: Icon,
      title,
      subtitle,
      content,
      metadata = {},
      
      // Layout props
      isLeft = false,
      showTime = true,
      isStacked = false,
      stackPosition = 0,
      
      // Styling props
      className = '',
      variant = 'default',
      size = 'medium',
      
      // Interaction props
      onClick,
      onHover,
      hoverable = true,
      clickable = !!onClick,
      
      // Animation props
      animationsEnabled = true,
      entranceAnimation,
      
      // Data props
      data = {},
      
      ...rest
    } = { ...defaultProps, ...props };

    const [isHovered, setIsHovered] = useState(false);

    // Generate dynamic classes
    const cardClasses = useMemo(() => {
      const classes = [
        'relative group',
        mergedStyling.cursor,
        mergedStyling.borderRadius,
      ];

      // Animation classes
      if (animationsEnabled) {
        classes.push(mergedAnimations.transition);
        if (hoverable) {
          classes.push(mergedAnimations.hover);
        }
        
        // Entrance animation
        const entrance = entranceAnimation || (isLeft ? 'animate-slide-in-right' : mergedAnimations.entrance);
        classes.push(entrance);
      }

      // Responsive classes
      if (isStacked) {
        classes.push('relative');
      }

      // Hover ring effect
      if (isHovered && hoverable) {
        classes.push('ring-2 ring-opacity-50 ring-blue-300 dark:ring-blue-600');
      }

      // Custom className
      if (className) {
        classes.push(className);
      }

      return cn(classes);
    }, [
      isHovered, 
      hoverable, 
      animationsEnabled, 
      entranceAnimation, 
      isLeft, 
      isStacked, 
      className, 
      mergedAnimations, 
      mergedStyling
    ]);

    // Generate content layout classes
    const contentLayoutClasses = useMemo(() => {
      const baseClasses = ['flex items-center', mergedSpacing.gap];
      
      if (layout === 'horizontal') {
        baseClasses.push(isLeft ? 'flex-row-reverse' : 'flex-row');
      } else {
        baseClasses.push('flex-col');
      }
      
      return cn(baseClasses);
    }, [layout, isLeft, mergedSpacing.gap]);

    // Generate time layout classes
    const timeLayoutClasses = useMemo(() => {
      const baseClasses = ['flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5'];
      
      if (isLeft) {
        baseClasses.push('flex-row-reverse');
      } else {
        baseClasses.push('flex-row');
      }
      
      return cn(baseClasses);
    }, [isLeft]);

    // Event handlers
    const handleMouseEnter = () => {
      setIsHovered(true);
      if (onHover) onHover(true, data);
      if (interactionHandlers.onMouseEnter) {
        interactionHandlers.onMouseEnter(data, props);
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (onHover) onHover(false, data);
      if (interactionHandlers.onMouseLeave) {
        interactionHandlers.onMouseLeave(data, props);
      }
    };

    const handleClick = (e) => {
      if (onClick) onClick(data, e);
      if (interactionHandlers.onClick) {
        interactionHandlers.onClick(data, props, e);
      }
    };

    // Dynamic styling based on size
    const sizeConfig = useMemo(() => {
      const configs = {
        small: {
          iconSize: 'w-3 h-3',
          iconContainer: 'p-1',
          title: 'text-xs',
          subtitle: 'text-xs',
          content: 'text-xs',
        },
        medium: {
          iconSize: 'w-4 h-4',
          iconContainer: mergedSpacing.iconPadding,
          title: 'text-sm font-semibold',
          subtitle: 'text-xs',
          content: 'text-sm',
        },
        large: {
          iconSize: 'w-5 h-5',
          iconContainer: 'p-2',
          title: 'text-base font-semibold',
          subtitle: 'text-sm',
          content: 'text-base',
        },
      };
      return configs[size] || configs.medium;
    }, [size, mergedSpacing.iconPadding]);

    return (
      <div
        className={cardClasses}
        style={{
          zIndex: isStacked ? stackPosition + 1 : 1,
          ...rest.style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={clickable ? handleClick : undefined}
        {...rest}
      >
        <Card className={cn(
          'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          variant === 'elevated' && 'shadow-md',
          variant === 'flat' && 'shadow-none border-0'
        )}>
          <CardHeader className={mergedSpacing.headerPadding}>
            <div className={contentLayoutClasses}>
              {/* Icon Container */}
              {Icon && (
                <div className={cn(
                  sizeConfig.iconContainer,
                  'rounded-full bg-gray-100 dark:bg-gray-700',
                  animationsEnabled && mergedAnimations.iconHover
                )}>
                  <Icon className={cn(
                    sizeConfig.iconSize,
                    'text-gray-600 dark:text-gray-300',
                    animationsEnabled && 'transition-transform duration-200 group-hover:scale-110'
                  )} />
                </div>
              )}
              
              {/* Content Container */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                {title && (
                  <h4 className={cn(
                    sizeConfig.title,
                    'text-gray-900 dark:text-gray-100'
                  )}>
                    {title}
                  </h4>
                )}
                
                {/* Subtitle with Time */}
                {(subtitle || (showTime && metadata.time)) && (
                  <div className={timeLayoutClasses}>
                    {showTime && metadata.time && (
                      <>
                        {metadata.timeIcon && <metadata.timeIcon className="w-3 h-3" />}
                        <span>{metadata.time}</span>
                      </>
                    )}
                    {subtitle && <span className={sizeConfig.subtitle}>{subtitle}</span>}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          {/* Main Content */}
          {content && (
            <CardContent className={mergedSpacing.contentPadding}>
              <div className={cn(
                sizeConfig.content,
                'text-gray-700 dark:text-gray-300'
              )}>
                {content}
              </div>
              
              {/* Metadata Display */}
              {metadata.id && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  ID: <span className="font-mono">{metadata.id.slice(0, 8)}...</span>
                </div>
              )}
            </CardContent>
          )}
        </Card>
        
        {/* Render children for custom tooltips, overlays, etc. */}
        {props.children}
      </div>
    );
  };
}

/**
 * Create timeline node component (specialized for timeline events)
 */
export function createTimelineNode(config) {
  const baseConfig = {
    ...config,
    layout: 'horizontal',
    defaultProps: {
      size: 'medium',
      variant: 'default',
      animationsEnabled: true,
      hoverable: true,
      ...config.defaultProps,
    },
  };

  const TimelineCard = createTimelineCard(baseConfig);

  return function TimelineNode(props) {
    const {
      event,
      eventConfig,
      isLeft = false,
      showTime = true,
      ...rest
    } = props;

    // Extract event data
    const Icon = eventConfig?.icon;
    const title = eventConfig?.label;
    const content = event?.summary || event?.description;
    const metadata = {
      time: showTime ? event?.formattedTime : null,
      timeIcon: eventConfig?.timeIcon,
      id: event?.id,
      type: event?.type,
    };

    return (
      <TimelineCard
        icon={Icon}
        title={title}
        content={content}
        metadata={metadata}
        isLeft={isLeft}
        showTime={showTime}
        data={event}
        className={eventConfig?.bgClass}
        {...rest}
      />
    );
  };
}

/**
 * Create conversation card component (specialized for conversation cards)
 */
export function createConversationCard(config) {
  const baseConfig = {
    ...config,
    layout: 'vertical',
    defaultProps: {
      size: 'medium',
      variant: 'elevated',
      animationsEnabled: true,
      hoverable: true,
      clickable: true,
      ...config.defaultProps,
    },
  };

  const TimelineCard = createTimelineCard(baseConfig);

  return function ConversationCard(props) {
    const {
      card,
      users = [],
      isStacked = false,
      stackPosition = 0,
      ...rest
    } = props;

    // Extract card data
    const title = card?.title || card?.type;
    const content = card?.content;
    const metadata = {
      time: card?.createdAt ? new Date(card.createdAt).toLocaleDateString() : null,
      id: card?.id,
      createdBy: card?.createdByUserId,
      assignedTo: card?.assignedToUserId,
    };

    return (
      <TimelineCard
        title={title}
        content={content}
        metadata={metadata}
        isStacked={isStacked}
        stackPosition={stackPosition}
        data={card}
        showTime={true}
        {...rest}
      />
    );
  };
}

/**
 * Preset configurations for common card types
 */
export const cardPresets = {
  timeline: {
    name: 'TimelineCard',
    layout: 'horizontal',
    animationConfig: {
      entrance: 'animate-slide-in-left',
      hover: 'hover:scale-105 hover:shadow-lg hover:-translate-y-1',
    },
    defaultProps: {
      size: 'medium',
      variant: 'default',
      hoverable: true,
    },
  },
  
  conversation: {
    name: 'ConversationCard',
    layout: 'vertical',
    animationConfig: {
      entrance: 'animate-fade-in-scale',
      hover: 'hover:scale-102 hover:shadow-md',
    },
    defaultProps: {
      size: 'medium',
      variant: 'elevated',
      clickable: true,
    },
  },
  
  notification: {
    name: 'NotificationCard',
    layout: 'horizontal',
    animationConfig: {
      entrance: 'animate-slide-in-right',
      hover: 'hover:shadow-md',
    },
    defaultProps: {
      size: 'small',
      variant: 'flat',
      hoverable: false,
    },
  },
  
  dashboard: {
    name: 'DashboardCard',
    layout: 'vertical',
    animationConfig: {
      entrance: 'animate-fade-in',
      hover: 'hover:scale-101 hover:shadow-lg',
    },
    defaultProps: {
      size: 'large',
      variant: 'elevated',
      clickable: true,
    },
  },
};

/**
 * Quick factory functions using presets
 */
export const createTimelineCardFromPreset = () => createTimelineCard(cardPresets.timeline);
export const createConversationCardFromPreset = () => createConversationCard(cardPresets.conversation);
export const createNotificationCard = () => createTimelineCard(cardPresets.notification);
export const createDashboardCard = () => createTimelineCard(cardPresets.dashboard);

/**
 * Export factory functions
 */
export default {
  createTimelineCard,
  createTimelineNode,
  createConversationCard,
  cardPresets,
  createTimelineCardFromPreset,
  createConversationCardFromPreset,
  createNotificationCard,
  createDashboardCard,
};
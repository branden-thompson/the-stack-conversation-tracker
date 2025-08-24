/**
 * Integrated Design System Factory
 * 
 * Combines all factories from Mini-Project 2 with design system components.
 * Provides unified component creation with theme awareness, layouts, and patterns.
 * 
 * Part of: Mini-Project 3 - Design System Integration
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Import all factories from Mini-Project 2
import { createThemeStyleHook, createThemedComponent } from '../../factories/theme-styling-factory.js';
import { createTimelineCard, createTimelineNode, createConversationCard } from '../../factories/timeline-card-factory.js';
import { createQueryHook, createCollectionQueryHook } from '../../factories/query-hook-factory.js';
import { createCRUDRoutes } from '../../factories/api-route-factory.js';

// Import design system components  
import { BaseCard, BaseContainer, BaseGrid, BaseFlex, BaseButton, BaseText, BaseSection } from '../components/base.js';

// Import theme and layout systems
import { useTheme, useThemeClasses } from '../themes/provider.js';
import { BUILT_IN_THEMES } from '../themes/factory.js';
import { LayoutUtils, COMPONENT_LAYOUTS } from '../../constants/ui/layout.js';

/**
 * Enhanced Component Factory
 * Integrates theme factory with base design system components
 */
export function createDesignSystemComponent(config) {
  const {
    name,
    baseComponent,
    variant = 'default',
    themeContext = 'app',
    layoutType = 'card',
    factoryIntegration = {},
    styleOverrides = {},
    defaultProps = {},
  } = config;

  // Create theme-aware styling hook
  const useComponentTheme = createThemeStyleHook({
    context: themeContext,
    components: {
      [name.toLowerCase()]: {
        background: 'secondary',
        border: 'primary',
        text: 'primary',
        shadow: 'sm',
        ...styleOverrides,
      },
    },
  });

  return function DesignSystemComponent(props) {
    const {
      className = '',
      children,
      theme: themeProp,
      layout: layoutProp,
      ...rest
    } = { ...defaultProps, ...props };

    // Get theme styles
    const { styles, theme, getComponentClasses } = useComponentTheme({
      component: name.toLowerCase(),
      variant,
      className,
      theme: themeProp,
    });

    // Get layout classes
    const layoutClasses = layoutProp ? 
      LayoutUtils.getComponent(layoutType, layoutProp) : 
      COMPONENT_LAYOUTS[layoutType]?.[variant] || '';

    // Combine all classes
    const finalClasses = cn(styles, layoutClasses, className);

    // Use base component or provided component
    const Component = baseComponent || BaseCard;

    return (
      <Component className={finalClasses} {...rest}>
        {children}
      </Component>
    );
  };
}

/**
 * Enhanced Timeline Factory
 * Integrates timeline factory with design system
 */
export function createIntegratedTimelineCard(config = {}) {
  const {
    themeContext = 'app',
    responsive = true,
    animationsEnabled = true,
    layoutVariant = 'default',
    ...timelineConfig
  } = config;

  // Create base timeline card from factory
  const TimelineCard = createTimelineCard({
    ...timelineConfig,
    animationConfig: {
      entrance: 'animate-slide-in-left',
      hover: 'hover:scale-105 hover:shadow-lg hover:-translate-y-1',
      transition: 'transition-all duration-300 ease-out',
      ...timelineConfig.animationConfig,
    },
  });

  // Create design system wrapper
  return function IntegratedTimelineCard(props) {
    const { className = '', ...rest } = props;
    const theme = useTheme();
    
    // Get responsive layout classes
    const responsiveClasses = responsive ? 
      LayoutUtils.getResponsive('', {
        mobile: 'text-sm p-3',
        tablet: 'text-base p-4',
        desktop: 'text-base p-4',
      }) : '';

    const finalClassName = cn(
      // Base timeline styling
      COMPONENT_LAYOUTS.card[layoutVariant],
      // Theme-aware classes
      theme.currentTheme?.colors?.background?.secondary,
      theme.currentTheme?.colors?.border?.primary,
      theme.currentTheme?.shadows?.sm,
      // Responsive classes
      responsiveClasses,
      // Animations
      animationsEnabled && theme.currentTheme?.transitions?.all,
      className
    );

    return (
      <TimelineCard className={finalClassName} {...rest} />
    );
  };
}

/**
 * Enhanced Query Hook Factory
 * Integrates React Query factory with theme-aware error handling
 */
export function createIntegratedQueryHook(config) {
  const {
    resource,
    errorComponent: CustomErrorComponent,
    loadingComponent: CustomLoadingComponent,
    themeContext = 'app',
    ...queryConfig
  } = config;

  // Create base query hook
  const useBaseQuery = createCollectionQueryHook(queryConfig);

  return function useIntegratedQuery(options = {}) {
    const baseResult = useBaseQuery(options);
    const theme = useTheme();

    // Enhanced error handling with theme-aware components
    const errorComponent = baseResult.isError ? (
      CustomErrorComponent ? (
        <CustomErrorComponent error={baseResult.error} theme={theme} />
      ) : (
        <BaseCard variant="padded" className={cn(
          theme.currentTheme?.colors?.status?.error?.bg,
          theme.currentTheme?.colors?.status?.error?.border,
          'border'
        )}>
          <BaseText variant="error">
            Error loading {resource}: {baseResult.error?.message}
          </BaseText>
        </BaseCard>
      )
    ) : null;

    // Enhanced loading state with theme-aware component
    const loadingComponent = baseResult.isLoading ? (
      CustomLoadingComponent ? (
        <CustomLoadingComponent theme={theme} />
      ) : (
        <BaseCard variant="padded">
          <BaseFlex align="center" gap="md">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            <BaseText variant="muted">Loading {resource}...</BaseText>
          </BaseFlex>
        </BaseCard>
      )
    ) : null;

    return {
      ...baseResult,
      errorComponent,
      loadingComponent,
      theme,
    };
  };
}

/**
 * Integrated Form Factory
 * Creates theme-aware forms with consistent styling
 */
export function createIntegratedForm(config) {
  const {
    name,
    fields,
    validation = {},
    themeContext = 'app',
    layout = 'vertical',
    submitText = 'Submit',
    onSubmit,
  } = config;

  return function IntegratedForm(props) {
    const { className = '', ...rest } = props;
    const theme = useTheme();

    const formClasses = cn(
      COMPONENT_LAYOUTS.form.group,
      layout === 'horizontal' && 'sm:grid sm:grid-cols-2 sm:gap-6',
      className
    );

    return (
      <BaseCard variant="padded" className={formClasses}>
        <form onSubmit={onSubmit} {...rest}>
          {fields.map((field, index) => (
            <div key={field.name || index} className={COMPONENT_LAYOUTS.form.field}>
              {field.label && (
                <BaseText 
                  as="label" 
                  variant="primary" 
                  className={COMPONENT_LAYOUTS.form.label}
                  htmlFor={field.name}
                >
                  {field.label}
                </BaseText>
              )}
              
              <input
                id={field.name}
                name={field.name}
                type={field.type || 'text'}
                className={cn(
                  COMPONENT_LAYOUTS.form.input,
                  theme.currentTheme?.colors?.background?.secondary,
                  theme.currentTheme?.colors?.border?.primary,
                  theme.currentTheme?.colors?.text?.primary,
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  field.error && theme.currentTheme?.colors?.status?.error?.border
                )}
                placeholder={field.placeholder}
                required={field.required}
                {...field.props}
              />
              
              {field.error && (
                <BaseText variant="error" className={COMPONENT_LAYOUTS.form.error}>
                  {field.error}
                </BaseText>
              )}
              
              {field.help && (
                <BaseText variant="muted" className={COMPONENT_LAYOUTS.form.help}>
                  {field.help}
                </BaseText>
              )}
            </div>
          ))}
          
          <BaseButton type="submit" variant="primary" className="w-full sm:w-auto">
            {submitText}
          </BaseButton>
        </form>
      </BaseCard>
    );
  };
}

/**
 * Integrated Layout Factory
 * Creates responsive layouts with theme awareness
 */
export function createIntegratedLayout(config) {
  const {
    name,
    type = 'page',
    header = null,
    sidebar = null,
    footer = null,
    navigation = null,
    containerType = 'page',
    themeContext = 'app',
  } = config;

  return function IntegratedLayout({ children, className = '', ...props }) {
    const theme = useTheme();
    
    const layoutClasses = cn(
      'min-h-screen flex flex-col',
      theme.currentTheme?.colors?.background?.primary,
      className
    );

    return (
      <div className={layoutClasses} {...props}>
        {/* Header */}
        {header && (
          <BaseSection 
            padding={false}
            background
            className={cn(
              'sticky top-0 z-30',
              theme.currentTheme?.colors?.background?.secondary,
              theme.currentTheme?.colors?.border?.primary,
              theme.currentTheme?.shadows?.sm,
              'border-b'
            )}
          >
            <BaseContainer type={containerType}>
              {header}
            </BaseContainer>
          </BaseSection>
        )}

        {/* Navigation */}
        {navigation && (
          <BaseSection padding={false} background>
            <BaseContainer type={containerType}>
              {navigation}
            </BaseContainer>
          </BaseSection>
        )}

        {/* Main content area */}
        <main className="flex-1">
          {sidebar ? (
            <BaseContainer type={containerType}>
              <BaseGrid columns={4} gap="lg" className="min-h-full">
                {/* Sidebar */}
                <div className="col-span-1">
                  <BaseCard variant="padded" className="sticky top-4">
                    {sidebar}
                  </BaseCard>
                </div>
                
                {/* Content */}
                <div className="col-span-3">
                  {children}
                </div>
              </BaseGrid>
            </BaseContainer>
          ) : (
            <BaseContainer type={containerType}>
              {children}
            </BaseContainer>
          )}
        </main>

        {/* Footer */}
        {footer && (
          <BaseSection 
            padding 
            background
            className={cn(
              theme.currentTheme?.colors?.background?.secondary,
              theme.currentTheme?.colors?.border?.primary,
              'border-t mt-auto'
            )}
          >
            <BaseContainer type={containerType}>
              {footer}
            </BaseContainer>
          </BaseSection>
        )}
      </div>
    );
  };
}

/**
 * Factory presets for common component types
 */
export const integratedPresets = {
  // App components using app theme
  appCard: (config = {}) => createDesignSystemComponent({
    name: 'AppCard',
    baseComponent: BaseCard,
    themeContext: 'app',
    layoutType: 'card',
    variant: 'base',
    ...config,
  }),

  // Dev components using dev theme  
  devCard: (config = {}) => createDesignSystemComponent({
    name: 'DevCard',
    baseComponent: BaseCard,
    themeContext: 'dev',
    layoutType: 'card',
    variant: 'compact',
    ...config,
  }),

  // Timeline components
  timelineNode: (config = {}) => createIntegratedTimelineCard({
    themeContext: 'app',
    responsive: true,
    animationsEnabled: true,
    layoutVariant: 'base',
    ...config,
  }),

  // Data components with query integration
  dataCard: (config = {}) => createIntegratedQueryHook({
    themeContext: 'app',
    errorComponent: null,
    loadingComponent: null,
    ...config,
  }),

  // Form components
  standardForm: (config = {}) => createIntegratedForm({
    themeContext: 'app',
    layout: 'vertical',
    ...config,
  }),

  // Layout components
  appLayout: (config = {}) => createIntegratedLayout({
    name: 'AppLayout',
    type: 'page',
    containerType: 'page',
    themeContext: 'app',
    ...config,
  }),

  devLayout: (config = {}) => createIntegratedLayout({
    name: 'DevLayout',
    type: 'page', 
    containerType: 'content',
    themeContext: 'dev',
    ...config,
  }),
};

/**
 * Export all integrated factories and utilities
 */
const IntegratedFactory = {
  createDesignSystemComponent,
  createIntegratedTimelineCard,
  createIntegratedQueryHook,
  createIntegratedForm,
  createIntegratedLayout,
  integratedPresets,
};

export default IntegratedFactory;
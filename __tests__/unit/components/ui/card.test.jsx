/**
 * Unit Tests for Card UI Components
 * Tests all card component variants and their styling behaviors
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardAction, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';

describe('Card Component', () => {
  it('should render with default classes', () => {
    render(<Card data-testid="card">Card content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-slot', 'card');
    expect(card).toHaveClass('bg-card', 'text-card-foreground', 'flex', 'flex-col', 'gap-6', 'rounded-xl', 'border', 'py-6', 'shadow-sm');
  });

  it('should apply custom className', () => {
    render(<Card data-testid="card" className="custom-class">Card content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('bg-card'); // Should still have default classes
  });

  it('should pass through other props', () => {
    render(<Card data-testid="card" id="test-id" role="region">Card content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'test-id');
    expect(card).toHaveAttribute('role', 'region');
  });

  it('should render children correctly', () => {
    render(
      <Card data-testid="card">
        <div>Child content</div>
      </Card>
    );
    
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should merge custom classes with defaults correctly', () => {
    render(<Card data-testid="card" className="bg-red-500 p-4">Card content</Card>);
    
    const card = screen.getByTestId('card');
    // Should have both custom and default classes
    expect(card).toHaveClass('p-4');
    expect(card).toHaveClass('flex');
  });
});

describe('CardHeader Component', () => {
  it('should render with default classes', () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>);
    
    const header = screen.getByTestId('card-header');
    expect(header).toHaveAttribute('data-slot', 'card-header');
    expect(header).toHaveClass('@container/card-header', 'grid', 'auto-rows-min', 'grid-rows-[auto_auto]', 'items-start', 'gap-1.5', 'px-6');
  });

  it('should apply custom className', () => {
    render(<CardHeader data-testid="card-header" className="custom-header">Header content</CardHeader>);
    
    const header = screen.getByTestId('card-header');
    expect(header).toHaveClass('custom-header');
    expect(header).toHaveClass('grid');
  });

  it('should pass through other props', () => {
    render(<CardHeader data-testid="card-header" data-custom="value">Header content</CardHeader>);
    
    const header = screen.getByTestId('card-header');
    expect(header).toHaveAttribute('data-custom', 'value');
  });

  it('should render children correctly', () => {
    render(
      <CardHeader data-testid="card-header">
        <span>Header text</span>
      </CardHeader>
    );
    
    expect(screen.getByText('Header text')).toBeInTheDocument();
  });
});

describe('CardTitle Component', () => {
  it('should render with default classes', () => {
    render(<CardTitle data-testid="card-title">Title text</CardTitle>);
    
    const title = screen.getByTestId('card-title');
    expect(title).toHaveAttribute('data-slot', 'card-title');
    expect(title).toHaveClass('leading-none', 'font-semibold');
  });

  it('should apply custom className', () => {
    render(<CardTitle data-testid="card-title" className="text-lg">Title text</CardTitle>);
    
    const title = screen.getByTestId('card-title');
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
  });

  it('should pass through other props', () => {
    render(<CardTitle data-testid="card-title" role="heading">Title text</CardTitle>);
    
    const title = screen.getByTestId('card-title');
    expect(title).toHaveAttribute('role', 'heading');
  });

  it('should render text content', () => {
    render(<CardTitle data-testid="card-title">My Card Title</CardTitle>);
    
    expect(screen.getByText('My Card Title')).toBeInTheDocument();
  });
});

describe('CardDescription Component', () => {
  it('should render with default classes', () => {
    render(<CardDescription data-testid="card-description">Description text</CardDescription>);
    
    const description = screen.getByTestId('card-description');
    expect(description).toHaveAttribute('data-slot', 'card-description');
    expect(description).toHaveClass('text-muted-foreground', 'text-sm');
  });

  it('should apply custom className', () => {
    render(<CardDescription data-testid="card-description" className="text-base">Description text</CardDescription>);
    
    const description = screen.getByTestId('card-description');
    expect(description).toHaveClass('text-base');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('should pass through other props', () => {
    render(<CardDescription data-testid="card-description" data-info="desc">Description text</CardDescription>);
    
    const description = screen.getByTestId('card-description');
    expect(description).toHaveAttribute('data-info', 'desc');
  });

  it('should render text content', () => {
    render(<CardDescription data-testid="card-description">Card description here</CardDescription>);
    
    expect(screen.getByText('Card description here')).toBeInTheDocument();
  });
});

describe('CardAction Component', () => {
  it('should render with default classes', () => {
    render(<CardAction data-testid="card-action">Action content</CardAction>);
    
    const action = screen.getByTestId('card-action');
    expect(action).toHaveAttribute('data-slot', 'card-action');
    expect(action).toHaveClass('col-start-2', 'row-span-2', 'row-start-1', 'self-start', 'justify-self-end');
  });

  it('should apply custom className', () => {
    render(<CardAction data-testid="card-action" className="bg-blue-500">Action content</CardAction>);
    
    const action = screen.getByTestId('card-action');
    expect(action).toHaveClass('bg-blue-500');
    expect(action).toHaveClass('col-start-2');
  });

  it('should pass through other props', () => {
    render(<CardAction data-testid="card-action" onClick={() => {}}>Action content</CardAction>);
    
    const action = screen.getByTestId('card-action');
    expect(action).toHaveAttribute('data-testid', 'card-action');
  });

  it('should render children correctly', () => {
    render(
      <CardAction data-testid="card-action">
        <button>Click me</button>
      </CardAction>
    );
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

describe('CardContent Component', () => {
  it('should render with default classes', () => {
    render(<CardContent data-testid="card-content">Content text</CardContent>);
    
    const content = screen.getByTestId('card-content');
    expect(content).toHaveAttribute('data-slot', 'card-content');
    expect(content).toHaveClass('px-6');
  });

  it('should apply custom className', () => {
    render(<CardContent data-testid="card-content" className="py-4">Content text</CardContent>);
    
    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('py-4');
    expect(content).toHaveClass('px-6');
  });

  it('should pass through other props', () => {
    render(<CardContent data-testid="card-content" data-section="main">Content text</CardContent>);
    
    const content = screen.getByTestId('card-content');
    expect(content).toHaveAttribute('data-section', 'main');
  });

  it('should render children correctly', () => {
    render(
      <CardContent data-testid="card-content">
        <p>Main content paragraph</p>
      </CardContent>
    );
    
    expect(screen.getByText('Main content paragraph')).toBeInTheDocument();
  });
});

describe('CardFooter Component', () => {
  it('should render with default classes', () => {
    render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);
    
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveAttribute('data-slot', 'card-footer');
    expect(footer).toHaveClass('flex', 'items-center', 'px-6', '[.border-t]:pt-6');
  });

  it('should apply custom className', () => {
    render(<CardFooter data-testid="card-footer" className="justify-end">Footer content</CardFooter>);
    
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveClass('justify-end');
    expect(footer).toHaveClass('flex');
  });

  it('should pass through other props', () => {
    render(<CardFooter data-testid="card-footer" role="contentinfo">Footer content</CardFooter>);
    
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveAttribute('role', 'contentinfo');
  });

  it('should render children correctly', () => {
    render(
      <CardFooter data-testid="card-footer">
        <button>Save</button>
        <button>Cancel</button>
      </CardFooter>
    );
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

describe('Card Component Integration', () => {
  it('should render complete card structure correctly', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Test Card</CardTitle>
          <CardDescription data-testid="description">This is a test card</CardDescription>
          <CardAction data-testid="action">
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent data-testid="content">
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter data-testid="footer">
          <button>Footer button</button>
        </CardFooter>
      </Card>
    );

    // All components should be present
    expect(screen.getByTestId('full-card')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
    expect(screen.getByTestId('action')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // Text content should be rendered
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('This is a test card')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Footer button')).toBeInTheDocument();
  });

  it('should handle empty card correctly', () => {
    render(<Card data-testid="empty-card" />);
    
    const card = screen.getByTestId('empty-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-card');
  });

  it('should handle card with only some components', () => {
    render(
      <Card data-testid="partial-card">
        <CardTitle data-testid="title-only">Title Only</CardTitle>
        <CardContent data-testid="content-only">
          Content without header or footer
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId('partial-card')).toBeInTheDocument();
    expect(screen.getByTestId('title-only')).toBeInTheDocument();
    expect(screen.getByTestId('content-only')).toBeInTheDocument();
    expect(screen.getByText('Title Only')).toBeInTheDocument();
    expect(screen.getByText('Content without header or footer')).toBeInTheDocument();
  });

  it('should handle nested elements correctly', () => {
    render(
      <Card data-testid="nested-card">
        <CardContent data-testid="content">
          <div>
            <span>Nested</span>
            <strong>Elements</strong>
          </div>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Elements')).toBeInTheDocument();
  });

  it('should support complex class combinations', () => {
    render(
      <Card 
        data-testid="complex-card" 
        className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
      >
        <CardContent className="space-y-4">
          Complex styling test
        </CardContent>
      </Card>
    );

    const card = screen.getByTestId('complex-card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('dark:bg-gray-800');
    expect(card).toHaveClass('hover:shadow-lg');
    expect(card).toHaveClass('transition-shadow');
    // Should still maintain default classes
    expect(card).toHaveClass('rounded-xl');
  });
});
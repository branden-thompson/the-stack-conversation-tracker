/**
 * FilterControls Component
 * 
 * Styled filter controls for data tables and lists
 */

'use client';

import { cn } from '@/lib/utils';
import { THEME } from '@/lib/utils/ui-constants';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

export function FilterControls({
  filters = [],
  searchValue = '',
  searchPlaceholder = 'Search...',
  sortValue = '',
  sortOptions = [],
  onFilterChange,
  onSearchChange,
  onSortChange,
  className
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 border-b',
      THEME.colors.border.primary,
      THEME.colors.background.secondary,
      className
    )}>
      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter className={cn('w-4 h-4', THEME.colors.text.muted)} />
          {filters.map((filter, index) => (
            <select
              key={index}
              className={cn(
                'border rounded-md px-3 py-1.5 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                THEME.colors.background.primary,
                THEME.colors.border.secondary,
                THEME.colors.text.primary
              )}
              value={filter.value}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            >
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex-1 relative">
        <Search className={cn(
          'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
          THEME.colors.text.muted
        )} />
        <input
          type="text"
          className={cn(
            'w-full pl-9 pr-3 py-1.5 text-sm border rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'placeholder:text-gray-400',
            THEME.colors.background.primary,
            THEME.colors.border.secondary,
            THEME.colors.text.primary
          )}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Sort */}
      {sortOptions.length > 0 && (
        <div className="flex items-center gap-2">
          {sortValue === 'asc' ? (
            <SortAsc className={cn('w-4 h-4', THEME.colors.text.muted)} />
          ) : (
            <SortDesc className={cn('w-4 h-4', THEME.colors.text.muted)} />
          )}
          <select
            className={cn(
              'border rounded-md px-3 py-1.5 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              THEME.colors.background.primary,
              THEME.colors.border.secondary,
              THEME.colors.text.primary
            )}
            value={sortValue}
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/**
 * Event filter controls specifically for event tables
 */
export function EventFilterControls({
  eventTypes = [],
  filterType = 'all',
  query = '',
  sortDir = 'desc',
  onFilterTypeChange,
  onQueryChange,
  onSortChange,
  className
}) {
  const filters = [
    {
      key: 'type',
      value: filterType,
      options: [
        { value: 'all', label: 'All types' },
        ...eventTypes.map(type => ({ value: type, label: type }))
      ]
    }
  ];

  const sortOptions = [
    { value: 'desc', label: 'Newest first' },
    { value: 'asc', label: 'Oldest first' }
  ];

  return (
    <FilterControls
      filters={filters}
      searchValue={query}
      searchPlaceholder="Search in type or payload…"
      sortValue={sortDir}
      sortOptions={sortOptions}
      onFilterChange={(key, value) => {
        if (key === 'type') onFilterTypeChange?.(value);
      }}
      onSearchChange={onQueryChange}
      onSortChange={onSortChange}
      className={className}
    />
  );
}
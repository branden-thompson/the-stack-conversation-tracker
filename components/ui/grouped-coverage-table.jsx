/**
 * GroupedCoverageTable Component
 * 
 * A reusable table component for displaying code coverage data
 * grouped by functional areas with expand/collapse functionality
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, XCircle, FolderOpen, Folder, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoverageBar, CoverageBarMini } from '@/components/ui/coverage-bar';
import { StatusBadge, CoverageBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/utils/ui-constants';

/**
 * Get status icon based on coverage percentage
 */
function getStatusIcon(percentage) {
  if (percentage >= 90) return <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />;
  if (percentage >= 70) return <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />;
  return <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />;
}

/**
 * Get color class based on coverage percentage
 */
function getColorClass(percentage) {
  if (percentage >= 90) return 'text-green-600 dark:text-green-400';
  if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Determine test status from coverage percentage
 */
function getCoverageStatus(percentage) {
  if (percentage >= 90) return 'passing';
  if (percentage >= 70) return 'warning';
  return 'failing';
}

/**
 * Calculate aggregate coverage for a group of files
 */
function calculateGroupCoverage(files) {
  const totals = files.reduce((acc, file) => ({
    statements: {
      covered: acc.statements.covered + file.statements.covered,
      total: acc.statements.total + file.statements.total
    },
    branches: {
      covered: acc.branches.covered + file.branches.covered,
      total: acc.branches.total + file.branches.total
    },
    functions: {
      covered: acc.functions.covered + file.functions.covered,
      total: acc.functions.total + file.functions.total
    },
    lines: {
      covered: acc.lines.covered + file.lines.covered,
      total: acc.lines.total + file.lines.total
    },
    uncoveredLines: acc.uncoveredLines.concat(file.uncoveredLines || [])
  }), {
    statements: { covered: 0, total: 0 },
    branches: { covered: 0, total: 0 },
    functions: { covered: 0, total: 0 },
    lines: { covered: 0, total: 0 },
    uncoveredLines: []
  });

  // Count total uncovered lines (some files might not have the uncoveredLines array)
  const totalUncoveredLines = totals.uncoveredLines.length;

  return {
    statements: {
      ...totals.statements,
      percentage: totals.statements.total > 0 ? (totals.statements.covered / totals.statements.total) * 100 : 0
    },
    branches: {
      ...totals.branches,
      percentage: totals.branches.total > 0 ? (totals.branches.covered / totals.branches.total) * 100 : 0
    },
    functions: {
      ...totals.functions,
      percentage: totals.functions.total > 0 ? (totals.functions.covered / totals.functions.total) * 100 : 0
    },
    lines: {
      ...totals.lines,
      percentage: totals.lines.total > 0 ? (totals.lines.covered / totals.lines.total) * 100 : 0
    },
    totalUncoveredLines: totalUncoveredLines
  };
}

/**
 * Individual file row component
 */
function FileRow({ file, isNested = false }) {
  const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' };
  
  return (
    <tr className={cn(
      "border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors",
      isNested && "bg-zinc-50/50 dark:bg-zinc-800/25"
    )}>
      <td className="py-2" style={monoStyle}>
        <div className={cn("flex items-center gap-2", isNested ? "pl-10 pr-3" : "px-3")}>
          {getStatusIcon(file.statements.percentage)}
          <span className="text-xs text-zinc-700 dark:text-zinc-300">{file.name}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="space-y-1">
          <CoverageBar
            covered={file.statements.covered}
            total={file.statements.total}
            percentage={file.statements.percentage}
            height="sm"
            showValues={false}
            className="max-w-[120px]"
          />
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="space-y-1">
          <CoverageBar
            covered={file.branches.covered}
            total={file.branches.total}
            percentage={file.branches.percentage}
            height="sm"
            showValues={false}
            className="max-w-[120px]"
          />
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="space-y-1">
          <CoverageBar
            covered={file.functions.covered}
            total={file.functions.total}
            percentage={file.functions.percentage}
            height="sm"
            showValues={false}
            className="max-w-[120px]"
          />
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="space-y-1">
          <CoverageBar
            covered={file.lines.covered}
            total={file.lines.total}
            percentage={file.lines.percentage}
            height="sm"
            showValues={false}
            className="max-w-[120px]"
          />
        </div>
      </td>
      <td className="px-3 py-1.5 text-right" style={monoStyle}>
        {file.uncoveredLines && file.uncoveredLines.length > 0 ? (
          <div className="text-[11px] text-orange-600 dark:text-orange-400">
            {file.uncoveredLines.join(', ')}
          </div>
        ) : (
          <span className="text-green-600 dark:text-green-400 text-[11px]">
            All covered
          </span>
        )}
      </td>
    </tr>
  );
}

/**
 * Group row component with expand/collapse
 */
function GroupRow({ groupName, files, aggregateCoverage, isExpanded, onToggle }) {
  const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' };
  const overallCoverage = (
    aggregateCoverage.statements.percentage + 
    aggregateCoverage.branches.percentage + 
    aggregateCoverage.functions.percentage + 
    aggregateCoverage.lines.percentage
  ) / 4;
  
  return (
    <>
      <tr 
        className="border-b-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-3 py-2" style={monoStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {isExpanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />}
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {groupName}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ({files.length} files)
              </span>
            </div>
            <CoverageBadge
              value={overallCoverage}
              size="md"
              showLabel={false}
            />
          </div>
        </td>
        <td className="px-3 py-2 text-right" style={monoStyle}>
          <div className={cn("text-[16px] font-medium", getColorClass(aggregateCoverage.statements.percentage))}>
            {aggregateCoverage.statements.percentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {aggregateCoverage.statements.covered}/{aggregateCoverage.statements.total}
          </div>
        </td>
        <td className="px-3 py-2 text-right" style={monoStyle}>
          <div className={cn("text-[16px] font-medium", getColorClass(aggregateCoverage.branches.percentage))}>
            {aggregateCoverage.branches.percentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {aggregateCoverage.branches.covered}/{aggregateCoverage.branches.total}
          </div>
        </td>
        <td className="px-3 py-2 text-right" style={monoStyle}>
          <div className={cn("text-[16px] font-medium", getColorClass(aggregateCoverage.functions.percentage))}>
            {aggregateCoverage.functions.percentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {aggregateCoverage.functions.covered}/{aggregateCoverage.functions.total}
          </div>
        </td>
        <td className="px-3 py-2 text-right" style={monoStyle}>
          <div className={cn("text-[16px] font-medium", getColorClass(aggregateCoverage.lines.percentage))}>
            {aggregateCoverage.lines.percentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {aggregateCoverage.lines.covered}/{aggregateCoverage.lines.total}
          </div>
        </td>
        <td className="px-3 py-2 text-right" style={monoStyle}>
          {aggregateCoverage.totalUncoveredLines > 0 ? (
            <div className="text-orange-600 dark:text-orange-400">
              <div className="text-[14px]">
                {aggregateCoverage.totalUncoveredLines} lines
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                uncovered
              </div>
            </div>
          ) : (
            <span className="text-green-600 dark:text-green-400 text-[12px]">
              All covered
            </span>
          )}
        </td>
      </tr>
      {isExpanded && files.map((file, index) => (
        <FileRow key={index} file={file} isNested={true} />
      ))}
    </>
  );
}

/**
 * Main grouped coverage table component
 */
export function GroupedCoverageTable({ files = [], fileGroups = {}, onControlsReady }) {
  const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' };
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  
  // Organize files by groups
  const groupedData = useMemo(() => {
    const groups = {};
    const ungroupedFiles = [];
    
    // Create a map of file paths to file data for quick lookup
    const fileMap = {};
    files.forEach(file => {
      fileMap[file.path] = file;
    });
    
    // Process each group
    Object.entries(fileGroups).forEach(([groupName, filePaths]) => {
      const groupFiles = [];
      filePaths.forEach(path => {
        // Try to find file by path or by name
        const file = fileMap[path] || files.find(f => f.name === path || f.path.endsWith(path));
        if (file) {
          groupFiles.push(file);
        }
      });
      
      if (groupFiles.length > 0) {
        groups[groupName] = {
          files: groupFiles,
          coverage: calculateGroupCoverage(groupFiles)
        };
      }
    });
    
    // Find ungrouped files
    const groupedFilePaths = new Set();
    Object.values(fileGroups).flat().forEach(path => {
      groupedFilePaths.add(path);
    });
    
    files.forEach(file => {
      const isGrouped = Array.from(groupedFilePaths).some(path => 
        file.path === path || 
        file.name === path || 
        file.path.endsWith(path)
      );
      if (!isGrouped) {
        ungroupedFiles.push(file);
      }
    });
    
    // Add ungrouped files as a separate group if any exist
    if (ungroupedFiles.length > 0) {
      groups['Other'] = {
        files: ungroupedFiles,
        coverage: calculateGroupCoverage(ungroupedFiles)
      };
    }
    
    return groups;
  }, [files, fileGroups]);
  
  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };
  
  const toggleAll = () => {
    if (expandedGroups.size === Object.keys(groupedData).length) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(Object.keys(groupedData)));
    }
  };
  
  // Create the expand/collapse control button
  const expandControl = (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleAll}
      className="h-8"
    >
      {expandedGroups.size === Object.keys(groupedData).length ? (
        <>
          <Minimize2 className="w-3 h-3 mr-1.5" />
          Collapse All
        </>
      ) : (
        <>
          <Maximize2 className="w-3 h-3 mr-1.5" />
          Expand All
        </>
      )}
    </Button>
  );
  
  // Pass control to parent if callback provided - use useEffect to avoid render-time state updates
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(expandControl);
    }
  }, [expandedGroups.size, Object.keys(groupedData).length]);
  
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full">
        <thead>
          <tr className={`border-b-2 ${THEME.colors.border.secondary}`}>
            <th 
              className={`px-3 py-2 text-xs font-semibold ${THEME.colors.text.secondary} text-left`}
              style={monoStyle}
            >
              File / Group
            </th>
            <th 
              className={`px-3 py-2 text-xs font-semibold ${THEME.colors.text.secondary} text-right`}
              style={monoStyle}
            >
              Statements
            </th>
            <th 
              className={`px-3 py-2 text-xs font-semibold ${THEME.colors.text.secondary} text-right`}
              style={monoStyle}
            >
              Branches
            </th>
            <th 
              className={`px-3 py-2 text-xs font-semibold ${THEME.colors.text.secondary} text-right`}
              style={monoStyle}
            >
              Functions
            </th>
            <th 
              className={`px-3 py-2 text-xs font-semibold ${THEME.colors.text.secondary} text-right`}
              style={monoStyle}
            >
              Lines
            </th>
            <th 
              className={`px-3 py-2 text-xs font-semibold ${THEME.colors.text.secondary} text-right`}
              style={monoStyle}
            >
              Uncovered
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedData).map(([groupName, group]) => (
            <GroupRow
              key={groupName}
              groupName={groupName}
              files={group.files}
              aggregateCoverage={group.coverage}
              isExpanded={expandedGroups.has(groupName)}
              onToggle={() => toggleGroup(groupName)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
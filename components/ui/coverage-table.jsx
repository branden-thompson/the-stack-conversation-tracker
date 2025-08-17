/**
 * CoverageTable Component
 * 
 * A reusable, compact table component for displaying code coverage data
 * with proper monospace font rendering
 */

'use client';

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
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
 * Individual file row component
 */
function FileRow({ file }) {
  const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' };
  
  return (
    <tr className={`border-b ${THEME.colors.border.primary} ${THEME.colors.background.hover} ${THEME.transitions.colors}`}>
      <td className="px-3 py-1.5" style={monoStyle}>
        <div className="flex items-center gap-2">
          {getStatusIcon(file.statements.percentage)}
          <span className={`text-xs ${THEME.colors.text.secondary}`}>{file.name}</span>
        </div>
      </td>
      <td className="px-3 py-1.5 text-right" style={monoStyle}>
        <div className={cn("text-[15px]", getColorClass(file.statements.percentage))}>
          {file.statements.percentage.toFixed(1)}%
        </div>
        <div className={`text-[10px] ${THEME.colors.text.muted}`}>
          {file.statements.covered}/{file.statements.total}
        </div>
      </td>
      <td className="px-3 py-1.5 text-right" style={monoStyle}>
        <div className={cn("text-[15px]", getColorClass(file.branches.percentage))}>
          {file.branches.percentage.toFixed(1)}%
        </div>
        <div className={`text-[10px] ${THEME.colors.text.muted}`}>
          {file.branches.covered}/{file.branches.total}
        </div>
      </td>
      <td className="px-3 py-1.5 text-right" style={monoStyle}>
        <div className={cn("text-[15px]", getColorClass(file.functions.percentage))}>
          {file.functions.percentage.toFixed(1)}%
        </div>
        <div className={`text-[10px] ${THEME.colors.text.muted}`}>
          {file.functions.covered}/{file.functions.total}
        </div>
      </td>
      <td className="px-3 py-1.5 text-right" style={monoStyle}>
        <div className={cn("text-[15px]", getColorClass(file.lines.percentage))}>
          {file.lines.percentage.toFixed(1)}%
        </div>
        <div className={`text-[10px] ${THEME.colors.text.muted}`}>
          {file.lines.covered}/{file.lines.total}
        </div>
      </td>
      <td className="px-3 py-1.5 text-right" style={monoStyle}>
        {file.uncoveredLines.length > 0 ? (
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
 * Main coverage table component
 */
export function CoverageTable({ files = [] }) {
  const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' };
  
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full">
        <thead>
          <tr className={`border-b-2 ${THEME.colors.border.secondary}`}>
            <th 
              className={`px-3 py-2 text-xs font-semibold ${THEME.colors.text.secondary} text-left`}
              style={monoStyle}
            >
              File
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
          {files.map((file, index) => (
            <FileRow key={index} file={file} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Coverage insights component
 */
export function CoverageInsights({ files = [] }) {
  const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' };
  
  const highCoverageFiles = files.filter(f => f.statements.percentage >= 90);
  const lowCoverageFiles = files.filter(f => f.statements.percentage < 70);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 
          className={`font-semibold ${THEME.colors.text.secondary} mb-2 text-sm`}
          style={monoStyle}
        >
          High Coverage Files (≥90%)
        </h4>
        <ul className="space-y-1">
          {highCoverageFiles.length > 0 ? (
            highCoverageFiles.map((file, index) => (
              <li 
                key={index} 
                className="flex items-center gap-2 text-xs"
                style={monoStyle}
              >
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className={`truncate flex-1 ${THEME.colors.text.secondary}`}>
                  {file.name}
                </span>
                <span className="text-green-600 dark:text-green-400 text-[13px]">
                  {file.statements.percentage.toFixed(1)}%
                </span>
              </li>
            ))
          ) : (
            <li className={`text-xs ${THEME.colors.text.muted}`} style={monoStyle}>
              No files with ≥90% coverage
            </li>
          )}
        </ul>
      </div>
      
      <div>
        <h4 
          className={`font-semibold ${THEME.colors.text.secondary} mb-2 text-sm`}
          style={monoStyle}
        >
          Needs Attention (&lt;70%)
        </h4>
        <ul className="space-y-1">
          {lowCoverageFiles.length > 0 ? (
            lowCoverageFiles.map((file, index) => (
              <li 
                key={index} 
                className="flex items-center gap-2 text-xs"
                style={monoStyle}
              >
                <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                <span className={`truncate flex-1 ${THEME.colors.text.secondary}`}>
                  {file.name}
                </span>
                <span className="text-red-600 dark:text-red-400 text-[13px]">
                  {file.statements.percentage.toFixed(1)}%
                </span>
              </li>
            ))
          ) : (
            <li className={`text-xs ${THEME.colors.text.muted}`} style={monoStyle}>
              All files have ≥70% coverage
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
/**
 * useAutosizeTextArea
 * Auto-resizes a textarea vertically to fit its content.
 *
 * Usage:
 * const ref = useRef(null);
 * useAutosizeTextArea(ref, value, { minRows: 3, maxRows: 12 });
 * <textarea ref={ref} value={value} onChange={...} />
 */

import { useLayoutEffect, useEffect } from 'react';

function getLineHeightPx(el) {
  const cs = window.getComputedStyle(el);
  let lh = cs.lineHeight;
  if (!lh || lh === 'normal') {
    // Reasonable fallback: 1.2 * font-size
    const fs = parseFloat(cs.fontSize) || 16;
    return Math.round(1.2 * fs);
  }
  return parseFloat(lh);
}

export function useAutosizeTextArea(
  textareaRef,
  value,
  {
    minRows = 1,
    maxRows = null, // e.g. 12; null = unlimited
    extraPadding = 0, // px to add after measuring (usually 0)
  } = {}
) {
  useLayoutEffect(() => {
    const el = textareaRef?.current;
    if (!el) return;

    // Temporarily reset height to auto to measure the full scrollHeight
    el.style.height = 'auto';

    // Compute the natural height
    const { borderTopWidth, borderBottomWidth, paddingTop, paddingBottom } =
      window.getComputedStyle(el);

    const borders =
      parseFloat(borderTopWidth || '0') + parseFloat(borderBottomWidth || '0');
    const paddings =
      parseFloat(paddingTop || '0') + parseFloat(paddingBottom || '0');

    const contentHeight = el.scrollHeight;
    const lineHeight = getLineHeightPx(el);

    // Convert min/max rows into pixel constraints
    const minPx = Math.max(minRows * lineHeight + paddings + borders, 0);
    const maxPx =
      maxRows && Number.isFinite(maxRows)
        ? Math.max(maxRows * lineHeight + paddings + borders, 0)
        : null;

    // Target height, clamped
    let target = contentHeight + extraPadding;
    if (maxPx != null) target = Math.min(target, maxPx);
    target = Math.max(target, minPx);

    el.style.height = `${Math.ceil(target)}px`;
    el.style.overflowY = maxPx && contentHeight > maxPx ? 'auto' : 'hidden';
  }, [textareaRef, value, minRows, maxRows, extraPadding]);

  // Recalculate on window resize (font metrics/layout can change)
  useEffect(() => {
    const el = textareaRef?.current;
    if (!el) return;
    const handler = () => {
      // Trigger the layout effect by forcing a reflow via setting height to auto then back
      const v = el.value;
      const prev = el.style.height;
      el.style.height = 'auto';
      // read to force reflow
      el.offsetHeight; // force reflow
      el.style.height = prev;
      // Not strictly necessary; the layout effect will re-run when value changes
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [textareaRef]);
}
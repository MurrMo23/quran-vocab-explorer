// Client-side export helpers for the read-only admin browsers.

type CsvValue = string | number | boolean | null | undefined;

const escapeCsv = (value: CsvValue): string => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  // Always quote; double any embedded quotes. Safe for commas, newlines and Arabic text.
  return `"${s.replace(/"/g, '""')}"`;
};

export const toCsv = (headers: string[], rows: CsvValue[][]): string =>
  [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');

export const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click has been handled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const downloadJson = (filename: string, data: unknown) =>
  downloadFile(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');

// The UTF-8 BOM makes Excel detect the encoding so Arabic displays correctly.
export const downloadCsv = (filename: string, headers: string[], rows: CsvValue[][]) =>
  downloadFile(filename, '﻿' + toCsv(headers, rows), 'text/csv;charset=utf-8');

export const dateStamp = () => new Date().toISOString().slice(0, 10);

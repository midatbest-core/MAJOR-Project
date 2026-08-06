/**
 * Frontend Formatter Utilities (Chapter 5 Section 5.4)
 */

export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
};

export const formatDuration = (durationStr) => {
  if (!durationStr) return '00:00';
  if (typeof durationStr === 'number') {
    const mins = Math.floor(durationStr / 60);
    const secs = Math.floor(durationStr % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return durationStr;
};

export const downloadFile = (content, fileName, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

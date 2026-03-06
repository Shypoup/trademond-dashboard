export const displayBilingual = (val: any): string => {
  if (!val) return 'N/A';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.en || val.ar || 'N/A';
  }
  return String(val);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return 'N/A';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

export const getStatusStyles = (status: string): string => {
  const s = status?.toLowerCase();
  if (['approved', 'active', 'published', 'success'].includes(s)) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (['pending', 'draft', 'waiting'].includes(s)) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (['rejected', 'inactive', 'failed', 'suspended', 'banned'].includes(s)) return 'bg-rose-50 text-rose-600 border-rose-100';
  return 'bg-slate-50 text-slate-500 border-slate-100';
};

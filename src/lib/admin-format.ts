import type { Batch, NamedRef } from '@/types/admin';

export function readReferenceLabel(
  value: string | NamedRef | undefined,
  fallback = 'Not assigned'
) {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.name ?? value.label ?? fallback;
}

export function readReferenceId(value: string | NamedRef | undefined) {
  if (!value) {
    return '';
  }

  return typeof value === 'string' ? value : value._id;
}

export function formatSchedule(batch: Batch) {
  return `${batch.schedule.days.join(', ')} • ${batch.schedule.startTime} - ${batch.schedule.endTime}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

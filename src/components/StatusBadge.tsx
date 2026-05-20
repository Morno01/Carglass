'use client';

import { Status } from '@/lib/types';

interface Props {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<Status, { label: string; classes: string; dot: string }> = {
  Afventer: {
    label: 'Afventer',
    classes: 'bg-slate-100 text-slate-600 border border-slate-300',
    dot: 'bg-slate-400',
  },
  'I gang': {
    label: 'I gang',
    classes: 'bg-blue-50 text-blue-700 border border-blue-300',
    dot: 'bg-blue-500',
  },
  Afsluttet: {
    label: 'Afsluttet',
    classes: 'bg-green-50 text-green-700 border border-green-300',
    dot: 'bg-green-500',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 rounded',
  md: 'text-sm px-3 py-1 rounded-md',
  lg: 'text-base px-4 py-1.5 rounded-lg font-semibold',
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const { label, classes, dot } = config[status];
  return (
    <span className={`inline-flex items-center font-medium ${classes} ${sizeClasses[size]}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

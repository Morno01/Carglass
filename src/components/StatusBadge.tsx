'use client';

import { Status } from '@/lib/types';

interface Props {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<Status, { label: string; classes: string }> = {
  Afventer: {
    label: 'Afventer',
    classes: 'bg-amber-100 text-amber-800 border border-amber-300',
  },
  'I gang': {
    label: 'I gang',
    classes: 'bg-blue-100 text-blue-800 border border-blue-300',
  },
  Færdig: {
    label: 'Færdig',
    classes: 'bg-green-100 text-green-800 border border-green-300',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 rounded',
  md: 'text-sm px-3 py-1 rounded-md',
  lg: 'text-base px-4 py-1.5 rounded-lg font-semibold',
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const { label, classes } = config[status];
  return (
    <span className={`inline-flex items-center font-medium ${classes} ${sizeClasses[size]}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === 'Afventer' ? 'bg-amber-500' :
        status === 'I gang'   ? 'bg-blue-500'  :
                                'bg-green-500'
      }`} />
      {label}
    </span>
  );
}

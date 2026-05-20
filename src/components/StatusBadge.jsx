'use client';

const config = {
  Afventer: {
    label: 'Afventer',
    classes: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
  },
  'I gang': {
    label: 'I gang',
    classes: 'bg-green-100 text-green-700 border border-green-200',
    dot: 'bg-green-500',
  },
  Afsluttet: {
    label: 'Afsluttet',
    classes: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 rounded',
  md: 'text-sm px-3 py-1 rounded-md',
  lg: 'text-base px-4 py-1.5 rounded-lg font-semibold',
};

export default function StatusBadge({ status, size = 'md', small }) {
  const { label, classes, dot } = config[status] ?? config['Afventer'];
  const s = small ? 'sm' : size;
  return (
    <span className={`inline-flex items-center font-medium ${classes} ${sizeClasses[s]}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

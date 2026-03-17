import React from 'react';

type StatusType = 'active' | 'archived' | 'pending' | 'success' | 'warning' | 'error';

interface StatusBadgeProps {
    status: StatusType;
    label: string;
    className?: string;
}

const statusStyles: Record<StatusType, string> = {
    active: 'bg-primary-500/10 text-primary-300 border-primary-500/20',
    archived: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-error/10 text-error border-error/20',
};

export const StatusBadge = ({ status, label, className = '' }: StatusBadgeProps) => {
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles[status]} ${className}`}>
            {label}
        </span>
    );
};

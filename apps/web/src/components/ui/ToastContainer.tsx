'use client';

import * as React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { useUIStore, ToastType } from '@/store/uiStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="text-success" size={20} />,
    error: <AlertCircle className="text-error" size={20} />,
    warning: <AlertTriangle className="text-warning" size={20} />,
    info: <Info className="text-primary-300" size={20} />,
};

const toastStyles: Record<ToastType, string> = {
    success: 'border-success/20 bg-success/5 shadow-glow-primary',
    error: 'border-error/20 bg-error/5',
    warning: 'border-warning/20 bg-warning/5',
    info: 'border-primary-500/20 bg-primary-800/80',
};

export function ToastContainer() {
    const { toasts, removeToast } = useUIStore();

    return (
        <Toast.Provider swipeDirection="right">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast.Root
                        key={toast.id}
                        className={`pointer-events-auto relative flex w-full max-w-sm overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all ${toastStyles[toast.type]}`}
                        onOpenChange={(open) => {
                            if (!open) removeToast(toast.id);
                        }}
                        asChild
                    >
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        >
                            <div className="flex w-full items-start gap-3">
                                <div className="mt-0.5">{icons[toast.type]}</div>
                                <div className="flex-1 space-y-1">
                                    {toast.title && (
                                        <Toast.Title className="text-sm font-bold text-white">
                                            {toast.title}
                                        </Toast.Title>
                                    )}
                                    <Toast.Description className="text-xs font-medium text-neutral-300 leading-relaxed">
                                        {toast.message}
                                    </Toast.Description>
                                </div>
                                <Toast.Close className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white transition-colors">
                                    <X size={16} />
                                </Toast.Close>
                            </div>
                        </motion.div>
                    </Toast.Root>
                ))}
            </AnimatePresence>
            <Toast.Viewport className="fixed bottom-0 right-0 z-[100] m-0 flex flex-col gap-2 p-6 outline-none transition-all" />
        </Toast.Provider>
    );
}

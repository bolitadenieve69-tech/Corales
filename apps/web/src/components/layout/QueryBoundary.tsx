'use client';

import React, { ReactNode } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface QueryBoundaryProps {
  isLoading: boolean;
  error: any;
  children: ReactNode;
  loadingFallback?: ReactNode;
  onRetry?: () => void;
}

export function QueryBoundary({
  isLoading,
  error,
  children,
  loadingFallback,
  onRetry,
}: QueryBoundaryProps) {
  if (isLoading) {
    return loadingFallback || (
      <div className="flex flex-col items-center justify-center p-12 min-h-[200px] animate-in fade-in">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={32} />
        <p className="text-neutral-500 font-medium">Sincronizando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 border border-red-100 rounded-[2rem] text-center">
        <AlertCircle className="text-red-500 mb-4" size={40} />
        <h3 className="text-xl font-display font-bold text-red-900 mb-2">Error de Sincronización</h3>
        <p className="text-red-700 max-w-sm mb-6">
          {error.message || 'No se pudieron cargar los datos. Revisa tu conexión.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all shadow-md active:scale-95"
          >
            <RefreshCw size={18} /> Reintentar
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

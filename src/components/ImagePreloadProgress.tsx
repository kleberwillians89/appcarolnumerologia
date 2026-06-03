import React from 'react';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { PreloadProgress } from '../utils/imagePreloaderWithRetry';

interface ImagePreloadProgressProps {
  progress: PreloadProgress | null;
  isVisible: boolean;
}

export const ImagePreloadProgress: React.FC<ImagePreloadProgressProps> = ({
  progress,
  isVisible
}) => {
  if (!isVisible || !progress) return null;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'retrying':
        return <RefreshCw className="w-5 h-5 animate-spin text-yellow-400" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'loading':
        return 'Carregando...';
      case 'success':
        return 'Carregada!';
      case 'error':
        return 'Erro';
      case 'retrying':
        return `Tentando novamente (${progress.retryCount}/3)`;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'loading':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'retrying':
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-700">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white mb-2">Preparando PDF</h3>
          <p className="text-slate-400 text-sm">Carregando recursos necessários...</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>{progress.current} de {progress.total}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getStatusColor()}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Current Image Status */}
        <div className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-4">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{progress.currentImage}</p>
            <p className="text-slate-400 text-sm">{getStatusText()}</p>
          </div>
        </div>

        {/* Retry Info */}
        {progress.status === 'retrying' && (
          <div className="mt-4 text-center text-yellow-400 text-sm">
            ⚠️ Conexão instável. Tentando novamente...
          </div>
        )}
      </div>
    </div>
  );
};

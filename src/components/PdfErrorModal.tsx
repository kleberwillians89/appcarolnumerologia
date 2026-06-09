import React from 'react';
import { AlertCircle, RefreshCw, X, FileWarning, Wifi, Image } from 'lucide-react';
import { Button } from './ui/button';

export interface PdfError {
  type: 'image_load' | 'generation' | 'network' | 'validation' | 'unknown';
  message: string;
  details?: string;
  failedImages?: string[];
  retryCount?: number;
}


interface PdfErrorModalProps {
  error: PdfError | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const PdfErrorModal: React.FC<PdfErrorModalProps> = ({
  error,
  isOpen,
  onClose,
  onRetry
}) => {
  if (!isOpen || !error) return null;

  const getErrorIcon = () => {
    switch (error.type) {
      case 'image_load': return <Image className="w-12 h-12 text-red-500" />;
      case 'network': return <Wifi className="w-12 h-12 text-orange-500" />;
      case 'validation': return <AlertCircle className="w-12 h-12 text-blue-500" />;
      case 'generation': return <FileWarning className="w-12 h-12 text-yellow-500" />;
      default: return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
  };


  const getTroubleshootingSteps = () => {
    switch (error.type) {
      case 'validation':
        return [
          'Certifique-se de que preencheu seu nome completo',
          'Verifique se a data de nascimento está correta (formato DD/MM/AAAA)',
          'Preencha todos os campos obrigatórios do formulário',
          'Tente calcular novamente antes de gerar o PDF'
        ];
      case 'image_load':
        return [
          'Verifique sua conexão com a internet',
          'Aguarde alguns segundos e tente novamente',
          'Limpe o cache do navegador (Ctrl+Shift+Del)',
          'Tente usar outro navegador (Chrome, Firefox, Edge)'
        ];
      case 'network':
        return [
          'Verifique se está conectado à internet',
          'Desative VPN ou proxy temporariamente',
          'Tente novamente em alguns minutos',
          'Verifique se o firewall não está bloqueando'
        ];
      case 'generation':
        return [
          'Verifique se todos os campos foram preenchidos',
          'Tente gerar o PDF novamente',
          'Feche outras abas do navegador',
          'Reinicie o navegador se o problema persistir'
        ];
      default:
        return [
          'Recarregue a página (F5)',
          'Limpe o cache do navegador',
          'Tente novamente em alguns minutos',
          'Entre em contato com o suporte se persistir'
        ];
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {getErrorIcon()}
            <div>
              <h2 className="text-2xl font-bold text-white">Erro ao Gerar PDF</h2>
              <p className="text-slate-400 text-sm">Algo deu errado durante a geração</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Details */}
        <div className="p-6 space-y-6">
          {/* Main Error Message */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">Mensagem de Erro:</h3>
            <p className="text-white">{error.message}</p>
            {error.details && (
              <p className="text-slate-300 text-sm mt-2">{error.details}</p>
            )}
          </div>

          {/* Failed Images */}
          {error.failedImages && error.failedImages.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h3 className="text-orange-400 font-semibold mb-2">Imagens que falharam:</h3>
              <ul className="space-y-1">
                {error.failedImages.map((img, idx) => (
                  <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    {img}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Retry Count */}
          {error.retryCount !== undefined && error.retryCount > 0 && (
            <div className="text-slate-400 text-sm">
              Tentativas realizadas: {error.retryCount}
            </div>
          )}

          {/* Troubleshooting Steps */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-3">🔧 Passos para Resolver:</h3>
            <ol className="space-y-2">
              {getTroubleshootingSteps().map((step, idx) => (
                <li key={idx} className="text-slate-300 text-sm flex gap-3">
                  <span className="font-bold text-yellow-400">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <Button onClick={onRetry} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

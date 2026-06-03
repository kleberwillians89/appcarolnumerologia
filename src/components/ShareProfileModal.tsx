import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  qrCodeUrl: string;
}

export const ShareProfileModal = ({ isOpen, onClose, shareUrl, qrCodeUrl }: ShareProfileModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'perfil-qrcode.png';
    link.click();
    toast.success('QR Code baixado!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Perfil Numerológico',
          text: 'Confira meu perfil numerológico completo!',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Perfil
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Link de Compartilhamento</label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={handleCopy} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-1">✓ Copiado!</p>}
          </div>

          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-medium">QR Code</label>
            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border rounded-lg" />
            <div className="flex gap-2">
              <Button onClick={handleDownloadQR} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar QR Code
              </Button>
              <Button onClick={handleShare} size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Qualquer pessoa com este link poderá visualizar seu perfil numerológico completo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

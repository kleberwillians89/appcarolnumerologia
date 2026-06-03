import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, X, Maximize, Printer, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PdfThumbnails } from './PdfThumbnails';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: any;
  fileName: string;
}

export function PdfPreviewModal({ isOpen, onClose, pdfDoc, fileName }: PdfPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [searchText, setSearchText] = useState('');
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen && pdfDoc) {
      const pages = pdfDoc.internal.pages.length - 1;
      setTotalPages(pages);
      
      const pdfBlob = pdfDoc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [isOpen, pdfDoc]);

  // Navegação por teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevPage();
          break;
        case 'ArrowRight':
          nextPage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'Escape':
          if (isFullscreen) toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, zoom, isFullscreen]);

  const handleDownload = () => {
    pdfDoc.save(fileName);
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const zoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25);
  };

  const zoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0" ref={containerRef}>
        <DialogHeader className="px-6 py-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Preview - {fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowThumbnails(!showThumbnails)}>
                {showThumbnails ? 'Ocultar' : 'Mostrar'} Miniaturas
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {showThumbnails && (
            <PdfThumbnails
              pdfDoc={pdfDoc}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageSelect={setCurrentPage}
            />
          )}

          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar texto no PDF..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <ScrollArea className="flex-1 p-6">
              {pdfUrl ? (
                <div className="flex justify-center">
                  <iframe
                    ref={iframeRef}
                    src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}&search=${searchText}`}
                    className="w-full h-[65vh] border-0"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Carregando preview...</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="border-t px-6 py-3 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-16 text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4 mr-2" />
              Tela Cheia
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

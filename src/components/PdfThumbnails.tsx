import { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PdfThumbnailsProps {
  pdfDoc: any;
  totalPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
}

export function PdfThumbnails({ pdfDoc, totalPages, currentPage, onPageSelect }: PdfThumbnailsProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (!pdfDoc) return;

    const generateThumbnails = async () => {
      const thumbs: string[] = [];
      
      for (let i = 1; i <= totalPages; i++) {
        const canvas = canvasRefs.current[i - 1];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Simular miniatura com fundo branco e número da página
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 120, 160);
            ctx.strokeStyle = '#e5e7eb';
            ctx.strokeRect(0, 0, 120, 160);
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Página ${i}`, 60, 80);
            
            thumbs.push(canvas.toDataURL());
          }
        }
      }
      
      setThumbnails(thumbs);
    };

    generateThumbnails();
  }, [pdfDoc, totalPages]);

  return (
    <ScrollArea className="h-full w-40 border-r bg-gray-50">
      <div className="p-2 space-y-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <div
            key={pageNum}
            onClick={() => onPageSelect(pageNum)}
            className={cn(
              "cursor-pointer border-2 rounded transition-all hover:border-blue-400",
              currentPage === pageNum ? "border-blue-600 shadow-lg" : "border-gray-300"
            )}
          >
            <canvas
              ref={(el) => (canvasRefs.current[pageNum - 1] = el)}
              width={120}
              height={160}
              className="w-full"
            />
            <div className="text-xs text-center py-1 bg-white">{pageNum}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

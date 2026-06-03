import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface NumberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  number: number;
  title: string;
  description: string;
  type: string;
}

const numberImages: { [key: number]: string } = {
  1: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705239738_8c1e7e5f.webp',
  2: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705240588_3062b93d.webp',
  3: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705241399_eb7da42b.webp',
  4: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705242879_ba1dcea7.webp',
  5: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705243724_c5f22f56.webp',
  6: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705244683_6981bbdf.webp',
  7: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705245948_59f4a9c5.webp',
  8: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705247082_7020aeda.webp',
  9: 'https://d64gsuwffb70l.cloudfront.net/68f23a4f2afd8d6401126b42_1760705248212_dc1112a4.webp'
};

export default function NumberDetailModal({ isOpen, onClose, number, title, description, type }: NumberDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-400/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Badge className="bg-purple-500 text-white px-3 py-1 text-lg">{number}</Badge>
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          {numberImages[number] && (
            <img 
              src={numberImages[number]} 
              alt={`Número ${number}`}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-purple-200 mb-3">Descrição Completa</h3>
              <p className="text-purple-100 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

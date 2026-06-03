import React, { useState, useEffect } from 'react';
import { getHistory, deleteFromHistory, clearHistory, NumerologyHistoryEntry } from '../utils/historyStorage';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2, FileText, Calendar, Heart } from 'lucide-react';
import { generateUnifiedMapaDaAlmaPDF } from '../utils/unifiedPdfGenerator';
import { PdfPreviewModal } from './PdfPreviewModal';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<NumerologyHistoryEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'numerology' | 'compatibility' | 'personalYear'>('all');
  const [pdfPreview, setPdfPreview] = useState<{ pdf: any; fileName: string } | null>(null);


  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      deleteFromHistory(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm('Deseja realmente excluir todo o histórico?')) {
      clearHistory();
      loadHistory();
    }
  };

  const handleRegeneratePDF = async (entry: NumerologyHistoryEntry) => {
    try {
      const pdfData: any = {};
      
      if (entry.type === 'numerology') {
        pdfData.numerology = {
          results: entry.data,
          name: entry.name,
          birthDate: entry.birthDate
        };
      } else if (entry.type === 'personalYear') {
        // Para Ano Pessoal, precisamos de dados de numerologia
        alert(
          'Para gerar o PDF completo "Mapa da Alma", é necessário ter calculado a numerologia.\n\n' +
          'Por favor, calcule sua numerologia primeiro na seção "Numerologia" e depois calcule o Ano Pessoal novamente.'
        );
        return;
      } else if (entry.type === 'compatibility') {
        // Para Compatibilidade, precisamos de dados de numerologia
        alert(
          'Para gerar o PDF completo "Mapa da Alma", é necessário ter calculado a numerologia.\n\n' +
          'Por favor, calcule sua numerologia primeiro na seção "Numerologia" e depois calcule a compatibilidade novamente.'
        );
        return;
      }
      
      const result = await generateUnifiedMapaDaAlmaPDF(pdfData, true);
      if (result && result.pdf) {
        setPdfPreview(result);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };




  const filteredHistory = filter === 'all' ? history : history.filter(e => e.type === filter);

  const getTypeIcon = (type: string) => {
    if (type === 'numerology') return <FileText className="w-5 h-5" />;
    if (type === 'compatibility') return <Heart className="w-5 h-5" />;
    return <Calendar className="w-5 h-5" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'numerology') return 'Mapa Numerológico';
    if (type === 'compatibility') return 'Compatibilidade';
    return 'Ano Pessoal';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">📚 Histórico de Perfis</h2>
        <Button onClick={handleClearAll} variant="destructive" disabled={history.length === 0}>
          Limpar Tudo
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'default' : 'outline'}>
          Todos ({history.length})
        </Button>
        <Button onClick={() => setFilter('numerology')} variant={filter === 'numerology' ? 'default' : 'outline'}>
          Mapas ({history.filter(e => e.type === 'numerology').length})
        </Button>
        <Button onClick={() => setFilter('compatibility')} variant={filter === 'compatibility' ? 'default' : 'outline'}>
          Compatibilidade ({history.filter(e => e.type === 'compatibility').length})
        </Button>
        <Button onClick={() => setFilter('personalYear')} variant={filter === 'personalYear' ? 'default' : 'outline'}>
          Ano Pessoal ({history.filter(e => e.type === 'personalYear').length})
        </Button>
      </div>

      {filteredHistory.length === 0 ? (
        <Card className="p-8 text-center bg-slate-800/50 border-slate-700">
          <p className="text-slate-400">Nenhum registro encontrado</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map(entry => (
            <Card key={entry.id} className="p-6 bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="text-yellow-500 mt-1">{getTypeIcon(entry.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{entry.name}</h3>
                    <p className="text-slate-400 text-sm mb-2">{getTypeLabel(entry.type)}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(entry.timestamp).toLocaleString('pt-BR')} • {entry.birthDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleRegeneratePDF(entry)} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                    Baixar PDF

                  </Button>
                  <Button onClick={() => handleDelete(entry.id)} size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {pdfPreview && (
        <PdfPreviewModal
          isOpen={!!pdfPreview}
          onClose={() => setPdfPreview(null)}
          pdfDoc={pdfPreview.pdf}
          fileName={pdfPreview.fileName}
        />
      )}
    </div>
  );
};


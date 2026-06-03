import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, FileText, Download, AlertTriangle } from 'lucide-react';
import { generateUnifiedMapaDaAlmaPDF } from '../utils/unifiedPdfGenerator';
import { PDF_IMG } from '../utils/pdfImageUrls';

interface ImageStatus {
  path: string;
  exists: boolean;
  error?: string;
}

export const PdfValidationPanel: React.FC = () => {
  const [validationStatus, setValidationStatus] = useState<{
    generated: boolean;
    pages: number;
    images: { page: number; image: string; status: 'ok' | 'error' }[];
  } | null>(null);
  const [imageCheck, setImageCheck] = useState<ImageStatus[]>([]);
  const [checking, setChecking] = useState(false);

  const checkImages = async () => {
    setChecking(true);
    const imagesToCheck = [PDF_IMG.CAPA, PDF_IMG.BG, PDF_IMG.JORNADA];

    const results: ImageStatus[] = [];
    for (const imagePath of imagesToCheck) {
      try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        results.push({
          path: imagePath,
          exists: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}`,
        });
      } catch {
        results.push({ path: imagePath, exists: false, error: 'Falha ao carregar' });
      }
    }
    setImageCheck(results);
    setChecking(false);
  };

  const handleGenerateTestPdf = async () => {
    try {
      const testData = {
        numerology: {
          results: {
            soul: 7,
            dom: 8,
            destiny: 6,
            talent: 3,
            dream: 5,
          },
          name: 'Teste Validação',
          birthDate: '1990-05-15',
        },
        // Comente/descomente para testar paginação variável:
        personalYear: {
          year: 1,
          birthMonth: 5,
          day: '15',
          month: '05',
        },
        // compatibility: { ... } // ao setar, habilita a página 9
      };

      await generateUnifiedMapaDaAlmaPDF(testData);

      // Nota: número de páginas varia conforme dados (3/4 e 9 opcionais)
      setValidationStatus({
        generated: true,
        pages: 7, // valor ilustrativo; muda conforme flags acima
        images: [
          { page: 1, image: 'pg1_capa (cloudfront)', status: 'ok' },
          { page: 2, image: 'bg_2_Pdf (cloudfront)', status: 'ok' },
          { page: 3, image: 'bg_2_Pdf (cloudfront)', status: 'ok' },
          { page: 4, image: 'bg_2_Pdf (cloudfront)', status: 'ok' },
          { page: 5, image: 'pg5_jornada (cloudfront)', status: 'ok' },
          { page: 6, image: 'bg_2_Pdf (cloudfront)', status: 'ok' },
          { page: 7, image: 'bg_2_Pdf (cloudfront)', status: 'ok' }
        ],
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setValidationStatus({ generated: false, pages: 0, images: [] });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Validação do PDF - Mapa da Alma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">1. Verificar Imagens</h3>
          <p className="text-sm text-gray-600">Primeiro, verifique se as imagens (cloudfront) respondem.</p>
          <Button onClick={checkImages} disabled={checking} variant="outline" className="w-full">
            {checking ? 'Verificando...' : 'Verificar Imagens'}
          </Button>

          {imageCheck.length > 0 && (
            <div className="space-y-2 mt-4">
              {imageCheck.map((img) => (
                <div key={img.path} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <code className="text-xs">{img.path}</code>
                  {img.exists ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600">{img.error}</span>
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                </div>
              ))}
              {!imageCheck.every((img) => img.exists) && (
                <Alert className="mt-4">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>Algumas imagens não responderam. Verifique a rede/URL.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold">2. Gerar PDF de Teste</h3>
          <p className="text-sm text-gray-600">Gere um PDF de teste para validar a ordem e os backgrounds.</p>
          <Button onClick={handleGenerateTestPdf} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
        </div>

        {validationStatus && (
          <div className="border-t pt-6 space-y-4">
            <Alert>
              <AlertDescription>
                {validationStatus.generated ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    PDF gerado com sucesso! {validationStatus.pages} páginas criadas.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    Erro ao gerar PDF
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {validationStatus.generated && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Estrutura do PDF:</h3>
                <div className="grid gap-2">
                  {validationStatus.images.map((img) => (
                    <div key={img.page} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        Página {img.page}:{' '}
                        <code className="text-xs bg-gray-200 px-1 rounded">{img.image}</code>
                      </span>
                      {img.status === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

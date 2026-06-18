import React, { useState } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deliveryService } from '@/services/deliveryService';
import { premiumClasses } from '@/config/premiumClasses';

type CatalogProduct = {
  key: string;
  name: string;
  description: string;
  price: string;
};

const products: CatalogProduct[] = [
  {
    key: 'desvende_mapa',
    name: 'Desvende seu Mapa',
    description: 'Leitura numerológica personalizada para compreender essência, talentos e caminhos.',
    price: 'R$ 197,00',
  },
  {
    key: 'nome_profissional_marca',
    name: 'Nome Profissional/Marca',
    description: 'Análise para alinhar assinatura profissional, marca ou posicionamento energético.',
    price: 'R$ 297,00',
  },
  {
    key: 'data_cesarea',
    name: 'Data para Cesárea',
    description: 'Estudo numerológico para apoiar a escolha de uma data de nascimento favorável.',
    price: 'R$ 347,00',
  },
  {
    key: 'nome_bebe',
    name: 'Nome do Bebê',
    description: 'Avaliação de nomes para apoiar uma escolha harmônica e significativa.',
    price: 'R$ 297,00',
  },
  {
    key: 'abertura_empresa',
    name: 'Abertura de Empresa',
    description: 'Análise de datas e vibração numerológica para novos ciclos empresariais.',
    price: 'R$ 397,00',
  },
];

interface ProductCatalogPageProps {
  onOrderCreated?: () => void;
}

export const ProductCatalogPage: React.FC<ProductCatalogPageProps> = ({ onOrderCreated }) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleChooseProduct = async (product: CatalogProduct) => {
    setSelectedProduct(product.key);
    try {
      await deliveryService.createDelivery({
        userId: user?.id || null,
        nome: profile?.full_name || profile?.name || user?.email || 'Cliente',
        telefone: '',
        telefoneNormalizado: '',
        email: profile?.email || user?.email || '',
        produto: product.key,
        tipoProduto: product.name,
        status: 'AGUARDANDO_PAGAMENTO',
        dataNascimento: '',
        linkPdf: null,
        pdfDataUrl: null,
        fileName: null,
        pdfStoragePath: null,
        origem: 'plataforma',
        observacoesCliente: '',
        observacoesCarol: 'Pedido criado pelo catálogo de produtos.',
        dadosNumerologicos: {},
        dadosCliente: {
          produto: product.key,
          produtoNome: product.name,
          preco: product.price,
          origem: 'catalogo',
        },
      });

      toast({
        title: 'Pedido registrado',
        description: 'Aguarde a confirmação do pagamento para liberar o formulário.',
      });
      onOrderCreated?.();
    } catch (error) {
      toast({
        title: 'Não foi possível registrar o pedido',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setSelectedProduct(null);
    }
  };

  return (
    <div className={premiumClasses.page}>
      <header className={premiumClasses.header}>
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-[#C9A96E]">CAROL GRABER</p>
            <h1 className="text-2xl font-bold text-white">Catálogo de Produtos</h1>
          </div>
          <Button variant="outline" className={`${premiumClasses.secondaryButton} w-full sm:w-auto`} onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Escolha seu produto</h2>
          <p className={`mt-2 max-w-2xl ${premiumClasses.muted}`}>
            Selecione o produto desejado para registrar seu pedido. O formulário será liberado após confirmação manual do pagamento.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card key={product.key} className={premiumClasses.card}>
              <CardHeader>
                <CardTitle className="flex items-start gap-3 text-white">
                  <ShoppingBag className="mt-1 h-5 w-5 shrink-0 text-[#C9A96E]" />
                  {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-5">
                <p className={premiumClasses.muted}>{product.description}</p>
                <p className="text-xl font-bold text-[#C9A96E]">{product.price}</p>
                <Button
                  className={`${premiumClasses.primaryButton} mt-auto w-full`}
                  onClick={() => handleChooseProduct(product)}
                  disabled={selectedProduct === product.key}
                >
                  {selectedProduct === product.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Escolher este Produto
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

# Instruções de Upload - Imagens do PDF Mapa da Alma

## Imagens Necessárias

### 1. pg1_capa.png (OBRIGATÓRIO)
- **Tipo**: Imagem integral da capa
- **Dimensões**: 595x842 pt (A4 em pontos) ou equivalente em pixels
- **Uso**: Página 1 - Capa completa
- **Conteúdo**: Deve conter todos os elementos visuais da capa (título, decorações, espaços para dados)
- **Localização**: `public/templates/pg1_capa.png`

### 2. bg_2_Pdf.png (OBRIGATÓRIO)
- **Tipo**: Background padrão para páginas internas
- **Dimensões**: 595x842 pt (A4 em pontos) ou equivalente em pixels
- **Uso**: Páginas 2, 3, 4, 6, 7, 8, 9 - Background sob o conteúdo
- **Conteúdo**: Background decorativo que será coberto por header, footer e conteúdo
- **Localização**: `public/templates/bg_2_Pdf.png`

### 3. pg5_calendario.png (OBRIGATÓRIO)
- **Tipo**: Imagem integral do calendário
- **Dimensões**: 595x842 pt (A4 em pontos) ou equivalente em pixels
- **Uso**: Página 5 - Calendário do Ano Pessoal completo
- **Conteúdo**: Deve conter o layout completo do calendário com meses e previsões
- **Localização**: `public/templates/pg5_calendario.png`

## Estrutura do PDF

### Página 1 - Capa (pg1_capa.png)
- Imagem integral sem elementos adicionais
- Não recebe header/footer
- A imagem deve conter todos os elementos visuais

### Páginas 2-4, 6-9 (bg_2_Pdf.png)
- Background cobrindo toda a página
- Header semi-transparente (opacity 0.85) no topo
- Footer semi-transparente (opacity 0.85) na base
- Conteúdo específico de cada página sobre o background

**Páginas específicas:**
- Página 2: Índice
- Página 3: Números Numerológicos
- Página 4: Ano Pessoal
- Página 6: Ciclos de Vida
- Página 7: Desafios Cíclicos
- Página 8: Presentes
- Página 9: Compatibilidade (apenas se disponível)

### Página 5 - Calendário (pg5_calendario.png)
- Imagem integral sem elementos adicionais
- Não recebe header/footer
- A imagem deve conter o calendário completo

## Formato das Imagens

- **Formato**: PNG (recomendado) ou JPG
- **Resolução**: Mínimo 595x842 pixels (72 DPI) ou maior para melhor qualidade
- **Proporção**: A4 (1:1.414) - largura:altura
- **Tamanho**: Recomendado manter abaixo de 2MB por imagem para performance

## Como Fazer Upload

1. Salve as imagens com os nomes exatos:
   - `pg1_capa.png`
   - `bg_2_Pdf.png`
   - `pg5_calendario.png`

2. Coloque as imagens na pasta `public/templates/`

3. As imagens serão carregadas automaticamente pelo sistema de geração de PDF

## Verificação

Após o upload, verifique se:
- ✅ As 3 imagens estão na pasta `public/templates/`
- ✅ Os nomes dos arquivos estão corretos (case-sensitive)
- ✅ As imagens têm dimensões adequadas (proporção A4)
- ✅ O PDF é gerado corretamente com todas as imagens

## Troubleshooting

**Imagem não aparece no PDF:**
- Verifique se o nome do arquivo está correto
- Confirme que a imagem está em `public/templates/`
- Verifique o console do navegador para erros de carregamento

**Imagem aparece distorcida:**
- Verifique se a proporção é A4 (1:1.414)
- Ajuste as dimensões para 595x842 ou múltiplos

**PDF demora para gerar:**
- Reduza o tamanho dos arquivos de imagem
- Use compressão PNG ou JPG com qualidade 85-90%

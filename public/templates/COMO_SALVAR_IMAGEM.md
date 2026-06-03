# Como Salvar a Imagem do Upload

## Imagem Fornecida
URL: https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760879933722_f501ed08.png

## Passos para Salvar

### 1. Baixar a Imagem
- Acesse a URL acima no navegador
- Clique com botão direito → "Salvar imagem como..."
- Salve no seu computador

### 2. Converter para WebP (Opcional mas Recomendado)
Use um conversor online como:
- https://cloudconvert.com/png-to-webp
- https://convertio.co/png-webp/

### 3. Salvar nos Locais Corretos

Salve a imagem com os seguintes nomes na pasta `public/templates/`:

#### Formato WebP (Prioridade):
- ✅ `pg1_capa.webp` - Capa completa (Página 1)
- ✅ `bg_2_Pdf.webp` - Background páginas 2-9
- ✅ `pg5_jornada.webp` - Página 5 (Jornada)

#### Formato PNG (Fallback):
- ✅ `pg1_capa.png` - Capa completa (Página 1)
- ✅ `bg_2_Pdf.png` - Background páginas 2-9
- ✅ `pg5_jornada.png` - Página 5 (Jornada)

### 4. Estrutura Final
```
public/
  templates/
    pg1_capa.webp
    pg1_capa.png
    bg_2_Pdf.webp
    bg_2_Pdf.png
    pg5_jornada.webp
    pg5_jornada.png
```

### 5. Verificar
Após salvar, teste gerando um PDF para confirmar que as imagens aparecem corretamente.

## Notas Importantes
- O sistema tenta carregar .webp primeiro (menor tamanho)
- Se .webp falhar, tenta .png automaticamente
- Mantenha os nomes EXATAMENTE como especificado
- A imagem já tem o header perfeito para todas as páginas

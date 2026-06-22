# Roteiro da demonstração local

O arquivo local `.env.local` já habilita `VITE_DEMO_MODE=true`. Ele é ignorado pelo Git e não será publicado.

## Acessos de demonstração

- Cliente: `cliente.demo@exemplo.com` e qualquer senha.
- Carol: `carol.demo@exemplo.com` e qualquer senha.

Use sempre o mesmo e-mail de cliente durante o roteiro. O modo demo associa os pedidos ao e-mail.

## Fluxo

1. Rode `npm run dev` e abra `http://127.0.0.1:8080/#/login`.
2. Entre como cliente.
3. Escolha um produto em `Loja` e clique em `Quero contratar`.
4. Confira a orientação de pagamento em `Minha Área` e saia.
   - Use `Ver outros produtos` para confirmar o retorno à loja.
   - Confirme que o player demonstrativo aparece sem bloquear a página.
5. Entre como Carol.
6. Em `Entregas`, localize o cliente pela busca e clique em `Confirmar pagamento`.
7. Saia e entre novamente com o mesmo e-mail do cliente.
8. Preencha nome, WhatsApp e nascimento; envie os dados.
9. Volte como Carol; o pedido deve aparecer em `Prontos para gerar`.
10. Clique em `PDF` e, depois, em `WhatsApp`.
    - O status deve ser `PDF demo gerado`, não `PDF gerado` ou `Finalizado`.
    - Baixe o arquivo e confirme que a página demonstrativa contém cliente, produto e nascimento.
11. Volte como cliente e confirme o PDF em `Minha Área`.
12. Como Carol, finalize o atendimento depois do envio.

## Antes da publicação real

- Desabilite `VITE_DEMO_MODE`.
- Aplique a migration documentada em `SUPABASE_SETUP.md`.
- Configure as variáveis reais do Supabase.
- Promova somente a conta da Carol para `role = 'admin'`.
- Repita o roteiro com duas contas reais e confirme os dados diretamente no Supabase.

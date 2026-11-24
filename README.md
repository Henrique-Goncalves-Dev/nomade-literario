# Nômade Literário

Plataforma responsiva para mapear preferências de leitura, gerar recomendações e salvar o perfil de cada leitor.

## Executar localmente

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Sem credenciais do Supabase, o questionário funciona como protótipo local e a tela de conta explica que a autenticação ainda não está conectada. Com o projeto configurado, o cadastro, a confirmação de e-mail, a entrada, a recuperação de senha e o perfil passam a usar o backend.

## O que está implementado

- Questionário com pontuação dos quatro perfis leitores e recomendações do catálogo demonstrativo.
- Contas com e-mail e senha, confirmação de e-mail, recuperação e atualização de senha.
- Perfil persistente com nome, faixa etária opcional, gêneros, temas a evitar e avaliações de livros.
- Celular e endereço solicitados e salvos apenas quando a pessoa demonstra interesse em entrega em casa.
- Exportação dos dados da conta em JSON e remoção do perfil, endereço, preferências e avaliações da conta.
- Layout responsivo para computador e celular, navegação por teclado e preferência por movimento reduzido.

O questionário continua disponível sem conta. O cadastro é destinado a pessoas com 18 anos ou mais; essa condição é uma declaração da pessoa e não uma verificação de identidade ou idade. A faixa etária é opcional e não é coletada a data de nascimento.

O interesse em entrega não cria pedido, cobrança ou garantia de disponibilidade. Esta versão não inclui pagamentos, estoque, logística nem integração com transportadoras. Telefone e endereço são apagados se a pessoa desmarcar a opção de entrega. O botão de remoção apaga os dados de perfil e leitura do banco, mas mantém a conta de acesso por e-mail e não apaga cópias locais salvas antes do login.

## Dados e segurança

- A autenticação é feita pelo Supabase Auth; as tabelas de perfil têm Row Level Security e cada pessoa só pode ler ou alterar as próprias linhas.
- A aplicação usa somente a chave publicável do Supabase. Nunca inclua uma chave `secret`, `service_role` ou senha de banco em variável `VITE_*`, código cliente ou Git.
- O formulário aceita Cloudflare Turnstile quando `VITE_TURNSTILE_SITE_KEY` está configurada. A chave secreta correspondente precisa ser ativada nas proteções anti-bot do Supabase.
- As respostas e o endereço não ficam em tabelas públicas. O questionário sem conta salva no navegador; quando a pessoa está autenticada, o perfil é sincronizado à conta.
- O resumo de privacidade aparece junto ao cadastro. Antes de uma operação comercial, complete a política de privacidade com a identificação jurídica do controlador, canal de contato, prazos de retenção e regras de compartilhamento com parceiros de entrega.

## Configurar autenticação e banco

Use um projeto Supabase dedicado ao Nômade Literário. O projeto `MyCardapio` existente é de outro aplicativo e está inativo; não o reutilize.

1. Aplique os arquivos em `supabase/migrations` em ordem pelo SQL Editor. Com o CLI, vincule o projeto e envie as migrações com `npx --yes supabase@latest link --project-ref <project-ref>` e `npx --yes supabase@latest db push --remote`.
2. No Supabase, mantenha a confirmação de e-mail habilitada, configure senha mínima de 12 caracteres, SMTP próprio para confirmação/recuperação e redirects permitidos somente para localhost e os domínios Vercel usados.
3. Para bloquear cadastros automatizados, configure a chave secreta do Turnstile em **Authentication → Bot and Abuse Protection**, ative a proteção CAPTCHA e defina a chave pública como `VITE_TURNSTILE_SITE_KEY` no build.
4. Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em `.env` local e nos ambientes Vercel que devem aceitar contas. Não coloque chaves secretas no frontend.
5. No Supabase, mantenha os alertas de segurança e revise o Security Advisor antes de abrir o cadastro ao público. Antes de despachar um livro, confirme telefone e endereço e apresente as condições de entrega.

As contas não funcionam até que um projeto Supabase dedicado, as migrações, os redirects de e-mail e as variáveis de ambiente estejam configurados. O frontend exibe os formulários, mas mantém o envio desativado quando faltam essas credenciais.

## Limites do catálogo

Os títulos e as descrições atuais são demonstrativos. A disponibilidade, os links de compra, as notas de conteúdo e as recomendações precisam ser revisados pela curadoria antes de uma oferta comercial.

## Materiais de referência

- Transcrição revisada do áudio: [transcricao-audio.md](transcricao-audio.md)
- O PDF fornecido serviu de base para o questionário, os quatro perfis, a pontuação e as etapas de curadoria.

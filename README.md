# Nômade Literário

Plataforma responsiva para mapear preferências de leitura, gerar recomendações e salvar o perfil de cada leitor.

## Executar localmente

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

O fluxo comercial exige Supabase configurado: cadastro e login, pagamento Pix, análise manual do comprovante, questionário, relatório e convite de WhatsApp por perfil. Sem as credenciais do Supabase, a tela de conta informa que autenticação ainda não está conectada.

## O que está implementado

- Questionário com pontuação dos quatro perfis leitores e recomendações do catálogo demonstrativo.
- Contas com e-mail e senha, confirmação de e-mail, recuperação e atualização de senha.
- Após o cadastro, a pessoa vai para uma tela de espera com reenvio do link de confirmação.
- Perfil persistente com nome, faixa etária opcional, gêneros, temas a evitar e avaliações de livros.
- Questionário e relatório liberados só para contas com pagamento aprovado pela equipe.
- Envio privado de comprovante Pix e convite de WhatsApp por perfil quando o link estiver configurado.
- Administração dos quatro convites de WhatsApp por uma conta autorizada, sem republicar o site.
- Celular e endereço solicitados e salvos apenas quando a pessoa demonstra interesse em entrega em casa.
- Exportação dos dados da conta em JSON e remoção do perfil, endereço, preferências e avaliações da conta.
- Layout responsivo para computador e celular, navegação por teclado e preferência por movimento reduzido.

O questionário exige uma conta e acesso aprovado. O cadastro é destinado a pessoas com 18 anos ou mais; essa condição é uma declaração da pessoa e não uma verificação de identidade ou idade. A faixa etária é opcional e não é coletada a data de nascimento.

O envio do comprovante não confirma o pagamento nem libera o acesso. A equipe precisa conferir o recebimento e alterar o status da submissão no Supabase. O formulário de pagamento permanece fechado até serem definidos preço, dados do Pix e duração do acesso. Toda aprovação precisa ter uma data de expiração futura; isso impede liberar acesso por tempo indeterminado sem uma decisão comercial explícita. Este fluxo não integra um provedor de pagamento, estoque, logística ou transportadoras. O comprovante fica em um bucket privado e pode ser lido somente pelo dono da conta e pela equipe do projeto. Defina também um prazo de retenção para comprovantes antes de abrir pagamentos ao público.

O interesse em entrega não cria pedido, cobrança ou garantia de disponibilidade. Telefone e endereço são apagados se a pessoa desmarcar a opção de entrega. O botão de remoção apaga os dados de perfil e leitura do banco, mas mantém a conta de acesso por e-mail, comprovantes de pagamento e cópias locais salvas antes do login.

## Dados e segurança

- A autenticação é feita pelo Supabase Auth; as tabelas de perfil têm Row Level Security e cada pessoa só pode ler ou alterar as próprias linhas.
- O status de pagamento só pode ser alterado pela equipe no Supabase. As tabelas de perfil e avaliações também exigem acesso aprovado por uma policy no banco.
- Os convites dos grupos só podem ser alterados por usuários em `public.platform_admins`; a tabela tem RLS e o navegador não pode promover contas.
- O bucket `payment-proofs` é privado, aceita PDF/JPG/PNG/WebP de até 5 MB e usa policies próprias de Storage para isolar arquivos por conta.
- A aplicação usa somente a chave publicável do Supabase. Nunca inclua uma chave `secret`, `service_role` ou senha de banco em variável `VITE_*`, código cliente ou Git.
- O formulário aceita Cloudflare Turnstile quando `VITE_TURNSTILE_SITE_KEY` está configurada. A chave secreta correspondente precisa ser ativada nas proteções anti-bot do Supabase.
- O template de confirmação da marca está em `supabase/templates/confirmation.html`; SMTP personalizado é necessário para que o remetente passe a ser um endereço do Nômade Literário.
- As respostas e o endereço não ficam em tabelas públicas. O questionário requer uma conta autenticada e pagamento aprovado; o perfil é sincronizado à conta.
- O resumo de privacidade aparece junto ao cadastro. Antes de uma operação comercial, complete a política de privacidade com a identificação jurídica do controlador, canal de contato, prazos de retenção e regras de compartilhamento com parceiros de entrega.

## Configurar autenticação e banco

Use um projeto Supabase dedicado ao Nômade Literário. O projeto `MyCardapio` existente é de outro aplicativo e está inativo; não o reutilize.

1. Aplique os arquivos em `supabase/migrations` em ordem pelo SQL Editor. Com o CLI, vincule o projeto e envie as migrações com `npx --yes supabase@latest link --project-ref <project-ref>` e `npx --yes supabase@latest db push --remote`.
2. No Supabase hospedado, mantenha a confirmação de e-mail habilitada e configure senha mínima de 12 caracteres. Para enviar de um endereço do Nômade Literário, configure um provedor SMTP e um remetente de domínio verificado em **Authentication → SMTP Settings**; configure o template em **Authentication → Email Templates → Confirm signup** usando `supabase/templates/confirmation.html`. O arquivo `supabase/config.jsonc` prepara essa confirmação para o ambiente local, mas não altera as configurações do projeto hospedado. Consulte [SMTP personalizado](https://supabase.com/docs/guides/auth/auth-smtp) e [templates de e-mail](https://supabase.com/docs/guides/auth/auth-email-templates).
3. Para bloquear cadastros automatizados, configure a chave secreta do Turnstile em **Authentication → Bot and Abuse Protection**, ative a proteção CAPTCHA e defina a chave pública como `VITE_TURNSTILE_SITE_KEY` no build.
4. Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em `.env` local e nos ambientes Vercel que devem aceitar contas. Não coloque chaves secretas no frontend.
5. No Supabase, mantenha os alertas de segurança e revise o Security Advisor antes de abrir o cadastro ao público. Antes de despachar um livro, confirme telefone e endereço e apresente as condições de entrega.
6. Quando preço, chave Pix e recebedor forem decididos, preencha `VITE_ACCESS_PRICE_BRL`, `VITE_PAYMENT_PIX_KEY` e `VITE_PAYMENT_RECIPIENT` no ambiente local e Vercel. Esses dados aparecem na página de pagamento.
7. Na tabela `public.payment_submissions`, confira cada linha `pending_review`, use o `receipt_path` para abrir o arquivo privado em **Storage → payment-proofs** e confirme o crédito no banco. Só então altere o status para `approved` e informe em `access_expires_at` uma data futura definida pelas condições comerciais; a base recusa aprovações sem vencimento. Use `rejected` quando não for possível confirmar.
8. Depois de criar e confirmar a conta que será administradora, autorize-a pelo SQL Editor do Supabase. Troque o placeholder pelo e-mail usado no cadastro:

   ```sql
   insert into public.platform_admins (user_id)
   select id from auth.users where lower(email) = lower('EMAIL_DE_CADASTRO')
   on conflict (user_id) do nothing;
   ```

   A pessoa deve sair e entrar novamente no app; então verá **Administração** para editar os quatro convites. Links inválidos são recusados pelo banco. Convites ausentes aparecem como “em breve”. A role só pode ser concedida por alguém com acesso administrativo ao projeto Supabase.

As contas não funcionam até que um projeto Supabase dedicado, as migrações, os redirects de e-mail e as variáveis de ambiente estejam configurados. Sem preço e dados do Pix, o mapa continua bloqueado e o app não aceita comprovantes.

## Limites do catálogo

Os títulos e as descrições atuais são demonstrativos. A disponibilidade, os links de compra, as notas de conteúdo e as recomendações precisam ser revisados pela curadoria antes de uma oferta comercial.

## Materiais de referência

- Transcrição revisada do áudio: [transcricao-audio.md](transcricao-audio.md)
- O PDF fornecido serviu de base para o questionário, os quatro perfis, a pontuação e as etapas de curadoria.

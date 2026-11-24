# Nômade Literário

Protótipo web para mapear preferências de leitura, gerar um relatório individual e organizar as respostas de um teste piloto.

## Abrir a plataforma

Instale as dependências e inicie o servidor de desenvolvimento:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Depois, abra o endereço local exibido pelo Vite no terminal.

## O que funciona

- Questionário com as 12 perguntas de perfil do protótipo e 10 perguntas complementares.
- Pontuação automática para Explorador, Imersivo, Investigador e Contemplativo, incluindo empates.
- Indicação demonstrativa que combina perfil, gênero, tamanho do livro e temas a evitar.
- Relatório individual na tela, com opção de imprimir ou salvar como PDF pelo navegador.
- Painel da curadoria com contagem por perfil, respostas detalhadas e exportação CSV.
- Layout responsivo, navegação por teclado e suporte a preferência por movimento reduzido.

O painel da curadoria fica habilitado apenas em `localhost`. A versão pública não recebe nem centraliza respostas.

Na branch `feature/reading-accounts`, há uma área de conta para salvar o perfil, editar os gêneros e temas a evitar, e ajustar as próximas indicações com as escolhas “Quero ler”, “Já li” e “Não é meu estilo”. A pontuação do perfil não muda; o catálogo atual é demonstrativo.

## Dados e limites

Sem uma conta configurada, as respostas ficam no armazenamento local do navegador em que o protótipo foi aberto. Na branch de contas, as respostas só são salvas na conta depois do cadastro e do consentimento explícito. A pessoa pode apagar o perfil e os sinais de leitura salvos na conta; isso não encerra a conta nem apaga a cópia local.

O site principal continua sem contas, pagamentos, APIs próprias, uploads, modelos de IA ou banco de dados. A branch de contas usa Supabase Auth e tabelas com RLS para isolar os dados de cada usuário. Não reutilize o projeto Supabase `MyCardapio`: ele é de outro app e está inativo.

### Configurar contas na branch

1. Crie ou escolha um projeto Supabase dedicado ao Nômade Literário.
2. Aplique `supabase/migrations/20261124180054_reading_profiles_and_feedback.sql` ao projeto.
3. Configure no Supabase a URL base e os redirects permitidos para o endereço local e o preview Vercel. Mantenha a confirmação de e-mail habilitada.
4. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. No Vercel, defina essas mesmas variáveis apenas no ambiente **Preview** da branch até que ela seja aprovada.

A chave publicável pode estar no navegador e é limitada por RLS. Nunca coloque uma chave `service_role` ou `secret` em `VITE_*`, no Git ou no código do cliente. Os arquivos `.env` são ignorados pelo Git e pela implantação.

Os títulos do catálogo são exemplos para demonstrar o cruzamento das respostas com a curadoria. A disponibilidade e as notas de conteúdo precisam ser confirmadas antes de oferecer uma indicação real. Os quatro perfis são hipóteses exploratórias de preferência, não um teste psicológico ou uma versão do DISC.

## Materiais de referência

- Transcrição revisada do áudio: [transcricao-audio.md](transcricao-audio.md)
- O PDF fornecido serviu de base para o questionário, os quatro perfis, a pontuação e as etapas de curadoria.

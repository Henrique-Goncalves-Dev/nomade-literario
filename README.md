# Nômade Literário

Protótipo web para mapear preferências de leitura, gerar um relatório individual e organizar as respostas de um teste piloto.

## Abrir a plataforma

Não há etapa de build nem dependências de JavaScript. Na pasta do projeto, execute:

```powershell
python -m http.server 8000
```

Depois, abra <http://localhost:8000> no navegador.

## O que funciona

- Questionário com as 12 perguntas de perfil do protótipo e 10 perguntas complementares.
- Pontuação automática para Explorador, Imersivo, Investigador e Contemplativo, incluindo empates.
- Indicação demonstrativa que combina perfil, gênero, tamanho do livro e temas a evitar.
- Relatório individual na tela, com opção de imprimir ou salvar como PDF pelo navegador.
- Painel da curadoria com contagem por perfil, respostas detalhadas e exportação CSV.
- Layout responsivo, navegação por teclado e suporte a preferência por movimento reduzido.

## Dados e limites

As respostas ficam no armazenamento local do navegador em que o protótipo foi aberto. Elas não são enviadas a um servidor, e o CSV permite levar os dados para uma planilha. O painel não sincroniza entre dispositivos e não envia relatórios por e-mail.

Os títulos do catálogo são exemplos para demonstrar o cruzamento das respostas com a curadoria. A disponibilidade e as notas de conteúdo precisam ser confirmadas antes de oferecer uma indicação real. Os quatro perfis são hipóteses exploratórias de preferência, não um teste psicológico ou uma versão do DISC.

## Materiais de referência

- Transcrição revisada do áudio: [transcricao-audio.md](transcricao-audio.md)
- O PDF fornecido serviu de base para o questionário, os quatro perfis, a pontuação e as etapas de curadoria.

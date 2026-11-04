# Tradutor Neox

Aplicação web que traduz textos com inteligência artificial e reproduz a tradução em voz alta,
permitindo escolher idioma, voz, emoção e personalidade.

Projeto desenvolvido para a disciplina de **Análise e Projeto de Sistemas**.

## Como executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env.local` na raiz com a sua chave da OpenAI:

   ```
   OPENAI_API_KEY=sk-...
   ```

3. Inicie o servidor de desenvolvimento e acesse http://localhost:3000:

   ```bash
   npm run dev
   ```

## Rotas da API

| Rota | Método | Descrição |
| --- | --- | --- |
| `/api/translate` | POST | Traduz `text` para `targetLanguage` |
| `/api/tts` | POST | Gera áudio MP3 de `text` com a voz `voice` |
| `/api/voices` | GET | Lista as vozes disponíveis |
| `/api/diag` | GET | Verifica se a chave da OpenAI está configurada e válida |

## Documentação

A documentação de análise e projeto fica na pasta [`docs/`](docs/):

- [1. Visão geral do sistema](docs/01-visao-geral.md)
- [Resumos das aulas](docs/aulas/)

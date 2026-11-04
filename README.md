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

📄 **Documentação completa em PDF:** [`docs/Documentacao-Tradutor-Neox.pdf`](docs/Documentacao-Tradutor-Neox.pdf)

| Seção | Conteúdo |
| --- | --- |
| [1. Visão geral](docs/01-visao-geral.md) | Problema, proposta, análise × projeto e etapas do desenvolvimento |
| [2. Requisitos](docs/02-requisitos.md) | Elicitação, requisitos funcionais, não funcionais e regras de negócio |
| [3. Casos de uso](docs/03-casos-de-uso.md) | Atores, diagrama e documentação dos casos de uso |
| [4. Classes de análise](docs/04-classes-de-analise.md) | Substantivos candidatos e primeiro modelo estrutural |
| [5. Diagrama de classes](docs/05-diagrama-de-classes.md) | Classes de projeto e relacionamentos |
| [6. Versionamento](docs/06-versionamento.md) | Git, commits semânticos e branches |

Os diagramas ficam em [`docs/diagramas/`](docs/diagramas/), em `.drawio` (editável no Draw.io) e `.svg`.
Os resumos das aulas ficam em [`docs/aulas/`](docs/aulas/).

### Regerar diagramas e PDF

Requer Python 3, o pacote `markdown` e o Google Chrome (ou Chromium):

```bash
pip install markdown
```

```bash
python3 scripts/diagramas.py
```

```bash
python3 scripts/gerar_pdf.py
```

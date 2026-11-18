# Tradutor Neox

Aplicação web que traduz textos com inteligência artificial e reproduz a tradução em voz alta,
permitindo escolher idioma, voz, emoção e personalidade.

Projeto desenvolvido para a disciplina de **Análise e Projeto de Sistemas**.

| | |
| --- | --- |
| **Integrantes** | Vitor Manoel Rafael Rodrigues e Giovany Mateus Barbosa |
| **Repositório** | https://github.com/TheObscuro/Tradutor-Neox |
| **Documentação** | [`docs/Documentacao-Tradutor-Neox.pdf`](docs/Documentacao-Tradutor-Neox.pdf) |

## Funcionalidades

- Tradução de textos de até 1000 caracteres para 25 idiomas
- Síntese de voz com 6 vozes e prévia de cada uma
- Emoções na fala (neutro, feliz, triste, sereno, energético) e controle de velocidade
- Personalidade aplicada ao tom da tradução
- Favoritos salvos no navegador
- Limite de requisições por IP e rota de diagnóstico da chave da API
 
## Pré-requisitos

Para executar o projeto localmente, são necessários:

- Node.js 18.18 ou superior
- npm para gerenciamento de dependências
- Chave de API da OpenAI configurada no ambiente

## Como executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o `.env.example` para `.env.local` e preencha com a sua chave da OpenAI (o `.env.local` não é versionado):

   ```
   OPENAI_API_KEY=sk-...
   ```

3. Inicie o servidor de desenvolvimento e acesse http://localhost:3000:

   ```bash
   npm run dev
   ```
## Execução em produção

Para gerar a versão de produção:

npm run build

Para iniciar a aplicação:

npm run start

## Verificação de tipos

O projeto utiliza TypeScript para auxiliar na identificação
de erros de tipagem durante o desenvolvimento.

Para verificar os tipos do projeto, execute:

```bash
npm run typecheck
```

Esse comando verifica possíveis erros de tipagem sem gerar
novos arquivos de saída.

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
| [1. Descrição do projeto](docs/01-descricao-do-projeto.md) | Contexto, problema, objetivo e escopo |
| [2. Requisitos](docs/02-requisitos.md) | Elicitação, requisitos funcionais, não funcionais e regras de negócio |
| [3. Casos de uso](docs/03-casos-de-uso.md) | Atores, diagrama e documentação dos casos de uso |
| [4. Diagrama de classes](docs/04-diagrama-de-classes.md) | Classes de projeto e relacionamentos |
| [5. Repositório](docs/05-repositorio.md) | Link, Git, commits semânticos e branches |
| [Apêndice A — Classes de análise](docs/apendice-a-classes-de-analise.md) | Substantivos candidatos e primeiro modelo estrutural |

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

# 6. Versionamento com Git

O projeto é versionado com Git e hospedado no GitHub (`TheObscuro/Tradutor-Neox`), atendendo ao RNF-10.

## 6.1 Configuração

```bash
git config --global user.name "VitorManoel"
git config --global user.email "seuemail@exemplo.com"
git config --list
```

O `.gitignore` impede que arquivos gerados ou sensíveis entrem no histórico:

| Padrão | Motivo |
| --- | --- |
| `node_modules/` | Dependências reconstruídas com `npm install` |
| `.next/`, `out/`, `dist/` | Saída de build |
| `.env`, `.env.local`, `.env.*.local` | Contêm a chave da API (RNF-07) |
| `*.mp3`, `*.wav`, `*.zip` | Áudios e arquivos binários pesados |

O `package-lock.json` **é versionado**, para que todos instalem as mesmas versões das dependências.

## 6.2 Commits semânticos (Conventional Commits)

Formato adotado: `<tipo>(escopo opcional): <descricao curta>`, verbo no presente, letras minúsculas,
sem ponto final e sem acentos. Quando o motivo da mudança não é óbvio, o commit tem corpo (segundo `-m`).

| Tipo | Exemplo real do projeto |
| --- | --- |
| `feat` | `feat(tts): valida voz e tamanho do texto e aplica limite de requisicoes` |
| `feat` | `feat(ui): unifica tela com favoritos, velocidade, previa de voz e personalidade` |
| `fix` | `fix(api): renomeia rota de diagnóstico para route.ts` |
| `docs` | `docs: adiciona requisitos funcionais, nao funcionais e regras de negocio` |
| `style` | `style: adiciona folha de estilos global com layout responsivo` |
| `refactor` | `refactor(audio): extrai reproducao com emocao para lib/audio` |
| `chore` | `chore(scripts): adiciona gerador de diagramas UML em drawio e svg` |

Exemplo de commit com corpo:

```bash
git commit -m "refactor: centraliza vozes, idiomas e limites em lib/constants" \
  -m "A rota de vozes passa a ler a lista de lib/constants.ts, que tambem sera usada pelo front-end e pelas validacoes das rotas."
```

> Os primeiros commits do repositório (`first commit`, `adiciona dependências do TypeScript`) são anteriores
> à adoção do padrão. Como já foram enviados ao GitHub, não foram reescritos — reescrever histórico
> compartilhado causa problemas para quem já tem o repositório clonado.

## 6.3 Branches

Cada tarefa é desenvolvida em uma branch própria, com o tipo do commit como prefixo, e integrada com `merge`:

| Branch | Conteúdo |
| --- | --- |
| `docs/resumos-aulas` | Resumos das aulas 2 a 9 |
| `feat/validacoes-api` | Constantes compartilhadas, validações, limite de requisições, personalidade, áudio e favoritos |
| `feat/tela-unificada` | Estilos globais e tela única com todos os recursos |
| `docs/requisitos` | Requisitos funcionais, não funcionais e regras de negócio |
| `feat/aviso-voz-ia` | Aviso de voz gerada por IA (RNF-11) |
| `docs/casos-de-uso` | Gerador de diagramas, diagrama e documentação dos casos de uso |
| `docs/diagrama-de-classes` | Classes de análise e de projeto |
| `docs/versionamento-e-pdf` | Esta seção e a geração do PDF |

### Fluxo usado em cada tarefa

```bash
git status                              # 1. repositorio limpo
git switch -c docs/requisitos           # 2. cria a branch da tarefa
git add docs/02-requisitos.md           # 3. commits pequenos e semanticos
git commit -m "docs: adiciona requisitos funcionais, nao funcionais e regras de negocio"
git switch claude/inspiring-faraday-wec0ca   # 4. volta para a branch de integracao
git merge --no-ff docs/requisitos       #    e integra a tarefa
git branch -d docs/requisitos           # 5. exclui a branch ja integrada
git push origin claude/inspiring-faraday-wec0ca
```

O `--no-ff` força a criação do commit de merge mesmo quando seria possível um *fast-forward*, para que o
grafo mostre claramente onde cada tarefa começou e terminou.

A branch de integração é publicada no GitHub e entra na `main` por **pull request**
([TheObscuro/Tradutor-Neox#1](https://github.com/TheObscuro/Tradutor-Neox/pull/1)), o que permite revisar
o código antes de integrá-lo e gera automaticamente uma prévia do site na Vercel.

### Grafo do histórico

Trecho de `git log --oneline --graph`:

```
*   Merge branch 'docs/diagrama-de-classes'
|\
| * docs: documenta classes de projeto e seus relacionamentos
| * docs(uml): adiciona diagrama de classes de projeto
| * docs: documenta substantivos candidatos e classes de analise
| * docs(uml): adiciona diagrama de classes de analise
|/
*   Merge branch 'docs/casos-de-uso'
|\
| * docs: documenta atores, casos de uso e seus fluxos
| * docs(uml): adiciona diagrama de casos de uso
| * chore(scripts): adiciona gerador de diagramas UML em drawio e svg
|/
*   Merge branch 'feat/aviso-voz-ia'
|\
| * feat(ui): informa que a voz reproduzida e gerada por IA
|/
*   Merge branch 'docs/requisitos'
|\
| * docs: adiciona requisitos funcionais, nao funcionais e regras de negocio
|/
*   Merge branch 'feat/tela-unificada'
|\
| * refactor: remove tela duplicada da raiz do projeto
| * feat(ui): unifica tela com favoritos, velocidade, previa de voz e personalidade
| * style: adiciona folha de estilos global com layout responsivo
|/
*   Merge branch 'feat/validacoes-api'
|\
| * feat(presets): adiciona funcoes de favoritos salvos no navegador
| * refactor(audio): extrai reproducao com emocao para lib/audio
| * feat(tts): valida voz e tamanho do texto e aplica limite de requisicoes
| * feat(translate): valida entrada, aplica limite de requisicoes e personalidade
| * refactor: centraliza vozes, idiomas e limites em lib/constants
|/
*   Merge branch 'docs/resumos-aulas'
```

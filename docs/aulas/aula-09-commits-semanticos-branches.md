# Aula 9 — Commits Semânticos e Branches (resumo)

## Conventional Commits

```
<tipo>(escopo opcional): <descricao curta>

[corpo opcional]

[rodape opcional]
```

| Tipo | Quando usar |
| --- | --- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Somente documentação |
| `style` | Formatação sem mudar lógica |
| `refactor` | Reestruturação sem mudar comportamento |
| `test` | Testes |
| `chore` | Manutenção e configuração |
| `perf` | Desempenho |
| `build` / `ci` | Build ou integração contínua |

- Quebra de compatibilidade: `feat!: ...` ou rodapé `BREAKING CHANGE:`.
- Boas práticas: um commit = uma mudança lógica; descrição curta (≈70 caracteres), minúscula, sem ponto final, verbo no presente, sem acentos.
- `git commit --amend` só no último commit e apenas se ainda não foi enviado ao remoto.

## Branches

- Linha independente de desenvolvimento; mantém a `main` estável. `HEAD` indica onde você está.
- Nomes com o tipo como prefixo: `feat/rota-usuarios`, `fix/mensagem-log`, `docs/atualiza-readme`.

| Comando | O que faz |
| --- | --- |
| `git branch` | Lista branches |
| `git switch -c <nome>` | Cria e troca para a branch |
| `git switch <nome>` | Troca de branch |
| `git merge <nome>` | Integra a branch na atual (fast-forward ou commit de merge) |
| `git branch -d <nome>` | Exclui branch já integrada |
| `git log --oneline --graph --all` | Mostra o grafo de branches |

## Fluxo recomendado

1. Estar na `main` com `git status` limpo.
2. `git switch -c feat/nome-da-tarefa`.
3. Commits semânticos pequenos e frequentes.
4. `git switch main` e `git merge feat/nome-da-tarefa`.
5. `git branch -d feat/nome-da-tarefa`.

# Aula 5 — Classes de Análise (resumo)

- Casos de uso e sequência → **diagramas de comportamento**; diagrama de classes → **diagrama de estrutura**.
- **Classe:** molde estrutural que define atributos (estado) e métodos (comportamento) de um conjunto de objetos.

| | Classe de Análise | Classe de Projeto |
| --- | --- | --- |
| Nível | Conceitual | Técnico |
| Origem | Requisitos e casos de uso | Classes de análise refinadas |
| Conteúdo | Nome, atributos, métodos em alto nível | Visibilidade, tipos, persistência, padrões |

## Identificando classes (substantivos candidatos)

- Tem atributos e comportamento próprios → classe.
- É só um valor de outra coisa (data, quantidade, nome) → atributo.
- É ator, mas o sistema guarda dados sobre ele → também vira classe.
- Fora do escopo → descartar. Cuidado com sinônimos (duplicidade).

## Estrutura e associação

- Três compartimentos: nome, atributos, métodos (sem tipos na análise).
- Associação com multiplicidade: `1`, `0..1`, `1..*`, `0..*`/`*`.

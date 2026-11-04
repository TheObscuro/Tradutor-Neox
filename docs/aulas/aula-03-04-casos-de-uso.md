# Aulas 3 e 4 — Modelagem de Casos de Uso (resumo)

## Elementos do diagrama

| # | Elemento | Notação | Regra |
| --- | --- | --- | --- |
| 1 | Ator | Boneco-palito (ou retângulo `<<sistema>>` para sistema externo) | Nome é sempre um **papel**, nunca uma pessoa |
| 2 | Caso de Uso | Elipse, verbo no infinitivo + complemento | Foco na finalidade, não na tela ou no botão |
| 3 | Associação | Linha simples ator — caso de uso | Um caso de uso pode ter vários atores e vice-versa |
| 4 | `<<include>>` | Seta tracejada **base → incluído** | Sempre executado; reuso de comportamento comum |
| 5 | `<<extend>>` | Seta tracejada **extensão → base** | Condicional/opcional; o base funciona sem ele |
| 6 | Generalização | Seta sólida com triângulo vazado, do específico para o geral | O específico herda todas as associações do geral |

- **Casos de uso primários:** objetivos centrais do sistema.
- **Casos de uso secundários:** necessários para o funcionamento, sem benefício direto ao ator.
- **Fronteira do sistema:** retângulo com o nome do sistema; atores ficam do lado de fora.

## `<<include>>` x `<<extend>>`

| | include | extend |
| --- | --- | --- |
| Execução | Sempre obrigatória | Condicional |
| Direção | Base → Incluído | Extensão → Base |
| Pergunta-chave | "Sempre acontece junto?" | "Só acontece às vezes?" |

## Documentação do caso de uso

| Campo | Conteúdo |
| --- | --- |
| Nome | Nome do caso de uso |
| Ator(es) | Quem participa |
| Descrição | Resumo em 1–2 frases |
| Pré-condições | O que precisa ser verdade antes |
| Fluxo principal | Caminho em que tudo dá certo |
| Fluxos alternativos | Variações válidas |
| Exceções | O que acontece quando algo dá errado |
| Pós-condições | O que passa a ser verdade depois |

Ferramenta de modelagem: **Draw.io**.

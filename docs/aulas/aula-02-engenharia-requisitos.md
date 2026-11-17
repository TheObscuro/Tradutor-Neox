# Aula 2 — Engenharia de Requisitos e Introdução aos Casos de Uso (resumo)

## Processo de Engenharia de Requisitos

| Processo | O que é |
| --- | --- |
| Elicitação | Conversar com quem conhece o problema para descobrir necessidades |
| Especificação | Transformar o que foi descoberto em documentação clara |
| Validação e negociação | Confirmar com o cliente se o entendimento está correto, ajustando conflitos |
| Gerenciamento | Controlar como os requisitos mudam ao longo do projeto |

## Visões da especificação

| Visão | Quem participa | Foco |
| --- | --- | --- |
| Requisitos de Usuário | gestores, usuários finais, clientes | O quê o sistema faz, em linguagem simples |
| Requisitos de Sistema | analistas, arquitetos, desenvolvedores | Detalhamento técnico, completo e consistente |

## Tipos de requisito

- **Requisito Funcional (RF):** serviço que o sistema oferece; começa com verbo no infinitivo.
- **Requisito Não Funcional (RNF):** restrição sobre como o sistema deve se comportar como um todo.
  - **De produto:** desempenho, confiabilidade, usabilidade.
  - **Organizacional:** processo, tecnologia, ambiente.
  - **Externo:** legais, regulatórios, éticos.
- **Regra de Negócio (RN):** restrição/política da organização que deve ser obrigatoriamente obedecida, independente da tecnologia.

> Um RNF malfeito pode inutilizar o sistema: o usuário contorna uma função que falha, mas não um sistema lento ou inseguro.

## Requisitos de qualidade

Um bom requisito é **testável**. Métricas úteis:

| Característica | Métrica |
| --- | --- |
| Velocidade | transações por segundo, tempo de resposta |
| Tamanho | megabytes, número de registros |
| Facilidade de uso | tempo de treinamento, erros por hora de uso |
| Confiabilidade | tempo médio entre falhas, % de disponibilidade |
| Robustez | tempo de reinício após falha, % de eventos que causam falha |

## Técnicas de elicitação

- **Entrevistas:** perguntas fechadas e abertas com stakeholders.
- **Cenários:** narrativa de um usuário interagindo com o sistema do início ao fim.
- **Brainstorming:** geração livre de ideias, depois análise e definição de escopo.

## Do requisito ao caso de uso

Um conjunto de requisitos relacionados representa uma tarefa completa do usuário → **caso de uso**.
Identificam-se **atores** (principais e secundários) e mapeiam-se requisitos para casos de uso candidatos.

## Formato de documentação (Linguagem Estruturada)

```
RF-01
Nome: ...
Descrição: ...
```

Mesmo formato para RNF-xx e RN-xx. Requisitos claros, objetivos, testáveis e numerados.

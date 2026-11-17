# Aulas 6 e 7 — Diagrama de Classes: Notação Completa e Relacionamentos (resumo)

## Sintaxe

- Atributo: `visibilidade nome : tipo = valorInicial {propriedades}` — ex.: `- preco: double = 0.0`
- Método: `visibilidade nome(parametros) : tipoRetorno {propriedades}` — ex.: `+ validarCPF(): boolean`
- Visibilidade: `+` public, `-` private, `#` protected, `~` package.
- Classe abstrata: nome em itálico ou `<<abstract>>`; nunca instanciada diretamente.

## Relacionamentos

| Relacionamento | Significado | Notação |
| --- | --- | --- |
| Generalização | "é um" — herança | Linha contínua, triângulo vazado na superclasse |
| Associação | "usa/conhece" — classes independentes | Linha sólida com multiplicidade |
| Dependência | vínculo temporário (parâmetro) | Seta tracejada |
| Classe associativa | o próprio relacionamento tem atributos | Classe ligada às duas pontas |
| Agregação | todo-parte fraco; a parte sobrevive sem o todo | Losango vazado no todo |
| Composição | todo-parte forte; a parte morre com o todo | Losango preenchido no todo |

## Árvore de decisão

1. A "é um tipo de" B? → Generalização.
2. Não há todo-parte? → Associação simples.
3. A parte sobrevive sem o todo? Sim → Agregação; Não → Composição.

## Checklist de refinamento

Dinâmico, estático, estrutural, nomenclatura e duplicidade.

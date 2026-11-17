# 2. Engenharia de Requisitos

## 2.1 Briefing do cliente

> Estudantes, viajantes e criadores de conteúdo precisam traduzir textos curtos e, além de ler a tradução,
> **ouvir** como ela soa. As ferramentas atuais traduzem, mas oferecem pouca personalização da voz. O cliente
> quer uma aplicação web, sem cadastro, em que o usuário digite um texto, escolha o idioma de destino e ouça
> a tradução com a voz, a emoção e a velocidade que preferir. O usuário também quer guardar as combinações
> que mais usa (favoritos) para não precisar configurá-las de novo. A tradução e a voz são geradas por um
> serviço externo de inteligência artificial (OpenAI), cujo custo é por requisição, por isso o uso precisa ser
> limitado e a chave de acesso ao serviço deve ficar protegida.

## 2.2 Stakeholders

| Stakeholder | Interesse |
| --- | --- |
| Usuário | Traduzir e ouvir textos de forma rápida e personalizada |
| Administrador do sistema | Manter a aplicação no ar, configurar a chave da API e controlar custos |
| Serviço OpenAI (externo) | Fornecer a tradução (`gpt-4o-mini`) e a síntese de voz (`tts-1`) |

## 2.3 Elicitação

### Brainstorming (ideias levantadas e decisão de escopo)

| Ideia | Decisão |
| --- | --- |
| Traduzir texto para vários idiomas | ✅ No escopo (RF-01) |
| Ouvir o texto em voz alta | ✅ No escopo (RF-02) |
| Escolher entre várias vozes e ouvir uma prévia | ✅ No escopo (RF-03, RF-04) |
| Dar emoção à fala (feliz, triste...) | ✅ No escopo (RF-05) |
| Adaptar o tom da tradução a uma personalidade | ✅ No escopo (RF-06) |
| Controlar a velocidade da fala | ✅ No escopo (RF-07) |
| Salvar configurações favoritas | ✅ No escopo (RF-08 a RF-10) |
| Cadastro de usuários e login | ❌ Fora do escopo — aumenta o atrito e exige armazenar dados pessoais |
| Histórico de traduções no servidor | ❌ Fora do escopo — conflita com a privacidade (RNF-08) |
| Reconhecimento de voz (falar em vez de digitar) | ⏳ Evolução futura |

### Entrevista (resumo)

| Pergunta | Resposta do cliente |
| --- | --- |
| Que tamanho de texto será traduzido? (fechada) | Frases e parágrafos curtos, até cerca de uma página (≈1000 caracteres). |
| Quantos idiomas são necessários? (fechada) | Pelo menos os 20 mais falados; hoje são 25. |
| O que mais incomoda nas ferramentas atuais? (aberta) | A voz robótica e sem emoção, e ter que configurar tudo de novo a cada uso. |
| Como evitar custos inesperados com a API? (aberta) | Limitar quantas requisições cada visitante pode fazer em um intervalo de tempo. |

### Cenário

> *Ana vai apresentar um trabalho em espanhol. Ela abre o Tradutor Neox, digita o parágrafo de abertura
> em português e escolhe "Espanhol" como idioma de tradução. Na personalidade, escreve "professora paciente".
> Ela clica em "Escolher voz", ouve a prévia de duas vozes e escolhe a "Nova". Seleciona a emoção "Sereno",
> reduz a velocidade para 0,85x e clica em "Traduzir & Falar". O sistema mostra o texto traduzido e
> reproduz o áudio. Como vai treinar todos os dias, Ana salva a configuração como o favorito
> "Apresentação espanhol". No dia seguinte, ela aplica o favorito e só precisa digitar o novo texto.*

Esse cenário revela os requisitos: traduzir, escolher idioma, personalidade, escolher voz, ouvir prévia,
aplicar emoção, ajustar velocidade, exibir tradução, falar e salvar/aplicar favorito.

### Requisito de usuário × requisito de sistema

| Visão | Exemplo |
| --- | --- |
| Requisito de usuário | *"O sistema deve permitir que o usuário ouça a tradução do seu texto com a voz que escolher."* |
| Requisito de sistema | *"Ao acionar 'Traduzir & Falar', o sistema deve enviar o texto (até 1000 caracteres) e o idioma de destino para `/api/translate`, receber o texto traduzido, enviá-lo com o identificador da voz para `/api/tts` e reproduzir o áudio MP3 retornado em até 8 segundos."* |

---

## 2.4 Requisitos Funcionais (RF)

**RF-01**  
**Nome:** Traduzir texto  
**Descrição:** O sistema deve traduzir o texto digitado pelo usuário para o idioma de destino selecionado entre os idiomas suportados (RN-03) e exibir o texto traduzido na tela.

**RF-02**  
**Nome:** Falar texto  
**Descrição:** O sistema deve converter em áudio (síntese de voz) o texto traduzido — ou o texto original, quando a opção "Sem tradução" estiver selecionada — e reproduzi-lo automaticamente no navegador.

**RF-03**  
**Nome:** Escolher voz  
**Descrição:** O sistema deve listar as vozes disponíveis (RN-04), com nome e descrição, e permitir que o usuário selecione a voz usada na fala. A voz padrão é "Alloy".

**RF-04**  
**Nome:** Ouvir prévia da voz  
**Descrição:** Na janela de escolha de voz, o sistema deve reproduzir, a pedido do usuário, a frase "Esta é uma prévia da voz [nome]" com a voz correspondente.

**RF-05**  
**Nome:** Aplicar emoção à fala  
**Descrição:** O sistema deve permitir que o usuário selecione uma emoção (RN-05). Quando a emoção for diferente de "Neutro", o sistema deve alterar velocidade, tom e volume do áudio no navegador conforme a emoção escolhida.

**RF-06**  
**Nome:** Definir personalidade da tradução  
**Descrição:** O sistema deve permitir que o usuário informe uma personalidade (ex.: "formal", "professor paciente") que será usada para ajustar o tom e o estilo da tradução, sem alterar o sentido do texto (RN-06).

**RF-07**  
**Nome:** Ajustar velocidade de reprodução  
**Descrição:** O sistema deve permitir que o usuário ajuste a velocidade de reprodução do áudio por meio de um controle deslizante, exibindo o valor atual (ex.: "1,00x"), dentro da faixa definida na RN-07.

**RF-08**  
**Nome:** Salvar favorito  
**Descrição:** O sistema deve permitir que o usuário salve a configuração atual (voz, emoção, personalidade, idioma e velocidade) como um favorito identificado por um nome (RN-08, RN-09).

**RF-09**  
**Nome:** Aplicar favorito  
**Descrição:** O sistema deve listar os favoritos salvos e, quando o usuário escolher um deles, preencher automaticamente voz, emoção, personalidade, idioma e velocidade com os valores do favorito.

**RF-10**  
**Nome:** Excluir favorito  
**Descrição:** O sistema deve permitir que o usuário exclua um favorito da lista.

**RF-11**  
**Nome:** Contar caracteres  
**Descrição:** O sistema deve exibir, abaixo do campo de texto, a quantidade de caracteres digitados e o limite (ex.: "14/1000 caracteres"), destacando o contador em vermelho e desabilitando o botão de envio quando o limite for ultrapassado.

**RF-12**  
**Nome:** Exibir mensagens de erro  
**Descrição:** O sistema deve exibir na tela uma mensagem que descreva o problema sempre que uma tradução, síntese de voz ou prévia falhar (texto vazio, texto longo, limite de requisições, falha do serviço externo).

**RF-13**  
**Nome:** Verificar diagnóstico do sistema  
**Descrição:** O sistema deve disponibilizar a rota `/api/diag`, que informa se a chave da API está configurada (`hasKey`), se ela é aceita pelo serviço externo (`modelsOk`) e o erro retornado, quando houver.

---

## 2.5 Requisitos Não Funcionais (RNF)

| Código | Tipo |
| --- | --- |
| RNF-01 a RNF-07 | De produto |
| RNF-09 a RNF-10 | Organizacionais |
| RNF-08, RNF-11 | Externos |

**RNF-01** — *Produto (desempenho)*  
**Nome:** Tempo de resposta da tradução  
**Descrição:** Para textos de até 1000 caracteres, a tradução deve ser exibida em até 5 segundos em 95% das requisições, medidos do clique no botão até a exibição do texto traduzido.

**RNF-02** — *Produto (desempenho)*  
**Nome:** Tempo de geração do áudio  
**Descrição:** Para textos de até 1000 caracteres, o áudio deve começar a tocar em até 8 segundos após o clique em "Falar" em 95% das requisições.

**RNF-03** — *Produto (usabilidade)*  
**Nome:** Facilidade de uso  
**Descrição:** Um usuário que nunca usou o sistema deve conseguir traduzir e ouvir um texto em até 60 segundos, sem treinamento, usando no máximo 3 ações (digitar o texto, escolher o idioma, clicar em "Traduzir & Falar").

**RNF-04** — *Produto (portabilidade)*  
**Nome:** Layout responsivo  
**Descrição:** A interface deve funcionar em telas a partir de 360 px de largura sem rolagem horizontal, e nas duas versões mais recentes do Chrome, Edge, Firefox e Safari.

**RNF-05** — *Produto (acessibilidade)*  
**Nome:** Acessibilidade  
**Descrição:** Todos os campos devem ter rótulo associado; todas as funções devem ser acessíveis pelo teclado; as janelas de vozes e de favoritos devem fechar com a tecla ESC, devolvendo o foco ao botão que as abriu.

**RNF-06** — *Produto (confiabilidade)*  
**Nome:** Tolerância a falhas do serviço externo  
**Descrição:** Uma falha do serviço de tradução ou de voz não pode travar a interface: em 100% dos casos o botão deve voltar a ficar disponível e uma mensagem de erro deve ser exibida (RF-12).

**RNF-07** — *Produto (segurança)*  
**Nome:** Proteção da chave da API  
**Descrição:** A chave da API da OpenAI deve ser lida apenas no servidor, a partir da variável de ambiente `OPENAI_API_KEY`, e nunca pode ser enviada ao navegador nem versionada no Git (o arquivo `.env.local` deve constar no `.gitignore`).

**RNF-08** — *Externo (legal — LGPD)*  
**Nome:** Privacidade dos dados  
**Descrição:** O sistema não deve exigir cadastro nem armazenar no servidor os textos digitados, as traduções ou os áudios gerados. Os favoritos devem ficar salvos somente no navegador do usuário (`localStorage`).

**RNF-09** — *Organizacional (tecnologia)*  
**Nome:** Plataforma de desenvolvimento  
**Descrição:** O sistema deve ser desenvolvido em Next.js 14 com React 18 e TypeScript, executando em Node.js 18.18 ou superior, e publicado na Vercel.

**RNF-10** — *Organizacional (processo)*  
**Nome:** Versionamento e modelagem  
**Descrição:** O código deve ser versionado no Git/GitHub seguindo o padrão Conventional Commits, com uma branch por tarefa (`feat/`, `fix/`, `docs/`...). Os diagramas UML devem ser produzidos no Draw.io.

**RNF-11** — *Externo (ético)*  
**Nome:** Transparência sobre voz sintética  
**Descrição:** A interface deve informar ao usuário que a voz reproduzida é gerada por inteligência artificial, conforme as políticas de uso do serviço de voz da OpenAI.

---

## 2.6 Regras de Negócio (RN)

**RN-01**  
**Nome:** Tamanho máximo do texto  
**Descrição:** O texto original deve ter no máximo 1000 caracteres. O texto enviado para síntese de voz deve ter no máximo 4096 caracteres (limite do serviço de voz).

**RN-02**  
**Nome:** Limite de requisições  
**Descrição:** Cada endereço IP pode fazer no máximo 60 requisições de tradução e de voz (somadas) a cada 10 minutos. Ao exceder o limite, o sistema deve recusar a requisição (HTTP 429) e informar em quantos segundos o usuário poderá tentar novamente.

**RN-03**  
**Nome:** Idiomas suportados  
**Descrição:** A tradução só pode ser feita para um dos 25 idiomas cadastrados no sistema. Quando a opção "Sem tradução" estiver selecionada, o texto original é falado sem passar pela tradução.

**RN-04**  
**Nome:** Vozes permitidas  
**Descrição:** A síntese só pode usar uma das 6 vozes cadastradas: Alloy, Echo, Fable, Onyx, Nova e Shimmer. Qualquer outro valor deve ser recusado.

**RN-05**  
**Nome:** Emoções disponíveis  
**Descrição:** As emoções permitidas são Neutro, Feliz, Triste, Sereno e Energético. A emoção padrão é Neutro, que reproduz o áudio sem alterações.

**RN-06**  
**Nome:** Personalidade  
**Descrição:** A personalidade deve ter no máximo 100 caracteres e só é aplicada quando houver um idioma de tradução selecionado.

**RN-07**  
**Nome:** Faixa de velocidade  
**Descrição:** A velocidade de reprodução deve estar entre 0,60x e 1,60x, em passos de 0,05x. O valor padrão é 1,00x.

**RN-08**  
**Nome:** Quantidade máxima de favoritos  
**Descrição:** O usuário pode ter no máximo 40 favoritos. O favorito mais recente fica no topo da lista; ao salvar o 41º, o mais antigo é descartado.

**RN-09**  
**Nome:** Nome do favorito  
**Descrição:** Todo favorito deve ter um nome não vazio, e não podem existir dois favoritos com o mesmo nome (sem diferenciar maiúsculas de minúsculas).

**RN-10**  
**Nome:** Texto obrigatório  
**Descrição:** O sistema não deve traduzir nem falar um texto vazio ou composto apenas por espaços.

---

## 2.7 Rastreabilidade: requisitos × implementação

| Requisito | Onde está implementado |
| --- | --- |
| RF-01, RF-06, RN-03, RN-06 | `app/api/translate/route.ts` |
| RF-02, RN-04 | `app/api/tts/route.ts` |
| RF-03 | `app/api/voices/route.ts`, `lib/constants.ts` |
| RF-05, RF-07 | `lib/audio.ts`, `app/page.tsx` |
| RF-08 a RF-10, RN-08, RN-09 | `lib/presets.ts`, `app/page.tsx` |
| RF-11, RF-12, RN-10 | `app/page.tsx` |
| RF-13 | `app/api/diag/route.ts` |
| RN-01, RN-05, RN-07 | `lib/constants.ts` |
| RN-02 | `lib/ratelimit.ts` |
| RNF-07 | `.gitignore`, variáveis de ambiente |

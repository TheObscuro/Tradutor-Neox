# 1. Descrição do Projeto — Tradutor Neox

## 1.1 Contexto e problema

Estudantes, viajantes e criadores de conteúdo precisam se comunicar em outros idiomas com frequência.
Além de ler a tradução, eles querem **ouvir** como ela soa — para treinar a pronúncia, preparar uma
apresentação ou gravar um conteúdo — com uma voz natural e com uma entonação adequada ao contexto
(alegre, triste, séria etc.).

As ferramentas de tradução mais comuns resolvem bem o texto, mas oferecem pouca ou nenhuma
personalização da voz: a fala costuma ser robótica, sem emoção, e o usuário precisa refazer todas as
escolhas a cada uso.

## 1.2 Objetivo

Desenvolver uma aplicação web, sem necessidade de cadastro, em que o usuário digite um texto, o traduza
para um dos idiomas suportados e o ouça em voz alta, podendo escolher a **voz**, a **emoção**, a
**velocidade** e a **personalidade** da fala, e salvar as combinações que mais usa como **favoritos**.

## 1.3 Escopo

### O que o sistema faz

| Funcionalidade | Requisitos |
| --- | --- |
| Traduz textos de até 1000 caracteres para 25 idiomas, usando inteligência artificial | RF-01, RN-01, RN-03 |
| Converte o texto (traduzido ou original) em áudio e o reproduz | RF-02 |
| Permite escolher entre 6 vozes e ouvir uma prévia de cada uma | RF-03, RF-04 |
| Aplica emoção (feliz, triste, sereno, energético) e ajusta a velocidade da fala | RF-05, RF-07 |
| Adapta o tom da tradução a uma personalidade informada pelo usuário | RF-06 |
| Salva, aplica e exclui favoritos no navegador | RF-08 a RF-10 |
| Limita o uso por endereço IP para controlar o custo do serviço externo | RN-02 |
| Oferece uma rota de diagnóstico para o administrador verificar a chave da API | RF-13 |

### O que o sistema **não** faz

| Fora do escopo | Motivo |
| --- | --- |
| Cadastro, login ou perfis de usuário | Aumenta o atrito de uso e exigiria armazenar dados pessoais (RNF-08) |
| Histórico de traduções no servidor | Os textos do usuário não são armazenados (RNF-08) |
| Reconhecimento de voz (falar em vez de digitar) | Planejado como evolução futura |
| Tradução de arquivos (PDF, Word) ou de páginas web | Foco em textos curtos digitados pelo usuário |
| Download do áudio gerado como arquivo | Não faz parte do objetivo; o áudio é reproduzido no navegador |
| Uso offline | Tradução e voz dependem do serviço externo da OpenAI |

## 1.4 Análise × Projeto

| | Pergunta | No Tradutor Neox |
| --- | --- | --- |
| **Análise** | *O quê?* | O usuário precisa digitar um texto, escolher o idioma de destino e ouvir a tradução em voz alta, podendo escolher voz e emoção. |
| **Projeto** | *Como?* | Aplicação Next.js (React + TypeScript). O front-end chama rotas de API internas (`/api/translate`, `/api/tts`, `/api/voices`), que se comunicam com a API da OpenAI (modelo `gpt-4o-mini` para tradução e `tts-1` para voz). A emoção é aplicada no navegador via Web Audio API (velocidade, tom e volume). |

## 1.5 Etapas do desenvolvimento aplicadas ao projeto

| Etapa | O que acontece no Tradutor Neox |
| --- | --- |
| **Especificação** | Definiu-se que o sistema deve traduzir textos para vários idiomas e reproduzir o resultado em áudio, com escolha de voz e emoção. Restrições: uso da API da OpenAI (custo por requisição), chave de API protegida no servidor, interface web acessível pelo navegador. |
| **Desenvolvimento** | Front-end em React (`app/page.tsx`), rotas de API no servidor Next.js (`app/api/*`), integração com OpenAI e manipulação de áudio com Web Audio API. Código versionado com Git e Conventional Commits. |
| **Validação** | Validação de entrada nas APIs (texto vazio ou idioma ausente retornam erro 400), verificação da chave (erro 500 "OPENAI_API_KEY ausente"), rota de diagnóstico `/api/diag` que testa se a chave é válida, e testes manuais de tradução e reprodução de áudio. |
| **Evolução** | Funcionalidades planejadas/adicionadas depois da primeira versão: emoções na fala, personalidade, prévia de vozes, presets salvos no navegador, controle de velocidade e limite de requisições (*rate limit*) por IP. |

## 1.6 Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Interface | React 18, Next.js 14 (App Router), TypeScript |
| Servidor | Rotas de API do Next.js (Node.js ≥ 18.18) |
| Inteligência artificial | OpenAI — `gpt-4o-mini` (tradução), `tts-1` (voz) |
| Áudio | Web Audio API (navegador) |
| Versionamento | Git + GitHub, Conventional Commits |
| Modelagem | Draw.io (diagramas UML) |

# 1. Visão Geral do Sistema — Tradutor Neox

## 1.1 Problema

Pessoas que precisam se comunicar em outro idioma (estudantes, viajantes, criadores de conteúdo) muitas vezes
não só querem ler a tradução, mas também **ouvir** como ela soa, com uma voz natural e com uma entonação
adequada ao contexto (alegre, triste, séria etc.). Ferramentas comuns traduzem o texto, mas oferecem
pouca ou nenhuma personalização da voz.

## 1.2 Proposta

O **Tradutor Neox** é uma aplicação web que:

1. recebe um texto digitado pelo usuário;
2. traduz o texto para o idioma escolhido, usando inteligência artificial;
3. converte a tradução em áudio (síntese de voz — *text-to-speech*);
4. permite escolher a **voz**, a **emoção** e uma **personalidade** para a fala.

## 1.3 Análise × Projeto

| | Pergunta | No Tradutor Neox |
| --- | --- | --- |
| **Análise** | *O quê?* | O usuário precisa digitar um texto, escolher o idioma de destino e ouvir a tradução em voz alta, podendo escolher voz e emoção. |
| **Projeto** | *Como?* | Aplicação Next.js (React + TypeScript). O front-end chama rotas de API internas (`/api/translate`, `/api/tts`, `/api/voices`), que se comunicam com a API da OpenAI (modelo `gpt-4o-mini` para tradução e `tts-1` para voz). A emoção é aplicada no navegador via Web Audio API (velocidade, tom e volume). |

## 1.4 Etapas do desenvolvimento aplicadas ao projeto

| Etapa | O que acontece no Tradutor Neox |
| --- | --- |
| **Especificação** | Definiu-se que o sistema deve traduzir textos para vários idiomas e reproduzir o resultado em áudio, com escolha de voz e emoção. Restrições: uso da API da OpenAI (custo por requisição), chave de API protegida no servidor, interface web acessível pelo navegador. |
| **Desenvolvimento** | Front-end em React (`app/page.tsx`), rotas de API no servidor Next.js (`app/api/*`), integração com OpenAI e manipulação de áudio com Web Audio API. Código versionado com Git e Conventional Commits. |
| **Validação** | Validação de entrada nas APIs (texto vazio ou idioma ausente retornam erro 400), verificação da chave (erro 500 "OPENAI_API_KEY ausente"), rota de diagnóstico `/api/diag` que testa se a chave é válida, e testes manuais de tradução e reprodução de áudio. |
| **Evolução** | Funcionalidades planejadas/adicionadas depois da primeira versão: emoções na fala, personalidade, prévia de vozes, presets salvos no navegador, controle de velocidade e limite de requisições (*rate limit*) por IP. |

## 1.5 Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Interface | React 18, Next.js 14 (App Router), TypeScript |
| Servidor | Rotas de API do Next.js (Node.js ≥ 18.18) |
| Inteligência artificial | OpenAI — `gpt-4o-mini` (tradução), `tts-1` (voz) |
| Áudio | Web Audio API (navegador) |
| Versionamento | Git + GitHub, Conventional Commits |
| Modelagem | Draw.io (diagramas UML) |

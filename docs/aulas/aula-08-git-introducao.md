# Aula 8 — Introdução ao Git (resumo)

- **Git:** controle de versão local. **GitHub:** hospedagem remota de repositórios.
- Estágios de um arquivo: não rastreado/modificado → **staged** → **commitado**.
- `.gitignore`: padrões de arquivos que o Git ignora (ex.: `node_modules`). O `package-lock.json` deve ser versionado.

| Comando | O que faz |
| --- | --- |
| `git init` | Inicia um repositório |
| `git status` | Estado dos arquivos |
| `git add <arquivo>` | Move para a stage area |
| `git commit -m "msg"` | Registra o snapshot no histórico |
| `git diff <arquivo>` | Mostra o que mudou |
| `git log` / `git log --oneline` | Histórico de commits |
| `git config --global user.name/user.email` | Identifica o autor |
| `git clone` / `git push` / `git pull` | Trabalho com repositório remoto |

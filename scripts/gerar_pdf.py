"""Gera a documentacao completa do Tradutor Neox em PDF.

Junta as secoes de docs/ (01 a 06) em um unico HTML com capa e sumario e
imprime em PDF com o Chrome/Chromium em modo headless.

Requisitos:
    pip install markdown
    Google Chrome ou Chromium instalado (ou defina a variavel CHROME com o caminho)

Uso:
    python3 scripts/diagramas.py   # atualiza os diagramas
    python3 scripts/gerar_pdf.py   # gera docs/Documentacao-Tradutor-Neox.pdf
"""
from __future__ import annotations

import datetime
import os
import re
import shutil
import subprocess
import sys

import markdown

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS = os.path.join(ROOT, "docs")
HTML_OUT = os.path.join(DOCS, "documentacao.html")
PDF_OUT = os.path.join(DOCS, "Documentacao-Tradutor-Neox.pdf")

# Dados da capa
TITULO = "Tradutor Neox"
SUBTITULO = "Documentação de Análise e Projeto de Sistemas"
DISCIPLINA = "Análise e Projeto de Sistemas"
AUTOR = os.environ.get("DOC_AUTOR", "Vitor Manoel")
INSTITUICAO = os.environ.get("DOC_INSTITUICAO", "")
PROFESSOR = os.environ.get("DOC_PROFESSOR", "")

SECOES = [
    "01-visao-geral.md",
    "02-requisitos.md",
    "03-casos-de-uso.md",
    "04-classes-de-analise.md",
    "05-diagrama-de-classes.md",
    "06-versionamento.md",
]

MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
         "agosto", "setembro", "outubro", "novembro", "dezembro"]

CSS = """
@page { size: A4; margin: 22mm 18mm 20mm 18mm; }
* { box-sizing: border-box; }
body { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #111827; }
h1 { font-size: 20pt; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin: 0 0 14px; }
h2 { font-size: 14pt; color: #1e3a8a; margin: 22px 0 8px; }
h3 { font-size: 12pt; margin: 18px 0 6px; }
h2, h3 { break-after: avoid; }
p { margin: 6px 0; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 9.5pt; break-inside: auto; }
tr { break-inside: avoid; }
th, td { border: 1px solid #cbd5e1; padding: 5px 7px; vertical-align: top; text-align: left; }
th { background: #e0e7ff; }
code { font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; font-size: 8.8pt; background: #f1f5f9; padding: 1px 3px; border-radius: 3px; }
pre { background: #f1f5f9; padding: 8px 10px; border-radius: 6px; font-size: 8.5pt; line-height: 1.35; white-space: pre-wrap; break-inside: avoid; }
pre code { background: none; padding: 0; }
blockquote { margin: 8px 0; padding: 6px 12px; border-left: 4px solid #6366f1; background: #eef2ff; }
img { max-width: 100%; display: block; margin: 10px auto; break-inside: avoid; }
img.diagrama { max-height: 235mm; }
a { color: #1d4ed8; text-decoration: none; }
section.secao { break-before: page; }
.capa { height: 250mm; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
.capa .topo { font-size: 13pt; text-transform: uppercase; letter-spacing: 1px; color: #374151; }
.capa .meio h1 { border: 0; font-size: 34pt; margin: 0; }
.capa .meio p { font-size: 15pt; color: #374151; }
.capa .base { font-size: 12pt; }
.sumario { break-before: page; }
.sumario ol { font-size: 12pt; line-height: 2; }
.sumario ol ol { font-size: 10.5pt; line-height: 1.6; }
"""


def anchor(text: str) -> str:
    t = re.sub(r"<[^>]+>", "", text).lower()
    t = re.sub(r"[^\w\s-]", "", t, flags=re.UNICODE)
    return re.sub(r"\s+", "-", t.strip())


def converter(md_text: str) -> str:
    md_text = md_text.replace("](diagramas/", "](diagramas/")
    html = markdown.markdown(md_text, extensions=["tables", "fenced_code", "toc", "sane_lists"])
    # links para arquivos .drawio e .md nao funcionam no PDF: mantem apenas o texto
    html = re.sub(r'<a href="(?!http)[^"]*\.(drawio|md)">(.*?)</a>', r"\2", html)
    html = html.replace('<img alt=', '<img class="diagrama" alt=')
    return html


def montar_html() -> str:
    hoje = datetime.date.today()
    data = f"{MESES[hoje.month - 1].capitalize()} de {hoje.year}"
    secoes_html, sumario = [], []
    for nome in SECOES:
        with open(os.path.join(DOCS, nome), encoding="utf-8") as f:
            corpo = converter(f.read())
        titulos = re.findall(r'<h([12]) id="([^"]+)">(.*?)</h\1>', corpo)
        itens = []
        for nivel, ident, texto in titulos:
            if nivel == "1":
                sumario.append([ident, texto, itens])
            else:
                itens.append((ident, texto))
        secoes_html.append(f'<section class="secao">{corpo}</section>')

    sum_html = "".join(
        f'<li><a href="#{i}">{t}</a><ol>' + "".join(f'<li><a href="#{a}">{b}</a></li>' for a, b in sub) + "</ol></li>"
        for i, t, sub in sumario
    )
    extra = "".join(f"<div>{x}</div>" for x in (INSTITUICAO, DISCIPLINA) if x)
    prof = f"<div>Professor(a): {PROFESSOR}</div>" if PROFESSOR else ""
    capa = f"""
<div class="capa">
  <div class="topo">{extra}</div>
  <div class="meio"><h1>{TITULO}</h1><p>{SUBTITULO}</p></div>
  <div class="base"><div><b>{AUTOR}</b></div>{prof}<div>{data}</div></div>
</div>
<div class="sumario"><h1>Sumário</h1><ol style="list-style:none;padding-left:0">{sum_html}</ol></div>
"""
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{TITULO} — {SUBTITULO}</title>'
            f"<style>{CSS}</style></head><body>{capa}{''.join(secoes_html)}</body></html>")


def achar_chrome() -> str:
    candidatos = [os.environ.get("CHROME", ""), "google-chrome", "chromium", "chromium-browser",
                  "/opt/pw-browsers/chromium", r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    for c in candidatos:
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    sys.exit("Chrome/Chromium nao encontrado. Defina a variavel CHROME com o caminho do executavel.")


def main():
    with open(HTML_OUT, "w", encoding="utf-8") as f:
        f.write(montar_html())
    chrome = achar_chrome()
    subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={PDF_OUT}", "file://" + HTML_OUT.replace(os.sep, "/")],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(HTML_OUT)
    print("PDF gerado em", os.path.relpath(PDF_OUT, ROOT))


if __name__ == "__main__":
    main()

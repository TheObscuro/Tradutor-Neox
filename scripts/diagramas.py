"""Gera os diagramas UML do projeto em dois formatos a partir da mesma descricao:

- .drawio  -> arquivo editavel no Draw.io (app.diagrams.net)
- .svg     -> imagem usada na documentacao e no PDF

Uso: python3 scripts/diagramas.py
Saida: docs/diagramas/
"""
from __future__ import annotations

import html
import math
import os
from dataclasses import dataclass, field

OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "diagramas")

FONT = "Helvetica, Arial, sans-serif"
CHAR_W = 6.6  # largura media de um caractere em 12px
STROKE = "#1f2937"
FILL_UC = "#eef2ff"
FILL_CLASS = "#f8fafc"
FILL_HEAD = "#e0e7ff"


# ---------------------------------------------------------------- modelo
@dataclass
class Node:
    id: str
    kind: str  # actor | sysactor | usecase | boundary | class
    label: str
    x: float  # centro
    y: float  # centro
    w: float = 0
    h: float = 0
    attrs: list[str] = field(default_factory=list)
    methods: list[str] = field(default_factory=list)
    stereotype: str = ""
    abstract: bool = False


@dataclass
class Edge:
    src: str
    dst: str
    kind: str  # assoc | include | extend | general | aggr | comp | dep
    label: str = ""
    src_mult: str = ""
    dst_mult: str = ""


@dataclass
class Diagram:
    name: str
    width: int
    height: int
    nodes: list[Node]
    edges: list[Edge]

    def node(self, nid: str) -> Node:
        return next(n for n in self.nodes if n.id == nid)


# ------------------------------------------------------------ geometria
ROW_H = 18
HEAD_H = 28


def size_class(n: Node):
    lines = [n.label, n.stereotype] + n.attrs + n.methods
    n.w = max(120, max(len(s) for s in lines) * CHAR_W + 20)
    head = HEAD_H + (14 if n.stereotype else 0)
    n.h = head + max(1, len(n.attrs)) * ROW_H + 8 + max(1, len(n.methods)) * ROW_H + 8


def prepare(d: Diagram):
    for n in d.nodes:
        if n.kind == "usecase":
            n.w, n.h = n.w or 190, n.h or 58
        elif n.kind == "actor":
            n.w, n.h = 40, 80
        elif n.kind == "sysactor":
            n.w, n.h = n.w or 140, 60
        elif n.kind == "class":
            size_class(n)


def border_point(n: Node, tx: float, ty: float):
    """Ponto na borda do no na direcao de (tx, ty)."""
    dx, dy = tx - n.x, ty - n.y
    if dx == 0 and dy == 0:
        return n.x, n.y
    if n.kind == "usecase":
        a, b = n.w / 2, n.h / 2
        t = 1 / math.sqrt((dx / a) ** 2 + (dy / b) ** 2)
        return n.x + dx * t, n.y + dy * t
    hw, hh = n.w / 2, n.h / 2
    if n.kind == "actor":
        hw, hh = 26, 48
    t = min(hw / abs(dx) if dx else math.inf, hh / abs(dy) if dy else math.inf)
    return n.x + dx * t, n.y + dy * t


# ------------------------------------------------------------------ SVG
def esc(s: str) -> str:
    return html.escape(s, quote=True)


def svg_text(x, y, s, size=12, anchor="middle", weight="normal", italic=False, fill=STROKE):
    st = ' font-style="italic"' if italic else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{size}" '
            f'text-anchor="{anchor}" font-weight="{weight}"{st} fill="{fill}">{esc(s)}</text>')


def svg_node(n: Node) -> str:
    out = []
    if n.kind == "boundary":
        x0, y0 = n.x - n.w / 2, n.y - n.h / 2
        out.append(f'<rect x="{x0}" y="{y0}" width="{n.w}" height="{n.h}" fill="none" stroke="{STROKE}" stroke-width="1.5"/>')
        out.append(svg_text(n.x, y0 + 22, n.label, 15, weight="bold"))
    elif n.kind == "usecase":
        out.append(f'<ellipse cx="{n.x}" cy="{n.y}" rx="{n.w/2}" ry="{n.h/2}" fill="{FILL_UC}" stroke="{STROKE}" stroke-width="1.3"/>')
        lines = n.label.split("\n")
        y = n.y - (len(lines) - 1) * 7 + 4
        for i, line in enumerate(lines):
            out.append(svg_text(n.x, y + i * 14, line))
    elif n.kind == "actor":
        x, y = n.x, n.y - 40
        out.append(f'<g stroke="{STROKE}" stroke-width="1.6" fill="none">'
                   f'<circle cx="{x}" cy="{y+9}" r="9" fill="#fff"/>'
                   f'<line x1="{x}" y1="{y+18}" x2="{x}" y2="{y+46}"/>'
                   f'<line x1="{x-16}" y1="{y+27}" x2="{x+16}" y2="{y+27}"/>'
                   f'<line x1="{x}" y1="{y+46}" x2="{x-13}" y2="{y+66}"/>'
                   f'<line x1="{x}" y1="{y+46}" x2="{x+13}" y2="{y+66}"/></g>')
        out.append(svg_text(x, y + 82, n.label, 13, weight="bold"))
    elif n.kind == "sysactor":
        x0, y0 = n.x - n.w / 2, n.y - n.h / 2
        out.append(f'<rect x="{x0}" y="{y0}" width="{n.w}" height="{n.h}" fill="#fff7ed" stroke="{STROKE}" stroke-width="1.3"/>')
        out.append(svg_text(n.x, n.y - 5, "«sistema»", 11))
        out.append(svg_text(n.x, n.y + 13, n.label, 13, weight="bold"))
    elif n.kind == "class":
        x0, y0 = n.x - n.w / 2, n.y - n.h / 2
        head = HEAD_H + (14 if n.stereotype else 0)
        out.append(f'<rect x="{x0}" y="{y0}" width="{n.w}" height="{n.h}" fill="{FILL_CLASS}" stroke="{STROKE}" stroke-width="1.3"/>')
        out.append(f'<rect x="{x0}" y="{y0}" width="{n.w}" height="{head}" fill="{FILL_HEAD}" stroke="{STROKE}" stroke-width="1.3"/>')
        ty = y0 + 19
        if n.stereotype:
            out.append(svg_text(n.x, ty - 2, n.stereotype, 11))
            ty += 14
        out.append(svg_text(n.x, ty, n.label, 13, weight="bold", italic=n.abstract))
        y = y0 + head + 4
        for a in n.attrs:
            out.append(svg_text(x0 + 8, y + 13, a, anchor="start"))
            y += ROW_H
        if not n.attrs:
            y += ROW_H
        y += 4
        out.append(f'<line x1="{x0}" y1="{y}" x2="{x0+n.w}" y2="{y}" stroke="{STROKE}" stroke-width="1.3"/>')
        y += 4
        for m in n.methods:
            italic = m.endswith("{abstract}")
            out.append(svg_text(x0 + 8, y + 13, m, anchor="start", italic=italic))
            y += ROW_H
    return "\n".join(out)


def arrow_head(x, y, ang, kind):
    """Desenha a ponta da seta em (x, y) apontando no angulo ang."""
    def pt(dist, off):
        return (x - dist * math.cos(ang) + off * math.sin(ang),
                y - dist * math.sin(ang) - off * math.cos(ang))
    if kind == "open":
        a, b = pt(12, 6), pt(12, -6)
        return f'<polyline points="{a[0]:.1f},{a[1]:.1f} {x:.1f},{y:.1f} {b[0]:.1f},{b[1]:.1f}" fill="none" stroke="{STROKE}" stroke-width="1.3"/>'
    if kind == "triangle":
        a, b = pt(16, 9), pt(16, -9)
        return f'<polygon points="{a[0]:.1f},{a[1]:.1f} {x:.1f},{y:.1f} {b[0]:.1f},{b[1]:.1f}" fill="#fff" stroke="{STROKE}" stroke-width="1.3"/>'
    if kind in ("diamond", "diamond-filled"):
        a, c, b = pt(10, 6), pt(20, 0), pt(10, -6)
        fill = STROKE if kind == "diamond-filled" else "#fff"
        return (f'<polygon points="{x:.1f},{y:.1f} {a[0]:.1f},{a[1]:.1f} {c[0]:.1f},{c[1]:.1f} {b[0]:.1f},{b[1]:.1f}" '
                f'fill="{fill}" stroke="{STROKE}" stroke-width="1.3"/>')
    return ""


def svg_edge(d: Diagram, e: Edge) -> str:
    s, t = d.node(e.src), d.node(e.dst)
    x1, y1 = border_point(s, t.x, t.y)
    x2, y2 = border_point(t, s.x, s.y)
    ang = math.atan2(y2 - y1, x2 - x1)
    dashed = e.kind in ("include", "extend", "dep")
    dash = ' stroke-dasharray="7,5"' if dashed else ""
    out = [f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{STROKE}" stroke-width="1.3"{dash}/>']
    if e.kind in ("include", "extend", "dep"):
        out.append(arrow_head(x2, y2, ang, "open"))
    elif e.kind == "general":
        out.append(arrow_head(x2, y2, ang, "triangle"))
    elif e.kind in ("aggr", "comp"):
        # losango no lado do TODO (origem da aresta)
        out.append(arrow_head(x1, y1, ang + math.pi, "diamond-filled" if e.kind == "comp" else "diamond"))
    label = e.label or {"include": "«include»", "extend": "«extend»"}.get(e.kind, "")
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        w = len(label) * CHAR_W + 8
        out.append(f'<rect x="{mx-w/2:.1f}" y="{my-9:.1f}" width="{w:.1f}" height="16" fill="#fff" opacity="0.9"/>')
        out.append(svg_text(mx, my + 3, label, 11, italic=dashed))
    for mult, (px, py), sign in ((e.src_mult, (x1, y1), 1), (e.dst_mult, (x2, y2), -1)):
        if not mult:
            continue
        ux, uy = math.cos(ang) * sign, math.sin(ang) * sign
        lx = px + ux * 22 - uy * 11
        ly = py + uy * 22 + ux * 11
        out.append(svg_text(lx, ly + 4, mult, 11, weight="bold"))
    return "\n".join(out)


def to_svg(d: Diagram) -> str:
    body = [svg_node(n) for n in d.nodes if n.kind == "boundary"]
    body += [svg_edge(d, e) for e in d.edges]
    body += [svg_node(n) for n in d.nodes if n.kind != "boundary"]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{d.width}" height="{d.height}" '
            f'viewBox="0 0 {d.width} {d.height}">\n<rect width="100%" height="100%" fill="#fff"/>\n'
            + "\n".join(body) + "\n</svg>\n")


# --------------------------------------------------------------- draw.io
def cell(cid, value, style, parent="1", vertex=True, x=0, y=0, w=0, h=0, src=None, dst=None, rel=False):
    # os rotulos usam html=1: quebra de linha vira <br> e o texto e escapado como HTML
    v = esc("<br>".join(html.escape(part, quote=False) for part in value.split("\n")))
    if vertex:
        geo = f'<mxGeometry x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" as="geometry"/>'
        return f'<mxCell id="{cid}" value="{v}" style="{style}" vertex="1" parent="{parent}">{geo}</mxCell>'
    ends = (f' source="{src}"' if src else "") + (f' target="{dst}"' if dst else "")
    return (f'<mxCell id="{cid}" value="{v}" style="{style}" edge="1" parent="{parent}"{ends}>'
            f'<mxGeometry relative="1" as="geometry"/></mxCell>')


def to_drawio(d: Diagram) -> str:
    cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>']
    for n in d.nodes:
        x0, y0 = n.x - n.w / 2, n.y - n.h / 2
        if n.kind == "boundary":
            cells.append(cell(n.id, n.label, "rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;fontStyle=1;fontSize=15;fillColor=none;", x=x0, y=y0, w=n.w, h=n.h))
        elif n.kind == "usecase":
            cells.append(cell(n.id, n.label, f"ellipse;whiteSpace=wrap;html=1;fillColor={FILL_UC};", x=x0, y=y0, w=n.w, h=n.h))
        elif n.kind == "actor":
            cells.append(cell(n.id, n.label, "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;", x=n.x - 15, y=n.y - 40, w=30, h=60))
        elif n.kind == "sysactor":
            cells.append(cell(n.id, f"«sistema»\n{n.label}", "rounded=0;whiteSpace=wrap;html=1;fillColor=#fff7ed;fontStyle=1;", x=x0, y=y0, w=n.w, h=n.h))
        elif n.kind == "class":
            head = HEAD_H + (14 if n.stereotype else 0)
            title = (f"{n.stereotype}\n" if n.stereotype else "") + n.label
            font = 3 if n.abstract else 1  # 1 = negrito, 2 = italico
            cells.append(cell(n.id, title,
                              f"swimlane;fontStyle={font};align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;"
                              f"startSize={head};horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;"
                              f"marginBottom=0;whiteSpace=wrap;html=1;fillColor={FILL_HEAD};swimlaneFillColor={FILL_CLASS};",
                              x=x0, y=y0, w=n.w, h=n.h))
            text_style = ("text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;"
                          "overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;")
            attrs_h = max(1, len(n.attrs)) * ROW_H + 8
            meth_h = max(1, len(n.methods)) * ROW_H + 8
            cells.append(cell(f"{n.id}_a", "\n".join(n.attrs), text_style, parent=n.id, x=0, y=head, w=n.w, h=attrs_h))
            cells.append(cell(f"{n.id}_l", "", "line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;"
                              "spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;",
                              parent=n.id, x=0, y=head + attrs_h, w=n.w, h=8))
            cells.append(cell(f"{n.id}_m", "\n".join(n.methods), text_style, parent=n.id, x=0, y=head + attrs_h + 8, w=n.w, h=meth_h))
    styles = {
        "assoc": "endArrow=none;html=1;",
        "include": "endArrow=open;dashed=1;html=1;endSize=10;",
        "extend": "endArrow=open;dashed=1;html=1;endSize=10;",
        "dep": "endArrow=open;dashed=1;html=1;endSize=10;",
        "general": "endArrow=block;endFill=0;html=1;endSize=14;",
        "aggr": "startArrow=diamondThin;startFill=0;endArrow=none;html=1;startSize=16;",
        "comp": "startArrow=diamondThin;startFill=1;endArrow=none;html=1;startSize=16;",
    }
    for i, e in enumerate(d.edges):
        eid = f"e{i}"
        label = e.label or {"include": "«include»", "extend": "«extend»"}.get(e.kind, "")
        cells.append(cell(eid, label, styles[e.kind], vertex=False, src=e.src, dst=e.dst))
        for mult, pos, align in ((e.src_mult, -1, "left"), (e.dst_mult, 1, "right")):
            if mult:
                cells.append(f'<mxCell id="{eid}_{"s" if pos < 0 else "t"}" value="{esc(mult)}" '
                             f'style="edgeLabel;resizable=0;html=1;align={align};verticalAlign=bottom;fontStyle=1;" '
                             f'vertex="1" connectable="0" parent="{eid}">'
                             f'<mxGeometry x="{pos * 0.8}" relative="1" as="geometry"><mxPoint as="offset"/></mxGeometry></mxCell>')
    return ('<mxfile host="app.diagrams.net">\n'
            f'  <diagram name="{esc(d.name)}" id="{esc(d.name)}">\n'
            f'    <mxGraphModel dx="{d.width}" dy="{d.height}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" '
            f'arrows="1" fold="1" page="1" pageScale="1" pageWidth="{d.width}" pageHeight="{d.height}" math="0" shadow="0">\n'
            '      <root>\n        ' + "\n        ".join(cells) + "\n      </root>\n"
            "    </mxGraphModel>\n  </diagram>\n</mxfile>\n")


# ---------------------------------------------------------- diagramas
def casos_de_uso() -> Diagram:
    U = lambda i, l, x, y: Node(i, "usecase", l, x, y)
    nodes = [
        Node("sys", "boundary", "Tradutor Neox", 617, 485, 885, 900),
        Node("usuario", "actor", "Usuário", 90, 450),
        Node("admin", "actor", "Administrador", 90, 880),
        Node("openai", "sysactor", "OpenAI", 1170, 370),
        # casos de uso do usuario dispostos em leque ao redor do ator
        U("uc05", "UC05\nEscolher Voz", 279, 180),
        U("uc07", "UC07\nAjustar Velocidade", 367, 270),
        U("uc01", "UC01\nFalar Texto", 414, 387),
        U("uc08", "UC08\nSalvar Favorito", 414, 513),
        U("uc09", "UC09\nAplicar Favorito", 367, 630),
        U("uc10", "UC10\nExcluir Favorito", 279, 720),
        U("uc06", "UC06\nOuvir Prévia da Voz", 680, 110),
        U("uc04", "UC04\nAplicar Emoção", 680, 230),
        U("uc12", "UC12\nValidar Texto", 680, 387),
        U("uc13", "UC13\nVerificar Limite\nde Requisições", 680, 500),
        U("uc03", "UC03\nAplicar Personalidade", 680, 620),
        U("uc14", "UC14\nSintetizar Voz", 950, 230),
        U("uc02", "UC02\nTraduzir Texto", 950, 500),
        U("uc11", "UC11\nVerificar Diagnóstico", 950, 820),
    ]
    edges = [
        *(Edge("usuario", u, "assoc") for u in ("uc05", "uc07", "uc01", "uc08", "uc09", "uc10")),
        Edge("admin", "usuario", "general"),
        Edge("admin", "uc11", "assoc"),
        Edge("uc06", "uc05", "extend"),
        Edge("uc04", "uc01", "extend"),
        Edge("uc02", "uc01", "extend"),
        Edge("uc03", "uc02", "extend"),
        Edge("uc01", "uc12", "include"),
        Edge("uc01", "uc13", "include"),
        Edge("uc02", "uc13", "include"),
        Edge("uc01", "uc14", "include"),
        Edge("uc06", "uc14", "include"),
        Edge("openai", "uc14", "assoc"),
        Edge("openai", "uc02", "assoc"),
        Edge("openai", "uc11", "assoc"),
    ]
    return Diagram("casos-de-uso", 1270, 960, nodes, edges)


def classes_analise() -> Diagram:
    C = lambda i, l, x, y, a, m=(): Node(i, "class", l, x, y, attrs=list(a), methods=list(m))
    nodes = [
        C("lista", "ListaFavoritos", 150, 110, ["limite"], ["adicionar()", "remover()", "validarNome()"]),
        C("fav", "Favorito", 150, 370, ["nome", "dataCriacao"], ["aplicar()"]),
        C("conf", "ConfiguracaoFala", 480, 370, ["idioma", "personalidade", "velocidade"], ["possuiTraducao()"]),
        C("voz", "Voz", 820, 250, ["identificador", "nome", "descricao"], ["gerarPrevia()"]),
        C("emo", "Emocao", 820, 470, ["nome", "fatorVelocidade", "tom", "volume"], ["aplicar()"]),
        C("sol", "SolicitacaoFala", 480, 640, ["texto", "dataHora"], ["validarTexto()", "executar()"]),
        C("trad", "Traducao", 820, 700, ["textoOriginal", "textoTraduzido", "idiomaDestino"], ["traduzir()"]),
        C("audio", "Audio", 480, 880, ["formato", "conteudo"], ["reproduzir()", "parar()"]),
        C("lim", "ControleRequisicoes", 150, 640, ["ip", "quantidade", "fimJanela"], ["verificar()"]),
        C("diag", "Diagnostico", 820, 900, ["possuiChave", "chaveValida", "erro"], ["executar()"]),
    ]
    edges = [
        Edge("lista", "fav", "assoc", "contém", "1", "0..40"),
        Edge("fav", "conf", "assoc", "guarda", "1", "1"),
        Edge("conf", "voz", "assoc", "usa", "0..*", "1"),
        Edge("conf", "emo", "assoc", "usa", "0..*", "1"),
        Edge("sol", "conf", "assoc", "usa", "0..*", "1"),
        Edge("sol", "trad", "assoc", "gera", "1", "0..1"),
        Edge("sol", "audio", "assoc", "gera", "1", "1"),
        Edge("lim", "sol", "assoc", "limita", "1", "0..*"),
    ]
    return Diagram("classes-analise", 1000, 1000, nodes, edges)


def classes_projeto() -> Diagram:
    C = lambda i, l, x, y, a, m=(), **k: Node(i, "class", l, x, y, attrs=list(a), methods=list(m), **k)
    nodes = [
        C("lista", "ListaFavoritos", 190, 120,
          ["- favoritos: List<Favorito>", "- LIMITE: int = 40 {readOnly}"],
          ["+ adicionar(f: Favorito): void", "+ remover(id: String): void",
           "+ validarNome(nome: String): boolean", "+ carregar(): void", "+ salvar(): void"]),
        C("fav", "Favorito", 190, 420,
          ["- id: String", "- nome: String"],
          ["+ getNome(): String", "+ aplicar(): ConfiguracaoFala"]),
        C("conf", "ConfiguracaoFala", 560, 250,
          ["- personalidade: String = \"\"", "- velocidade: double = 1.0"],
          ["+ setVelocidade(v: double): void", "+ setPersonalidade(p: String): void", "+ possuiTraducao(): boolean"]),
        C("voz", "Voz", 960, 110,
          ["- id: String", "- nome: String", "- descricao: String"],
          ["+ getId(): String", "+ gerarPrevia(): Audio"]),
        C("emo", "Emocao", 960, 330,
          ["- id: String", "- nome: String", "- fatorVelocidade: double", "- tom: int", "- ganhoDb: double"],
          ["+ aplicar(a: Audio, velocidade: double): void"]),
        C("idioma", "Idioma", 960, 540,
          ["- nome: String"],
          ["+ ehSuportado(): boolean"]),
        C("sol", "SolicitacaoFala", 560, 560,
          ["- texto: String", "- dataHora: Date", "- MAX_TEXTO: int = 1000 {readOnly}"],
          ["+ validarTexto(): boolean", "+ executar(): Audio"]),
        C("trad", "Traducao", 960, 760,
          ["- textoTraduzido: String", "- personalidade: String"],
          ["+ getTextoTraduzido(): String"]),
        C("audio", "Audio", 190, 1040,
          ["- conteudo: Blob", "- formato: String = \"mp3\""],
          ["+ reproduzir(velocidade: double): void", "+ parar(): void"]),
        C("ia", "ServicoIA", 560, 1330,
          ["# modelo: String", "- chaveApi: String {readOnly}"],
          ["+ verificarChave(): boolean", "# enviar(dados: Object): Object {abstract}"],
          stereotype="«abstract»", abstract=True),
        C("st", "ServicoTraducao", 560, 1080,
          ["- modelo: String = \"gpt-4o-mini\""],
          ["+ traduzir(texto: String, idioma: Idioma,", "      personalidade: String): Traducao"]),
        C("ss", "ServicoSintese", 190, 1330,
          ["- modelo: String = \"tts-1\""],
          ["+ sintetizar(texto: String, voz: Voz): Audio"]),
        C("lim", "ControleRequisicoes", 190, 760,
          ["- ip: String", "- quantidade: int", "- fimJanela: long",
           "- LIMITE: int = 60 {readOnly}", "- JANELA_MS: long = 600000 {readOnly}"],
          ["+ verificar(ip: String): boolean", "+ segundosRestantes(): int"]),
        C("diag", "Diagnostico", 960, 1080,
          ["- possuiChave: boolean", "- chaveValida: boolean", "- erro: String"],
          ["+ executar(): Diagnostico"]),
    ]
    edges = [
        Edge("lista", "fav", "comp", "", "1", "0..40"),
        Edge("fav", "conf", "general"),
        Edge("conf", "voz", "aggr", "", "0..*", "1"),
        Edge("conf", "emo", "aggr", "", "0..*", "1"),
        Edge("conf", "idioma", "assoc", "traduz para", "0..*", "0..1"),
        Edge("sol", "conf", "assoc", "usa", "0..*", "1"),
        Edge("sol", "trad", "assoc", "", "1", "0..1"),
        Edge("idioma", "trad", "assoc", "", "1", "0..*"),
        Edge("sol", "audio", "comp", "", "1", "1"),
        Edge("st", "ia", "general"),
        Edge("ss", "ia", "general"),
        Edge("sol", "st", "dep", "usa"),
        Edge("lim", "sol", "assoc", "limita", "1", "0..*"),
        Edge("diag", "ia", "dep", "verifica"),
        Edge("ss", "audio", "dep", "cria"),
        Edge("st", "trad", "dep", "cria"),
    ]
    return Diagram("classes-projeto", 1200, 1440, nodes, edges)


def main():
    os.makedirs(OUT, exist_ok=True)
    for d in (casos_de_uso(), classes_analise(), classes_projeto()):
        prepare(d)
        with open(os.path.join(OUT, f"{d.name}.svg"), "w", encoding="utf-8") as f:
            f.write(to_svg(d))
        with open(os.path.join(OUT, f"{d.name}.drawio"), "w", encoding="utf-8") as f:
            f.write(to_drawio(d))
        print("gerado:", d.name)


if __name__ == "__main__":
    main()

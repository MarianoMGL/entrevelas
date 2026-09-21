# -*- coding: utf-8 -*-
"""Convierte docs/GUIA_COMPLETA.md a un PDF con la identidad de Entrevelas.
Soporta: # ## ### encabezados, listas con -, listas numeradas, tablas |...|,
citas > (como cajas de aviso), **negritas** y `código`. Quita emojis (las
fuentes PDF no los dibujan)."""
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    ListFlowable, ListItem, HRFlowable, KeepTogether
)

SRC = 'docs/GUIA_COMPLETA.md'
OUT = 'MANUAL_Entrevelas_Completo.pdf'

CREAM = colors.HexColor('#FAF7F2'); COFFEE = colors.HexColor('#5C3D2E')
AMBER = colors.HexColor('#C8763A'); SAGE = colors.HexColor('#7A9E7E')
ALERT = colors.HexColor('#C0392B'); INK = colors.HexColor('#2C2016')
LINE = colors.HexColor('#E3D8CC'); SOFT = colors.HexColor('#F4EDE4')

styles = getSampleStyleSheet()
def S(n, **k): return ParagraphStyle(n, parent=styles['Normal'], **k)
st_h1 = S('h1', fontName='Times-Bold', fontSize=17, textColor=COFFEE, spaceBefore=18, spaceAfter=6, leading=21)
st_h2 = S('h2', fontName='Helvetica-Bold', fontSize=13, textColor=AMBER, spaceBefore=13, spaceAfter=4, leading=17)
st_h3 = S('h3', fontName='Helvetica-Bold', fontSize=11, textColor=COFFEE, spaceBefore=9, spaceAfter=2, leading=15)
st_body = S('body', fontName='Helvetica', fontSize=10.5, textColor=INK, leading=15.5, spaceAfter=6)
st_li = S('li', fontName='Helvetica', fontSize=10.5, textColor=INK, leading=15)
st_note = S('note', fontName='Helvetica-Oblique', fontSize=9.5, textColor=COFFEE, leading=14)
st_tcell = S('tc', fontName='Helvetica', fontSize=9, textColor=INK, leading=12)
st_thead = S('th', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white, leading=12)
st_small = S('sm', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#8A7B6B'), alignment=TA_CENTER)

EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF\U00002B00-\U00002BFF\U0000FE00-\U0000FE0F\U00002000-\U0000206F]", flags=re.UNICODE)

def strip_emoji(s):
    return EMOJI.sub('', s).replace('  ', ' ').strip()

def inline(s):
    s = strip_emoji(s)
    s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`(.+?)`', r'<font face="Courier" size="9">\1</font>', s)
    return s

story = []
def flush_list(buf, ordered):
    if not buf: return
    items = [ListItem(Paragraph(inline(t), st_li), leftIndent=6) for t in buf]
    story.append(ListFlowable(items, bulletType='1' if ordered else 'bullet',
                              bulletColor=AMBER, bulletFontSize=9, leftIndent=16,
                              spaceBefore=2, spaceAfter=8))
    buf.clear()

def flush_quote(buf):
    if not buf: return
    inner = Paragraph(' '.join(inline(x) for x in buf), st_note)
    t = Table([[inner]], colWidths=[16.2*cm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),SOFT),('LEFTPADDING',(0,0),(-1,-1),12),
        ('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),
        ('LINEBEFORE',(0,0),(0,-1),3,AMBER)]))
    story.append(t); story.append(Spacer(1,6)); buf.clear()

def flush_table(rows):
    if not rows: return
    header = [Paragraph(inline(c), st_thead) for c in rows[0]]
    body = [[Paragraph(inline(c), st_tcell) for c in r] for r in rows[1:]]
    data = [header] + body
    ncol = len(rows[0])
    t = Table(data, colWidths=[16.2*cm/ncol]*ncol, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),COFFEE),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, CREAM]),
        ('LINEBELOW',(0,0),(-1,-1),0.4,LINE),('GRID',(0,0),(-1,-1),0.25,LINE),
    ]))
    story.append(t); story.append(Spacer(1,8)); rows.clear()

def parse_table_row(line):
    parts = [c.strip() for c in line.strip().strip('|').split('|')]
    return parts

with open(SRC, encoding='utf-8') as f:
    lines = f.read().split('\n')

list_buf, ordered, quote_buf, table_buf = [], False, [], []
def flush_all():
    flush_list(list_buf, ordered); flush_quote(quote_buf); flush_table(table_buf)

for raw in lines:
    line = raw.rstrip()
    if re.match(r'^\|.*\|\s*$', line):
        if re.match(r'^\|[\s:\-|]+\|\s*$', line):  # separador ---
            continue
        table_buf.append(parse_table_row(line)); continue
    else:
        if table_buf: flush_table(table_buf)
    if line.startswith('> '):
        flush_list(list_buf, ordered); quote_buf.append(line[2:]); continue
    else:
        if quote_buf: flush_quote(quote_buf)
    m = re.match(r'^(\d+)\.\s+(.*)', line)
    if line.startswith('- '):
        if ordered and list_buf: flush_list(list_buf, ordered)
        ordered = False; list_buf.append(line[2:]); continue
    elif m:
        if (not ordered) and list_buf: flush_list(list_buf, ordered)
        ordered = True; list_buf.append(m.group(2)); continue
    else:
        if list_buf: flush_list(list_buf, ordered)
    if line.startswith('### '): story.append(Paragraph(inline(line[4:]), st_h3))
    elif line.startswith('## '): story.append(Paragraph(inline(line[3:]), st_h2))
    elif line.startswith('# '): story.append(Paragraph(inline(line[2:]), st_h1))
    elif re.match(r'^-{3,}\s*$', line): story.append(HRFlowable(width='100%', thickness=0.8, color=LINE, spaceBefore=4, spaceAfter=8))
    elif line.strip() == '': flush_all()
    else: story.append(Paragraph(inline(line), st_body))
flush_all()

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE); canvas.setLineWidth(0.5)
    canvas.line(2.2*cm, 1.5*cm, letter[0]-2.2*cm, 1.5*cm)
    canvas.setFont('Helvetica', 8); canvas.setFillColor(colors.HexColor('#8A7B6B'))
    canvas.drawString(2.2*cm, 1.1*cm, 'Entrevelas - Guia completa')
    canvas.drawRightString(letter[0]-2.2*cm, 1.1*cm, 'Pagina %d' % doc.page)
    canvas.restoreState()

doc = BaseDocTemplate(OUT, pagesize=letter, leftMargin=2.2*cm, rightMargin=2.2*cm,
                      topMargin=1.8*cm, bottomMargin=1.9*cm, title='Entrevelas - Guia completa')
doc.addPageTemplates([PageTemplate(id='all', frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height)], onPage=header_footer)])
doc.build(story)
print('PDF generado:', OUT)

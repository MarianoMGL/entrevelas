# -*- coding: utf-8 -*-
"""Genera el Manual de uso de Entrevelas en PDF, con la identidad visual del taller.
Sin emojis (las fuentes PDF no los dibujan); en su lugar usa color y tipografía.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem, KeepTogether
)

# ---- Paleta Entrevelas ----
CREAM  = colors.HexColor('#FAF7F2')
COFFEE = colors.HexColor('#5C3D2E')
AMBER  = colors.HexColor('#C8763A')
SAGE   = colors.HexColor('#7A9E7E')
ALERT  = colors.HexColor('#C0392B')
INK    = colors.HexColor('#2C2016')
LINE   = colors.HexColor('#E3D8CC')
SOFTBG = colors.HexColor('#F4EDE4')

OUT = 'MANUAL_Entrevelas.pdf'

styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, parent=styles['Normal'], **kw)

st_h1 = S('h1', fontName='Times-Bold', fontSize=18, textColor=COFFEE,
          spaceBefore=20, spaceAfter=6, leading=22)
st_h2 = S('h2', fontName='Helvetica-Bold', fontSize=12.5, textColor=AMBER,
          spaceBefore=12, spaceAfter=4, leading=16)
st_body = S('body', fontName='Helvetica', fontSize=11, textColor=INK,
            leading=16.5, spaceAfter=7)
st_bullet = S('bullet', fontName='Helvetica', fontSize=11, textColor=INK,
              leading=16, spaceAfter=3)
st_note = S('note', fontName='Helvetica-Oblique', fontSize=10.5, textColor=COFFEE,
            leading=15, leftIndent=10, spaceAfter=6)
st_url = S('url', fontName='Helvetica-Bold', fontSize=14, textColor=AMBER,
           alignment=TA_CENTER, leading=18, spaceBefore=4, spaceAfter=4)
st_tcell = S('tcell', fontName='Helvetica', fontSize=10, textColor=INK, leading=13)
st_tcellb = S('tcellb', fontName='Helvetica-Bold', fontSize=10, textColor=COFFEE, leading=13)
st_small = S('small', fontName='Helvetica', fontSize=9, textColor=colors.HexColor('#8A7B6B'),
             alignment=TA_CENTER)

story = []

def H1(t): story.append(Paragraph(t, st_h1))
def H2(t): story.append(Paragraph(t, st_h2))
def P(t): story.append(Paragraph(t, st_body))
def SP(h=6): story.append(Spacer(1, h))
def rule(color=LINE, w=0.8):
    story.append(HRFlowable(width='100%', thickness=w, color=color,
                            spaceBefore=4, spaceAfter=10))

def bullets(items, st=st_bullet):
    flow = ListFlowable(
        [ListItem(Paragraph(it, st), leftIndent=6, value='•') for it in items],
        bulletType='bullet', bulletColor=AMBER, bulletFontSize=9,
        leftIndent=14, spaceBefore=2, spaceAfter=8,
    )
    story.append(flow)

def callout(text, bg=SOFTBG, bar=AMBER):
    """Caja de aviso con barra de color a la izquierda."""
    inner = Paragraph(text, st_note)
    t = Table([[inner]], colWidths=[16.4*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LINEBEFORE', (0,0), (0,-1), 3, bar),
        ('ROUNDEDCORNERS', [4,4,4,4]),
    ]))
    story.append(t)
    SP(8)

def info_table(rows, col0=4.6*cm, col1=11.8*cm):
    data = [[Paragraph(a, st_tcellb), Paragraph(b, st_tcell)] for a, b in rows]
    t = Table(data, colWidths=[col0, col1])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, LINE),
        ('BACKGROUND', (0,0), (0,-1), CREAM),
    ]))
    story.append(t)
    SP(8)

# ============================================================ PORTADA / HEADER
story.append(Spacer(1, 6))
title = Table([[Paragraph('ENTREVELAS', S('t', fontName='Times-Bold', fontSize=30,
                 textColor=CREAM, alignment=TA_CENTER, leading=34))],
               [Paragraph('Velas 100% a mano', S('ts', fontName='Helvetica', fontSize=11,
                 textColor=colors.HexColor('#E8DDCF'), alignment=TA_CENTER))],
               [Spacer(1,4)],
               [Paragraph('Manual de uso', S('ts2', fontName='Helvetica-Bold', fontSize=13,
                 textColor=AMBER, alignment=TA_CENTER))]],
              colWidths=[16.4*cm])
title.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), COFFEE),
    ('TOPPADDING', (0,0), (-1,0), 26),
    ('BOTTOMPADDING', (0,-1), (-1,-1), 22),
    ('TOPPADDING', (0,1), (-1,-1), 0),
]))
story.append(title)
SP(10)
P('Bienvenida. Esta aplicacion es como un <b>cuaderno inteligente</b> para el taller: '
  'te ayuda a llevar el control de tus velas, saber cuanto te cuesta cada una y acompañarte '
  'mientras las produces. No necesitas saber de computadoras para usarla. Vamos despacio.')

# ============================================================ 1. ABRIR LA APP
H1('1. Como abrir la aplicacion')
P('La aplicacion vive en esta direccion de internet:')
story.append(Paragraph('https://marianomgl.github.io/entrevelas/', st_url))
SP(4)
P('<b>Para no escribirla cada vez</b>, te conviene guardarla:')
H2('En computadora (Chrome o Safari)')
bullets([
    'Abre la direccion.',
    'Cuando cargue, busca la estrellita junto a la direccion de arriba y dale clic. '
    'Eso la guarda en "Favoritos".',
])
H2('En tablet o celular')
bullets([
    'Abre la direccion en el navegador (Safari o Chrome).',
    'Toca el boton de <b>Compartir</b> (un cuadrito con una flecha hacia arriba).',
    'Elige <b>"Agregar a pantalla de inicio"</b>.',
    'Te quedara como un botoncito, igual que cualquier otra aplicacion.',
])
callout('<b>Importante:</b> La aplicacion guarda tu informacion <b>en el aparato que estes '
        'usando</b> (esa tablet o esa computadora). Si abres la app en otra maquina, no veras '
        'los mismos datos. Por eso conviene usar siempre el mismo aparato del taller.')

# ============================================================ 2. PANTALLA
H1('2. Que hay en la pantalla')
P('Del lado izquierdo veras una <b>barra cafe</b> con un menu. Cada opcion es una seccion '
  'distinta. Le das clic a la que quieras usar:')
info_table([
    ('Dashboard', 'La pantalla de inicio. Te muestra de un vistazo como va todo hoy.'),
    ('Inventario', 'Tu lista de materiales: ceras, colores, aromas, etc.'),
    ('Catalogo', 'Tus modelos de velas.'),
    ('Ordenes de Produccion', 'Aqui empiezas y sigues cada lote de velas. Es lo que mas vas a usar.'),
    ('Costeo por modelo', 'Te dice cuanto cuesta hacer cada vela y a que precio venderla.'),
    ('Precios de venta', 'La lista de precios de todos tus modelos.'),
    ('Punto de equilibrio', 'Cuantas velas necesitas vender para no perder.'),
    ('Capacidad instalada', 'Cuantas velas alcanzas a hacer en un mes.'),
    ('Costos fijos', 'Tus gastos mensuales (renta, luz, etc.).'),
])

# ============================================================ 3. DASHBOARD
H1('3. La pantalla de inicio (Dashboard)')
P('Es lo primero que ves. Te muestra tres cosas importantes:')
bullets([
    '<b>Arriba:</b> los lotes que tienes ahorita: los que estas haciendo, los que estan '
    'reposando y los que ya estan listos para entregar.',
    '<b>En medio:</b> avisos. Por ejemplo, si te estas quedando sin algun material '
    '(aparece en rojo).',
    '<b>Abajo:</b> numeros del mes: cuantas velas hiciste, cuanto cuesta en promedio cada una, etc.',
])
P('No tienes que hacer nada aqui, solo mirar. Es tu "tablero" para saber como va el taller.')

# ============================================================ 4. INVENTARIO
H1('4. El Inventario (tus materiales)')
P('Aqui esta la lista de todo lo que usas: ceras, colorantes, fragancias, pabilos, empaque.')
H2('Para cambiar algo (por ejemplo, el precio subio o compraste mas)')
bullets([
    'Da clic en <b>"Editar"</b> al final del renglon de ese material.',
    'Cambia el numero que necesites.',
    'Da clic en el <b>boton verde</b> para guardar.',
])
P('<b>Para agregar un material nuevo:</b> da clic en el boton naranja '
  '<b>"+ Agregar insumo"</b> arriba a la derecha, llena los datos y guarda.')
callout('La aplicacion calcula sola el <b>precio por gramo</b> o por pieza. Tu solo pones '
        'cuanto te costo la bolsa o el frasco y cuanto trae. Si un material se esta acabando, '
        'aparecera una etiqueta roja que dice <b>"bajo minimo"</b>: es tu recordatorio de volver a comprar.',
        bg=colors.HexColor('#FBF0EA'), bar=ALERT)

# ============================================================ 5. PRODUCIR (corazon)
H1('5. El corazon de la app: producir un lote de velas')
P('Esto es lo mas importante. La aplicacion te acompaña <b>paso por paso</b> mientras haces '
  'las velas, como una recetita guiada.')
H2('Primero: crear la orden')
bullets([
    'En el menu, entra a <b>Ordenes de Produccion</b>.',
    'Da clic en <b>"+ Nueva orden"</b>.',
    'Elige el <b>modelo</b> de vela, escribe <b>cuantas piezas</b> vas a hacer y las fechas.',
    'Si es un pedido especial (personalizado), prende el botoncito y pon el cargo extra.',
    'Da clic en <b>"Crear orden e iniciar flujo"</b>.',
])
P('La aplicacion le pone un numero solita (OP-001, OP-002, etc.) para que no te pierdas.')
H2('Despues: los 6 pasos')
P('Veras una barra con <b>6 velitas</b> arriba. Asi sabes en que paso vas:')
bullets([
    '<b>Velita apagada</b> = todavia no llegas a ese paso.',
    '<b>Llama encendida</b> = es el paso en el que estas <b>ahorita</b>.',
    '<b>Palomita</b> = ese paso ya lo terminaste.',
])
SP(2)
steps = [
    ('Paso 1 - Preparacion de la cera',
     'La app te dice <b>exactamente cuantos gramos</b> de cada cera pesar. Conforme vas pesando, '
     've marcando la palomita de cada una. Hay un <b>cronometro</b> para medir cuanto tardo en '
     'derretirse. Al terminar, da clic en <b>"Cera lista"</b>.'),
    ('Paso 2 - El color',
     'Eliges el color y la app te dice cuantos gramos de cada colorante. Si te pasas de la '
     'cantidad recomendada, te avisa con un mensaje. Da clic en <b>"Color listo"</b>.'),
    ('Paso 3 - El aroma',
     'Eliges la fragancia y mueves la barrita del porcentaje. La app te calcula cuantos gramos '
     'echar. (Recuerda: la fragancia se agrega cuando la cera ya bajo de 70 grados.) '
     'Da clic en <b>"Aroma listo"</b>.'),
    ('Paso 4 - La mezcla',
     'Anotas las temperaturas y la humedad, confirmas que los moldes y pabilos estan listos '
     '(con sus palomitas). Da clic en <b>"Mezcla lista"</b>.'),
    ('Paso 5 - Llenar los moldes',
     'Hay un contador grande con botones <b>+</b> y <b>-</b>. Cada vez que llenas una vela, le '
     'das al <b>+</b>. Asi llevas la cuenta: "12 de 30 llenadas". Si hubo algun problema, lo marcas. '
     'Da clic en <b>"Llenado completo"</b>.'),
    ('Paso 6 - Reposo y curado',
     'Las velas necesitan descansar (minimo 24 horas). La app pone un <b>reloj que cuenta para '
     'atras</b> y te avisa cuando ya paso el tiempo. Cuando esten listas, escribes como quedaron '
     'y das clic en <b>"Aprobar lote"</b>.'),
]
for titulo, texto in steps:
    block = [Paragraph(titulo, S('sh', fontName='Helvetica-Bold', fontSize=11, textColor=COFFEE, leading=14, spaceAfter=2)),
             Paragraph(texto, st_body)]
    t = Table([[block]], colWidths=[16.4*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM),
        ('LEFTPADDING', (0,0), (-1,-1), 12), ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBEFORE', (0,0), (0,-1), 3, AMBER),
    ]))
    story.append(KeepTogether(t))
    SP(6)
callout('Al aprobar, la aplicacion <b>descuenta sola los materiales que usaste</b> del inventario '
        'y te genera una <b>ficha</b> con todo lo que registraste. Y no te preocupes si cierras la '
        'app a media produccion: <b>todo lo que anotaste se queda guardado</b>. Cuando vuelvas a '
        'entrar a la orden, sigues donde te quedaste.', bg=colors.HexColor('#EEF3EC'), bar=SAGE)

# ============================================================ 6. FICHA
H1('6. La Ficha de Produccion (imprimir)')
P('Cuando terminas un lote, se crea una hoja con todos los datos: la formula de la cera, el '
  'color, el aroma, las temperaturas, el resultado.')
H2('Para imprimirla o guardarla en PDF')
bullets([
    'Estando en la ficha, da clic en el boton <b>"Imprimir / Guardar PDF"</b>.',
    'Se abre el cuadro de impresion de siempre.',
    'Si quieres papel, eliges tu impresora. Si quieres guardarla en la computadora, '
    'eliges <b>"Guardar como PDF"</b>.',
])

# ============================================================ 7. COSTEO
H1('7. Saber cuanto cuesta y a que precio vender')
P('Entra a <b>Costeo por modelo</b>:')
bullets([
    'Elige el modelo de vela arriba.',
    'La app te muestra <b>cuanto cuesta hacer esa vela</b>, desglosado: materiales, tu trabajo, '
    'gastos (luz, renta) y la merma.',
    'Abajo hay una barrita de <b>"Margen"</b>. Muevela y veras como cambia el <b>precio de venta '
    'sugerido</b>: con IVA y sin IVA, y cuanto ganarias.',
    'Si te gusta ese precio, da clic en <b>"Guardar costeo"</b>.',
])
callout('Mientras mas a la derecha muevas el margen, mas caro vendes y mas ganas. '
        'Tu decides el equilibrio justo.')

# ============================================================ 8. FAQ
H1('8. Preguntas frecuentes')
faq = [
    ('Se pierde mi informacion si cierro la app?',
     'No. Todo queda guardado en ese aparato, aunque la cierres o apagues la tablet.'),
    ('Puedo usarla sin internet?',
     'Necesitas internet para abrirla la primera vez. Si la guardaste en la pantalla de inicio, '
     'despues funciona aunque la señal vaya y venga.'),
    ('Me equivoque y quiero empezar de cero.',
     'Entra a "Costos fijos" y, hasta abajo, da clic en "Restaurar datos de ejemplo". Ojo: esto '
     'borra lo que hayas capturado y regresa todo a como venia de fabrica. Usalo solo si de '
     'verdad quieres reiniciar.'),
    ('Y si cambio de tablet o de computadora?',
     'Los datos no se pasan solos. Avisale a quien te ayuda con la app para mover la informacion.'),
    ('Algo se ve raro o no responde.',
     'Cierra la pagina y vuelvela a abrir. Casi siempre se arregla asi. Si no, reinicia el aparato.'),
]
for q, a in faq:
    story.append(Paragraph(q, S('faq', fontName='Helvetica-Bold', fontSize=11, textColor=COFFEE, spaceBefore=8, spaceAfter=2, leading=14)))
    story.append(Paragraph(a, st_body))

# ============================================================ RESUMEN
H1('En resumen')
bullets([
    'Abre la app desde tu boton guardado.',
    'Para hacer velas: <b>Ordenes &gt; Nueva orden</b> y sigue los 6 pasos.',
    'Para ver precios: <b>Costeo por modelo</b>.',
    'Para revisar materiales: <b>Inventario</b>.',
    'Cuando termines un lote, <b>imprime la ficha</b>.',
])
P('Con la practica de unos dias, esto se va a sentir tan natural como tu libreta de siempre, '
  'pero haciendo las cuentas por ti.')

# ============================================================ DOC + PIE
def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(2.3*cm, 1.5*cm, letter[0]-2.3*cm, 1.5*cm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#8A7B6B'))
    canvas.drawString(2.3*cm, 1.1*cm, 'Entrevelas - Manual de uso')
    canvas.drawRightString(letter[0]-2.3*cm, 1.1*cm, 'Pagina %d' % doc.page)
    canvas.restoreState()

doc = BaseDocTemplate(OUT, pagesize=letter,
                      leftMargin=2.3*cm, rightMargin=2.3*cm,
                      topMargin=2*cm, bottomMargin=2*cm,
                      title='Entrevelas - Manual de uso', author='Entrevelas')
frame = Frame(doc.leftMargin, doc.bottomMargin,
              doc.width, doc.height, id='main')
doc.addPageTemplates([PageTemplate(id='all', frames=[frame], onPage=footer)])
doc.build(story)
print('PDF generado:', OUT)

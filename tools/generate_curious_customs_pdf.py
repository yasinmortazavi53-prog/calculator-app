#!/usr/bin/env python3
"""
Generates a three-page, English-language PDF:
"Curious Customs of the World - strange rituals and traditions from around the globe".

Output: ../curious-customs-around-the-world.pdf  (repo root)
Requires: reportlab (pip install reportlab)
"""

import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, Spacer,
    Table, TableStyle,
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, os.pardir, "curious-customs-around-the-world.pdf")

# ----------------------------------------------------------------------------
# Palette & page geometry
# ----------------------------------------------------------------------------
INK = colors.HexColor("#14252E")      # near-black slate
ACCENT = colors.HexColor("#B23A32")   # terracotta
TEAL = colors.HexColor("#1F6F78")     # deep teal
GOLD = colors.HexColor("#C08A2E")     # ochre
PAPER = colors.HexColor("#F6F3ED")    # warm paper
GREY = colors.HexColor("#6B7A80")

PAGE_W, PAGE_H = A4
STRIPE_W = 5.5 * mm                    # decorative left stripe
LEFT = STRIPE_W + 15 * mm
RIGHT = PAGE_W - 16 * mm
TOP = PAGE_H - 20 * mm
BOTTOM = 17 * mm
FRAME_W = RIGHT - LEFT

TOTAL_PAGES = 3

# ----------------------------------------------------------------------------
# Styles
# ----------------------------------------------------------------------------
S = {}
S["kicker"] = ParagraphStyle(
    "kicker", fontName="Helvetica-Bold", fontSize=7.6, leading=10,
    textColor=ACCENT, spaceAfter=3.2 * mm,
)
S["title"] = ParagraphStyle(
    "title", fontName="Helvetica-Bold", fontSize=27, leading=29,
    textColor=INK, spaceAfter=2.2 * mm,
)
S["subtitle"] = ParagraphStyle(
    "subtitle", fontName="Times-Italic", fontSize=12.6, leading=15,
    textColor=TEAL, spaceAfter=3.4 * mm,
)
S["byline"] = ParagraphStyle(
    "byline", fontName="Helvetica", fontSize=7.6, leading=10,
    textColor=GREY, spaceAfter=1.8 * mm,
)
S["intro"] = ParagraphStyle(
    "intro", fontName="Times-Roman", fontSize=10.8, leading=15.2,
    textColor=INK, alignment=TA_JUSTIFY, spaceAfter=1.2 * mm,
)
S["first"] = ParagraphStyle(
    "first", parent=S["intro"],
    firstLineIndent=0,
)
S["section"] = ParagraphStyle(
    "section", fontName="Helvetica-Bold", fontSize=9.6, leading=12,
    textColor=colors.white,
)
S["entry"] = ParagraphStyle(
    "entry", fontName="Helvetica-Bold", fontSize=10.3, leading=12.6,
    textColor=INK, spaceAfter=1.4 * mm,
)
S["body"] = ParagraphStyle(
    "body", fontName="Times-Roman", fontSize=10.4, leading=14.6,
    textColor=INK, alignment=TA_JUSTIFY,
)
S["box_title"] = ParagraphStyle(
    "box_title", fontName="Helvetica-Bold", fontSize=8.4, leading=11,
    textColor=TEAL, spaceAfter=1.6 * mm,
)
S["box_body"] = ParagraphStyle(
    "box_body", fontName="Times-Roman", fontSize=9.6, leading=13,
    textColor=INK, alignment=TA_LEFT,
)
S["closing"] = ParagraphStyle(
    "closing", fontName="Times-Roman", fontSize=10.5, leading=14.8,
    textColor=INK, alignment=TA_JUSTIFY,
)
S["source"] = ParagraphStyle(
    "source", fontName="Helvetica-Oblique", fontSize=7.2, leading=9.6,
    textColor=GREY,
)


def section_banner(text):
    """Full-width coloured banner used as a section heading."""
    t = Table([[Paragraph(text, S["section"])]], colWidths=[FRAME_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 4.4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.4),
    ]))
    return [Spacer(1, 4.4 * mm), t, Spacer(1, 4.2 * mm)]


N = {"i": 0}


def entry(title, place, body):
    """One numbered custom: bold heading with place, then justified body."""
    N["i"] += 1
    head = Paragraph(
        '<font color="#B23A32">%d.</font>&nbsp; %s'
        ' &nbsp;<font name="Helvetica" size="8.4" color="#1F6F78">%s</font>'
        % (N["i"], title, place),
        S["entry"],
    )
    return KeepTogether([head, Paragraph(body, S["body"]), Spacer(1, 4.6 * mm)])


# ----------------------------------------------------------------------------
# Content
# ----------------------------------------------------------------------------
INTRO = (
    "Every culture keeps a handful of habits that look baffling from the outside and perfectly "
    "logical from the inside. Some began as jokes, some as prayers, some as insurance against a bad "
    "harvest. What they share is a genius for turning abstract ideas &mdash; courage, grief, gratitude, "
    "the passing of a year &mdash; into something you can see, hear, taste, or, in a few cases, be hit "
    "by. Here are fifteen of the strangest customs on Earth, and the reasoning hidden inside each one."
)

SECTIONS = [
    ("I. Fire, Food and Flying Vegetables", [
        ("La Tomatina", "&middot; Bu&ntilde;ol, Spain",
         "On the last Wednesday of August, a Valencian town of 9,000 people is overrun by some 20,000 "
         "ticketed participants for the largest food fight on the planet. It started by accident in "
         "1945, when a scuffle at a parade escalated into a tomato brawl; the town liked it so much "
         "that it came back the next year. Today seven trucks tip 120&ndash;150 tonnes of overripe, "
         "deliberately inedible tomatoes into the Plaza del Pueblo, and water cannons open and close a "
         "battle that lasts exactly one hour. The fruit's acidity scours the streets so thoroughly "
         "that Bu&ntilde;ol is often cleaner afterwards than it was the day before."),
        ("The Cheese Rolling", "&middot; Cooper's Hill, England",
         "Each spring bank holiday, a 3.5&nbsp;kg wheel of Double Gloucester cheese is rolled down a "
         "hill with roughly a 1-in-3 gradient, and dozens of contestants hurl themselves after it. The "
         "slope is about 180 metres long and the cheese can hit 70&nbsp;mph, which means it always wins "
         "the race. Volunteers chase it head over heels, somersaulting down the grass; St John "
         "Ambulance crews wait at the bottom for the inevitable sprains and bruises. Locals insist the "
         "reward is worth the risk: the winner keeps the cheese."),
        ("The Rocket War", "&middot; Vrontados, Chios, Greece",
         "On the night before Orthodox Easter, two hilltop parishes in this Aegean village revive a "
         "tradition that goes back to the Ottoman era. Thousands of homemade rockets &mdash; packed "
         "with gunpowder and lit from wooden frames &mdash; are fired at each other's bell towers "
         "across a ravine, filling the sky with smoke and shrieking light. Church windows are boarded "
         "up, worshippers attend in the line of fire, and scoring is so bitterly disputed that the two "
         "congregations simply agree to call it a draw and settle the matter the following year."),
        ("The Battle of the Oranges", "&middot; Ivrea, Italy",
         "Every February, this Piedmontese town re-enacts a medieval uprising against a tyrannical "
         "lord by pelting his 'guards' with oranges. Teams on foot represent the rebellious commoners, "
         "while costumed riders on carts play the tyrant's army; hundreds of thousands of kilograms of "
         "surplus oranges fly through the streets for three days. Bystanders who want no part of it "
         "wear a red cap &mdash; the doppio berretto &mdash; which clearly signals: do not throw at me."),
        ("The Mud Festival", "&middot; Boryeong, South Korea",
         "In 1998 the town of Boryeong needed a way to sell its mineral-rich mud cosmetics. Two decades "
         "later, its July mud festival draws tens of thousands of visitors who coat themselves head to "
         "toe in the stuff on Daecheon Beach. There are mud slides, mud baths, a mud prison, mud "
         "massages and a soapy wrestling pit, all washed off at the end of the day in the Yellow Sea. "
         "The mud is trucked in from local flats said to be rich in minerals and germanium."),
    ]),
    ("II. Rites of Passage", [
        ("Land Diving", "&middot; Pentecost Island, Vanuatu",
         "Long before commercial bungee jumping existed, men and boys on this Melanesian island were "
         "leaping from towers up to 30 metres tall with nothing but forest vines tied to their ankles. "
         "The vines are measured against each diver's own height so that the best land with their hair, "
         "or their shoulders, brushing the ground. Performed at the yam harvest, the naghol is a prayer "
         "for a fertile crop and a public test of nerve; legend says it began with a woman who escaped "
         "her husband by jumping from a tree, after which the men took up the leap to prove they could "
         "do it too."),
        ("The Bullet-Ant Gloves", "&middot; Brazilian Amazon",
         "Young men of the Sat&eacute;r&eacute;-Maw&eacute; people prove they are ready for adulthood "
         "by wearing gloves woven from leaves and filled with live bullet ants &mdash; the insect whose "
         "sting tops the Schmidt pain index and has been described as walking over flaming charcoal "
         "with a rusty nail in your heel. The ants are knocked out with a herbal brew before the gloves "
         "are woven and wake up as they are worn. Initiates keep them on for five to ten minutes, "
         "dancing to distract themselves from the pain, and repeat the ordeal over many months."),
        ("The Gerewol Beauty Contest", "&middot; Niger",
         "When the rains end, Wodaabe herders gather for the Cure Sal&eacute;e, and young men compete "
         "in a courtship contest that reverses the usual festival roles. They paint their faces with "
         "yellow and red ochre, braid their hair, tie on ostrich feathers and strings of beads, then "
         "dance the yaake for hours &mdash; rolling their eyes and grinning to show off long white "
         "teeth, which are considered the height of beauty. Women judge the contest and may choose a "
         "new partner by the end of the night."),
        ("Skulls at Home", "&middot; La Paz, Bolivia",
         "Every November, families across the Bolivian highlands bring human skulls to the cemetery for "
         "a day of celebration. Kept at home through the year, these &ntilde;atitas &mdash; 'little "
         "flat-nosed ones' &mdash; are dressed with flowers, sunglasses, hats, coca leaves and "
         "sometimes banknotes, and thanked for favours granted. Priests bless them at Mass before the "
         "skulls go back to their household shrines, fed and feted, for another year of guarding the "
         "family."),
    ]),
    ("III. When the Rules Are Suspended", [
        ("Takanakuy", "&middot; Chumbivilcas, Peru",
         "In the Peruvian Andes, Christmas Day is settling day. Neighbours who have quarrelled during "
         "the year meet in a public arena and fight it out under the eye of a referee, wearing "
         "embroidered jackets and carved leather masks that hide their faces and their fear. Punches "
         "are exchanged until one fighter yields or the judge stops it, and every bout ends in an "
         "embrace. Afterwards the whole community eats, drinks and watches the sun come up, entering "
         "the new year without grudges."),
        ("Nyepi, the Day of Silence", "&middot; Bali, Indonesia",
         "For twenty-four hours each March, Bali switches itself off. On Nyepi, the Balinese Hindu new "
         "year, nobody lights a fire, works, travels or makes a sound; the streets stand empty, hotels "
         "draw their curtains, and the island's international airport closes, forcing airlines to "
         "reroute around it. The stillness is a decoy: by making the island look abandoned, Balinese "
         "families believe they can fool the demons that roam the night. The evening before, huge "
         "papier-m&acirc;ch&eacute; ogoh-ogoh effigies of those demons are paraded through the villages "
         "and burned."),
        ("The Naked Man Festival", "&middot; Okayama, Japan",
         "Every February, around nine thousand men wearing only white fundoshi loincloths crowd into "
         "Saidaiji Kannon-in temple for hadaka matsuri, one of the coldest and most chaotic rites in "
         "Japan. Purification water is thrown over the throng after dark; then the priest flings a "
         "hundred sacred wooden sticks into the crowd, and the mass of bodies surges as men fight for "
         "them. Touching a stick is said to bring a year of good fortune. The most sought-after figure "
         "is the shin-otoko, a chosen 'naked man' hidden somewhere in the crowd &mdash; to touch him is "
         "believed to be especially lucky."),
        ("Thaipusam", "&middot; Malaysia, Singapore, India",
         "Tamil devotees honour the god Murugan by carrying kavadi, decorated arches of wood and steel, "
         "along pilgrim routes and up hundreds of temple steps. Some pierce their skin, cheeks and "
         "tongues with skewers and small spears in fulfilment of a vow &mdash; a spectacle that shocks "
         "first-time visitors. The piercings are the end point of weeks of fasting, vegetarianism, "
         "celibacy and prayer, and many participants describe entering a trance in which they feel no "
         "pain at all. Most are giving thanks for a prayer answered."),
        ("Baby Jumping", "&middot; Castrillo de Murcia, Spain",
         "Once a year at Corpus Christi, men dressed as the Colacho &mdash; the devil &mdash; take a "
         "running leap over rows of babies laid out on mattresses in the street. The infants, all born "
         "within the previous twelve months, are said to be cleansed of original sin and shielded from "
         "illness for the year ahead. The tradition has run since at least 1620, and despite the "
         "screaming tabloid headlines, its safety record remains famously unblemished."),
        ("The Midwinter Feast", "&middot; Iceland",
         "At the darkest point of the Icelandic winter, families sit down to the food their "
         "great-grandparents survived on: h&aacute;karl, Greenland shark buried and hung for months to "
         "leach out its toxins; svid, a singed sheep's head; blood pudding; and ram testicles, all "
         "washed down with Brenniv&iacute;n, the caraway schnapps nicknamed 'Black Death'. Honouring "
         "the old Norse month of Thorri, the Thorrabl&oacute;t is equal parts heritage, dare and test "
         "of nerve &mdash; and it is always better with strangers at the table."),
    ]),
]

CLOSING_TITLE = "Why We Keep Doing It"
CLOSING = (
    "Behind almost every strange custom is an ordinary need: to bind a community together, to mark a "
    "season or a threshold, to turn fear of the unknown into a story that people can act out side by "
    "side. The details look wild from a distance &mdash; rockets, ochre, ants, oranges &mdash; but the "
    "grammar repeats everywhere: a rule, a costume, a crowd, a reason to gather. Nor are these "
    "traditions frozen in amber. Up Helly Aa, the Shetland fire festival that has lit up the last "
    "Tuesday of January since the 1880s and burns a hand-built Viking longship each year, opened its "
    "Jarl Squad to women for the first time in 2024. So the next time a custom looks inexplicable, "
    "remember that it almost certainly makes perfect sense from the inside."
)

BOX_TITLE = "BY THE NUMBERS"
BOX_ROWS = [
    ("120&ndash;150 tonnes", "of overripe tomatoes thrown during one hour of La Tomatina"),
    ("1,000+", "torches carried through Lerwick at Shetland's Up Helly Aa"),
    ("4.0+", "the bullet ant's score on Schmidt's insect-sting pain index, the top of the scale"),
    ("24 hours", "for which Bali's international airport closes for Nyepi"),
]

SOURCE = (
    "Compiled September 2026 from festival organisers, national tourism boards and press reports. "
    "Dates, figures and attendance numbers vary from year to year and are given as approximations."
)

# ----------------------------------------------------------------------------
# Page furniture
# ----------------------------------------------------------------------------
def draw_furniture(canvas, doc):
    canvas.saveState()
    # decorative left stripe
    canvas.setFillColor(ACCENT)
    canvas.rect(0, 0, STRIPE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(GOLD)
    canvas.rect(0, PAGE_H * 0.62, STRIPE_W, PAGE_H * 0.38, stroke=0, fill=1)

    # running head (not on the title page)
    if doc.page > 1:
        canvas.setFont("Helvetica-Bold", 7.2)
        canvas.setFillColor(TEAL)
        canvas.drawString(LEFT, PAGE_H - 13.5 * mm, "CURIOUS CUSTOMS OF THE WORLD")
        canvas.setStrokeColor(colors.HexColor("#D8D3C8"))
        canvas.setLineWidth(0.6)
        canvas.line(LEFT, PAGE_H - 16 * mm, RIGHT, PAGE_H - 16 * mm)

    # footer
    canvas.setStrokeColor(colors.HexColor("#D8D3C8"))
    canvas.setLineWidth(0.6)
    canvas.line(LEFT, BOTTOM - 3.2 * mm, RIGHT, BOTTOM - 3.2 * mm)
    canvas.setFont("Helvetica", 7.2)
    canvas.setFillColor(GREY)
    canvas.drawString(LEFT, BOTTOM - 7.6 * mm, "Strange rituals and traditions from around the globe")
    canvas.setFont("Helvetica-Bold", 7.2)
    canvas.setFillColor(ACCENT)
    canvas.drawRightString(RIGHT, BOTTOM - 7.6 * mm, "Page %d of %d" % (doc.page, TOTAL_PAGES))
    canvas.restoreState()


def build():
    doc = BaseDocTemplate(
        OUT, pagesize=A4,
        leftMargin=LEFT, rightMargin=PAGE_W - RIGHT,
        topMargin=PAGE_H - TOP, bottomMargin=BOTTOM,
        title="Curious Customs of the World",
        author="Arena.ai Agent Mode",
        subject="Strange rituals and traditions from around the world",
        creator="ReportLab",
    )
    frame = Frame(LEFT, BOTTOM, FRAME_W, TOP - BOTTOM, id="main",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=draw_furniture)])

    story = []
    # ---- title block -------------------------------------------------------
    story.append(Paragraph("A THREE-PAGE FIELD GUIDE TO THE ODDEST TRADITIONS ON EARTH", S["kicker"]))
    story.append(Paragraph("Curious Customs of the World", S["title"]))
    story.append(Paragraph("Fifteen peculiar rituals, and the logic hiding inside each one", S["subtitle"]))
    story.append(Paragraph("Compiled September 2026 &nbsp;&middot;&nbsp; Reading time about 9 minutes", S["byline"]))
    rule = Table([[""]], colWidths=[FRAME_W], rowHeights=[1.6])
    rule.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), INK)]))
    story.append(rule)
    story.append(Spacer(1, 4.4 * mm))
    story.append(Paragraph(INTRO, S["intro"]))

    # ---- sections ----------------------------------------------------------
    for idx, (title, items) in enumerate(SECTIONS):
        story += section_banner(title)
        for item in items:
            story.append(entry(*item))
        if idx == 1:  # start page three
            story.append(Spacer(1, 2 * mm))

    # ---- closing + numbers box --------------------------------------------
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        '<font color="#1F6F78">%s.</font>' % CLOSING_TITLE,
        ParagraphStyle("ct", parent=S["entry"], fontSize=11.4, leading=14)))
    story.append(Paragraph(CLOSING, S["closing"]))
    story.append(Spacer(1, 5 * mm))

    rows = [[Paragraph(BOX_TITLE, S["box_title"])]]
    for k, v in BOX_ROWS:
        rows.append([Paragraph(
            '<font name="Helvetica-Bold" color="#B23A32">%s</font>&nbsp;&nbsp;%s' % (k, v),
            S["box_body"])])
    box = Table(rows, colWidths=[FRAME_W - 8 * mm])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 2.4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.4),
        ("BOTTOMPADDING", (0, 0), (0, 0), 3.4),
        ("TOPPADDING", (0, -1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
    ]))
    story.append(box)
    story.append(Spacer(1, 4.4 * mm))
    story.append(Paragraph(SOURCE, S["source"]))

    doc.build(story)
    print("wrote", os.path.normpath(OUT))


if __name__ == "__main__":
    build()

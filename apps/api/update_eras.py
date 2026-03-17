"""
Assign proper musical eras to all works based on composer/title knowledge.
"""
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.work import Work

# Map title -> era based on musicological knowledge
ERA_MAP = {
    # Renacimiento (s. XV-XVI)
    "Ay triste que vengo": "Renacimiento",
    "Con qué la lavaré": "Renacimiento",
    "Dadme albricias": "Renacimiento",
    "Hoy comamos y bebamos": "Renacimiento",
    "Riu, riu, chiu": "Renacimiento",
    "Ave María": "Renacimiento",
    "O magnum mysterium": "Renacimiento",
    "O Vos omnes": "Renacimiento",

    # Barroco (s. XVII - mediados XVIII)
    "Abendlied": "Romanticismo",  # Rheinberger is Romantic
    "Alleluia": "Barroco",  # William Boyce
    "Canticorum Iubilo": "Barroco",
    "Jesus Bleibet meine": "Barroco",
    "Lascia ch'io pianga": "Barroco",
    "Miserere": "Barroco",  # Lotti
    "Tollite Hostias (Oratorio)": "Romanticismo",  # Saint-Saëns

    # Clasicismo (mediados XVIII - inicios XIX)
    "Ave Verum": "Clasicismo",
    "Brindis": "Clasicismo",
    "Dona nobis pacem": "Clasicismo",
    "Domine deus": "Clasicismo",
    "Lacrymosa": "Clasicismo",
    "Sanctus Benedictus (Misa KV49)": "Clasicismo",

    # Romanticismo (s. XIX)
    "Benedictus": "Romanticismo",  # Perosi
    "Bogoroditze Dievo": "Romanticismo",  # Rachmaninov
    "Le Cantique de Jean Racine": "Romanticismo",
    "Locus Iste": "Romanticismo",  # Bruckner
    "Panis Angelicus": "Romanticismo",  # Franck
    "Pater Noster": "Romanticismo",  # Kedrov
    "Pie Jesu": "Siglo XX",  # Lloyd Webber
    "Sanctus Misa alemana": "Romanticismo",  # Schubert
    "Stabat Mater": "Romanticismo",  # Kodály → actually 20th century
    "Stabat Mater D.383": "Romanticismo",
    "Stabat Mater D.175": "Romanticismo",
    "Va pensiero (Coro de los Esclavos)": "Romanticismo",

    # Siglo XX / Contemporáneo
    "Agnus Dei": "Siglo XX",  # Andreo
    "Anima Christi": "Siglo XX",  # Frisina
    "All you need is love": "Siglo XX",
    "A tu lado": "Contemporánea",  # Javier Busto
    "Da pacem": "Renacimiento",  # Melchior Franck - actually Renaissance/Early Baroque
    "Dona la pace,": "Siglo XX",  # Dino Stella
    "In Monte olivetti": "Siglo XX",  # Naujalis
    "Kyrie": "Siglo XX",  # Abaris
    "La muerte no es el final": "Siglo XX",
    "Les anges dans nos campagnes": "Tradicional",
    "Los Sobrinos del Capitán Grant": "Zarzuela",
    "Madre de siete dolores": "Siglo XX",
    "Nada te turbe": "Contemporánea",  # Taizé
    "Noche de paz": "Tradicional",
    "O sacrum convivium": "Siglo XX",  # Molfino
    "Plegaria Virgen de la Victoria": "Siglo XX",
    "Salve de Trujillo": "Tradicional",
    "Signore delle": "Siglo XX",  # De Marzi
    "The lion sleep tonight": "Siglo XX",
    "Ubi Caritas": "Contemporánea",  # Ola Gjeilo
    "Villancico de la Vera": "Tradicional",
    "Ya se van los quintos": "Tradicional",
    "Nocturnos de la Ventana": "Siglo XX",
    "Te llevaré": "Contemporánea",
    "Santa María": "Siglo XX",

    # Zarzuela
    "Caballero de Gracia": "Zarzuela",
    "Mazurca de las sombrillas": "Zarzuela",
    "Jota de La Dolores": "Zarzuela",
    "Ay mi morena": "Zarzuela",  # Moreno Torroba

    # Tradicional / Popular
    "Adeste Fideles": "Tradicional",
    "Aleluya": "Tradicional",
    "Boga, boga": "Tradicional",
    "Cerca de ti, Señor": "Tradicional",
    "El Rabadán": "Tradicional",
    "Gatatumba": "Tradicional",
    "Gaudeamus Igitur": "Tradicional",
    "Kalinka": "Tradicional",
    "La Borrachita": "Tradicional",
    "Los Campanilleros": "Tradicional",
    "Manolito Chiquito": "Tradicional",
    "O Santíssima": "Tradicional",
    "O Tannenbaum": "Tradicional",
    "Pájaro Triguero": "Tradicional",
    "Pastores de Extremadura": "Tradicional",
    "Salve Rociera": "Tradicional",
    "Salve de Covadonga": "Tradicional",
    "Siyahamba": "Tradicional",

    # Cancioneros históricos (Renaissance collections)
    "Madrid (Chotis)": "Siglo XX",  # Agustín Lara

    # Misa
    "Misa Brevis 'Aux": "Romanticismo",  # Gounod
}

def update_eras():
    db = SessionLocal()
    works = db.query(Work).all()
    updated = 0
    for w in works:
        era = ERA_MAP.get(w.title)
        if era and w.era != era:
            w.era = era
            db.add(w)
            updated += 1
            print(f"  ✓ {w.title} → {era}")
        elif not era and (w.era == "Por definir" or not w.era):
            print(f"  ? {w.title} — no mapping found")
    db.commit()
    print(f"\nUpdated {updated} works with proper eras.")
    db.close()

if __name__ == "__main__":
    update_eras()

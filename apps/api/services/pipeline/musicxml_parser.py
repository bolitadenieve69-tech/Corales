"""MusicXML parser and SATB auto-mapping (Pipeline paso 3).

Uses music21 to parse MusicXML files, extract parts, and attempt
automatic SATB voice assignment.
"""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Keywords for auto-detection (case-insensitive)
_VOICE_KEYWORDS = {
    "S": ["soprano", "sop", "sopran", "tiple"],
    "A": ["alto", "contralto", "alt", "mezzo"],
    "T": ["tenor", "ten"],
    "B": ["bass", "bajo", "basso", "baritone", "barítono"],
}


def parse_musicxml(file_path: str) -> dict:
    """Parse a MusicXML file and extract musical information.
    
    Returns:
        dict with keys:
        - parts: list of {name, midi_range_low, midi_range_high, avg_pitch, note_count}
        - tempo: BPM (int or None)
        - time_signature: str (e.g. "4/4")
        - key_signature: str (e.g. "C major")
        - has_lyrics: bool
        - part_count: int
    """
    import music21

    logger.info(f"Parsing MusicXML: {file_path}")
    score = music21.converter.parse(file_path)

    parts_info = []
    for part in score.parts:
        pitches = []
        for note in part.recurse().notes:
            if hasattr(note, 'pitch'):
                pitches.append(note.pitch.midi)
            elif hasattr(note, 'pitches'):
                # Chord
                for p in note.pitches:
                    pitches.append(p.midi)

        part_data = {
            "name": part.partName or f"Part {len(parts_info) + 1}",
            "note_count": len(pitches),
            "midi_range_low": min(pitches) if pitches else None,
            "midi_range_high": max(pitches) if pitches else None,
            "avg_pitch": sum(pitches) / len(pitches) if pitches else None,
        }
        parts_info.append(part_data)

    # Extract tempo
    tempo = None
    for mm in score.flat.getElementsByClass('MetronomeMark'):
        tempo = int(mm.number)
        break

    # Extract time signature
    time_sig = None
    for ts in score.flat.getElementsByClass('TimeSignature'):
        time_sig = ts.ratioString
        break

    # Extract key signature
    key_sig = None
    for ks in score.flat.getElementsByClass('KeySignature'):
        key_sig = str(ks)
        break

    # Check for lyrics
    has_lyrics = any(
        True for el in score.flat.getElementsByClass('Note')
        if el.lyric is not None
    )

    result = {
        "parts": parts_info,
        "tempo": tempo,
        "time_signature": time_sig or "4/4",
        "key_signature": key_sig or "Unknown",
        "has_lyrics": has_lyrics,
        "part_count": len(parts_info),
    }
    logger.info(f"Parsed: {len(parts_info)} parts, tempo={tempo}, key={key_sig}")
    return result


def auto_map_satb(parts: list[dict]) -> Optional[dict[str, str]]:
    """Attempt automatic mapping of parts to SATB voices.
    
    Strategy (two layers):
    1. By name: check if part name contains known voice keywords
    2. By pitch range: sort by average pitch and assign top-to-bottom
    
    Args:
        parts: list of part dicts from parse_musicxml()
        
    Returns:
        dict mapping part_name → voice (S/A/T/B) if mapping is clear,
        None if ambiguous (needs manual mapping)
    """
    if not parts:
        return None

    mapping = {}
    unmapped = []

    # Layer A: try by name
    for part in parts:
        name = part["name"].strip()
        assigned = _match_by_name(name)
        if assigned:
            mapping[name] = assigned
            logger.info(f"Auto-mapped by name: '{name}' → {assigned}")
        else:
            unmapped.append(part)

    # If all parts mapped by name, we're done
    if not unmapped:
        return mapping

    # Layer B: try by pitch range (only if we have exactly the right number of unmapped parts)
    voices_needed = [v for v in ["S", "A", "T", "B"] if v not in mapping.values()]
    
    if len(unmapped) == len(voices_needed) and len(unmapped) <= 4:
        # Sort unmapped by average pitch (highest first)
        unmapped_sorted = sorted(
            unmapped,
            key=lambda p: p["avg_pitch"] if p["avg_pitch"] is not None else 0,
            reverse=True,
        )
        # Sort voices by typical range (S highest, B lowest)
        voice_order = sorted(voices_needed, key=lambda v: "SATB".index(v))

        for part, voice in zip(unmapped_sorted, voice_order):
            mapping[part["name"]] = voice
            logger.info(f"Auto-mapped by pitch: '{part['name']}' (avg={part['avg_pitch']:.0f}) → {voice}")
        
        return mapping

    # If we can't resolve it clearly, return None → NEEDS_MAPPING
    logger.warning(
        f"Cannot auto-map: {len(unmapped)} unmapped parts, "
        f"{len(voices_needed)} voices needed"
    )
    return None


def _match_by_name(name: str) -> Optional[str]:
    """Try to match a part name to a SATB voice by keyword."""
    name_lower = name.lower().strip()
    
    for voice, keywords in _VOICE_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return voice
    
    # Try single-letter match (e.g. "S", "A", "T", "B")
    clean = re.sub(r'[^a-zA-Z]', '', name).upper()
    if clean in ("S", "A", "T", "B"):
        return clean
    
    return None

"""MIDI generation from MusicXML using music21 (Pipeline paso 5).

Generates:
  - MIDI_TUTTI: all parts together
  - MIDI_S, MIDI_A, MIDI_T, MIDI_B: individual voice parts (solo)
  - MIDI_S_GUIDE, etc.: voice highlighted + rest at low volume (optional, phase 2)

Uses the SATB mapping from edition_part_mapping to know which part is which voice.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# MIDI velocity levels
VOICE_SOLO_VELOCITY = 100     # Main voice in solo/guide mode
VOICE_BACKGROUND_VELOCITY = 40  # Background voices in guide mode


def generate_all_midis(
    musicxml_path: str,
    output_dir: str,
    mapping: dict[str, str],
    tempo_factor: float = 1.0,
) -> dict[str, str]:
    """Generate MIDI files from a MusicXML score.
    
    Args:
        musicxml_path: Path to the source MusicXML file
        output_dir: Directory to write MIDI files to
        mapping: Dict of part_name → voice (S/A/T/B)
        tempo_factor: Tempo multiplier (0.75 for slow, 1.0 for normal)
        
    Returns:
        Dict of asset_type → file_path for each generated MIDI
    """
    import music21

    logger.info(f"Generating MIDIs from {musicxml_path}, mapping={mapping}")
    score = music21.converter.parse(musicxml_path)
    
    os.makedirs(output_dir, exist_ok=True)
    generated = {}

    # Apply tempo factor if not 1.0
    if tempo_factor != 1.0:
        _apply_tempo_factor(score, tempo_factor)
        suffix = "_slow" if tempo_factor < 1.0 else ""
    else:
        suffix = ""

    # 1. Generate MIDI_TUTTI (all parts)
    tutti_path = os.path.join(output_dir, f"MIDI_TUTTI{suffix}.mid")
    midi_file = music21.midi.translate.streamToMidiFile(score)
    midi_file.open(tutti_path, "wb")
    midi_file.write()
    midi_file.close()
    generated[f"MIDI_TUTTI{suffix}"] = tutti_path
    logger.info(f"Generated: {tutti_path}")

    # 2. Generate per-voice MIDIs
    # Build reverse mapping: voice → list of part names
    voice_parts = {}
    for part_name, voice in mapping.items():
        voice_parts.setdefault(voice, []).append(part_name)

    for voice in ["S", "A", "T", "B"]:
        if voice not in voice_parts:
            logger.info(f"No parts mapped to voice {voice}, skipping")
            continue

        voice_part_names = voice_parts[voice]
        
        # Create a score with only this voice's parts
        solo_score = _extract_parts(score, voice_part_names)
        if solo_score is not None:
            voice_path = os.path.join(output_dir, f"MIDI_{voice}{suffix}.mid")
            midi_file = music21.midi.translate.streamToMidiFile(solo_score)
            midi_file.open(voice_path, "wb")
            midi_file.write()
            midi_file.close()

            asset_type = _voice_to_asset_type(voice, suffix)
            generated[asset_type] = voice_path
            logger.info(f"Generated: {voice_path}")

    logger.info(f"Total MIDIs generated: {len(generated)}")
    return generated


def _extract_parts(score, part_names: list[str]):
    """Extract specific parts from a score by name."""
    import music21

    extracted = music21.stream.Score()
    
    for part in score.parts:
        name = part.partName or ""
        if name in part_names:
            extracted.insert(0, part)

    if len(extracted.parts) == 0:
        return None
    return extracted


def _apply_tempo_factor(score, factor: float):
    """Modify tempo markings in the score by a factor."""
    import music21

    for mm in score.flat.getElementsByClass('MetronomeMark'):
        mm.number = mm.number * factor


def _voice_to_asset_type(voice: str, suffix: str = "") -> str:
    """Map voice letter to asset type string."""
    voice_map = {
        "S": "MIDI_SOPRANO",
        "A": "MIDI_ALTO",
        "T": "MIDI_TENOR",
        "B": "MIDI_BASS",
    }
    base = voice_map.get(voice, f"MIDI_{voice}")
    return f"{base}{suffix}" if suffix else base

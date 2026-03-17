"""Audio rendering: MIDI → WAV → MP3 using FluidSynth + ffmpeg (Pipeline paso 6).

FluidSynth renders MIDI to WAV using a SoundFont.
ffmpeg converts WAV to MP3.

Both are system-level dependencies:
    brew install fluidsynth ffmpeg  (macOS)
    apt install fluidsynth ffmpeg   (Linux/Docker)

SoundFont: FluidR3_GM.sf2 (free, ~140MB) or any .sf2 file.
Configure via SOUNDFONT_PATH env var.
"""

import os
import subprocess
import logging

logger = logging.getLogger(__name__)

# Default SoundFont path — override with env var SOUNDFONT_PATH
DEFAULT_SOUNDFONT = os.getenv(
    "SOUNDFONT_PATH",
    "/usr/share/sounds/sf2/FluidR3_GM.sf2"  # Common Linux path
)


def check_dependencies() -> dict[str, bool]:
    """Check if FluidSynth and ffmpeg are installed."""
    result = {}
    for tool in ["fluidsynth", "ffmpeg"]:
        try:
            subprocess.run(
                [tool, "--version"],
                capture_output=True, timeout=5
            )
            result[tool] = True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            result[tool] = False
    return result


def render_midi_to_wav(
    midi_path: str,
    wav_path: str,
    soundfont_path: str = None,
    sample_rate: int = 44100,
) -> str:
    """Render a MIDI file to WAV using FluidSynth.
    
    Args:
        midi_path: Input MIDI file
        wav_path: Output WAV file path
        soundfont_path: Path to .sf2 SoundFont file
        sample_rate: Audio sample rate (default 44100)
        
    Returns:
        Path to the generated WAV file
        
    Raises:
        FileNotFoundError: If FluidSynth is not installed
        RuntimeError: If rendering fails
    """
    sf_path = soundfont_path or DEFAULT_SOUNDFONT
    
    if not os.path.exists(sf_path):
        raise FileNotFoundError(
            f"SoundFont not found: {sf_path}. "
            f"Set SOUNDFONT_PATH env var or install FluidR3_GM."
        )

    cmd = [
        "fluidsynth",
        "-ni",              # Non-interactive, no MIDI input
        "-F", wav_path,     # Output file
        "-r", str(sample_rate),
        "-T", "wav",        # Output format
        sf_path,            # SoundFont
        midi_path,          # Input MIDI
    ]

    logger.info(f"FluidSynth: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode != 0:
        raise RuntimeError(f"FluidSynth failed: {result.stderr}")

    if not os.path.exists(wav_path):
        raise RuntimeError(f"FluidSynth did not produce output: {wav_path}")

    logger.info(f"Rendered WAV: {wav_path} ({os.path.getsize(wav_path)} bytes)")
    return wav_path


def convert_wav_to_mp3(
    wav_path: str,
    mp3_path: str,
    bitrate: str = "192k",
) -> str:
    """Convert a WAV file to MP3 using ffmpeg.
    
    Args:
        wav_path: Input WAV file
        mp3_path: Output MP3 file path
        bitrate: MP3 bitrate (default "192k")
        
    Returns:
        Path to the generated MP3 file
    """
    cmd = [
        "ffmpeg",
        "-y",               # Overwrite output
        "-i", wav_path,     # Input
        "-codec:a", "libmp3lame",
        "-b:a", bitrate,
        mp3_path,
    ]

    logger.info(f"ffmpeg: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr}")

    if not os.path.exists(mp3_path):
        raise RuntimeError(f"ffmpeg did not produce output: {mp3_path}")

    logger.info(f"Converted MP3: {mp3_path} ({os.path.getsize(mp3_path)} bytes)")
    return mp3_path


def render_midi_to_mp3(
    midi_path: str,
    mp3_path: str,
    soundfont_path: str = None,
    bitrate: str = "192k",
) -> str:
    """Full pipeline: MIDI → WAV → MP3.
    
    Creates a temporary WAV, converts to MP3, then cleans up the WAV.
    """
    wav_path = mp3_path.replace(".mp3", ".wav")
    
    try:
        render_midi_to_wav(midi_path, wav_path, soundfont_path)
        convert_wav_to_mp3(wav_path, mp3_path, bitrate)
        return mp3_path
    finally:
        # Clean up intermediate WAV
        if os.path.exists(wav_path):
            os.unlink(wav_path)
            logger.info(f"Cleaned up WAV: {wav_path}")

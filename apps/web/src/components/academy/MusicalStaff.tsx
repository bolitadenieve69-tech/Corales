'use client';

import React from 'react';
import { MusicalFigure } from './MusicalFigure';

interface Note {
    pitch?: string; // e.g., 'C4', 'D4', 'G4'
    duration: string; // 'w', 'h', 'q', '8', '16', or rest versions 'rw', etc.
    label?: string;
}

interface MusicalStaffProps {
    notes: Note[];
    clef?: 'treble' | 'bass';
    width?: number | string;
    height?: number;
    showNoteNames?: boolean;
}

const LINE_SPACING = 12;
const STAFF_HEIGHT = LINE_SPACING * 4;
const PITCH_MAP_TREBLE: Record<string, number> = {
    'C4': 5,  'D4': 4,  'E4': 3,  'F4': 2,  'G4': 1,  'A4': 0,
    'B4': -1, 'C5': -2, 'D5': -3, 'E5': -4, 'F5': -5, 'G5': -6, 'A5': -7
};

export const MusicalStaff: React.FC<MusicalStaffProps> = ({
    notes,
    clef = 'treble',
    width = '100%',
    height = 140,
    showNoteNames = false
}) => {
    // 5 lines for the staff
    const lines = [0, 1, 2, 3, 4].map(i => i * LINE_SPACING);
    
    // Treble Clef simplified path
    const TrebleClef = () => (
        <path 
            d="M12 40 C 18 40, 22 35, 22 28 C 22 18, 14 12, 14 6 C 14 2, 16 0, 18 0 C 22 0, 24 6, 24 12 C 24 24, 8 28, 8 36 C 8 42, 14 46, 20 46 C 26 46, 32 42, 32 32 C 32 18, 18 8, 18 -10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform="translate(10, 10) scale(0.8)"
        />
    );

    const getNoteY = (pitch?: string) => {
        if (!pitch) return 2 * LINE_SPACING; // Middle line (B4)
        const pos = PITCH_MAP_TREBLE[pitch] || 0;
        return (pos + 2) * (LINE_SPACING / 2);
    };

    return (
        <div className="w-full bg-black/20 rounded-[2rem] p-8 border border-white/5 relative overflow-x-auto shadow-inner">
            <svg 
                width={width} 
                height={height} 
                viewBox={`0 -40 400 ${height}`}
                className="text-white overflow-visible"
            >
                {/* Staff Lines */}
                {lines.map(y => (
                    <line 
                        key={y} 
                        x1="0" y1={y} x2="100%" y2={y} 
                        stroke="rgba(255,255,255,0.15)" 
                        strokeWidth="1.5" 
                    />
                ))}

                {/* Clef */}
                <g className="text-accent-500/80">
                    <TrebleClef />
                </g>

                {/* Notes */}
                {notes.map((note, idx) => {
                    const x = 80 + idx * 70;
                    const y = getNoteY(note.pitch);
                    const isRest = note.duration.startsWith('r');
                    
                    return (
                        <g key={idx} transform={`translate(${x}, 0)`}>
                            {/* Ledger Lines */}
                            {note.pitch === 'C4' && (
                                <line x1="-12" y1={3 * LINE_SPACING} x2="12" y2={3 * LINE_SPACING} stroke="white" strokeWidth="1.5" />
                            )}
                            
                            {/* The Figure */}
                            <g transform={`translate(-16, ${isRest ? -10 : y - 32})`}>
                                <MusicalFigure type={note.duration} size={48} color="white" />
                            </g>

                            {/* Label */}
                            {showNoteNames && note.pitch && (
                                <text 
                                    x="0" y="70" 
                                    textAnchor="middle" 
                                    className="text-[10px] font-black uppercase tracking-widest fill-neutral-500"
                                >
                                    {note.pitch.replace(/\d/, '')}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

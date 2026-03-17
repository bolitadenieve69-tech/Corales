'use client';

import React from 'react';

type FigureType = 'w' | 'h' | 'q' | '8' | '16' | 'rw' | 'rh' | 'rq' | 'r8' | 'r16';

interface MusicalFigureProps {
    type: FigureType | string;
    size?: number;
    color?: string;
    className?: string;
}

export const MusicalFigure: React.FC<MusicalFigureProps> = ({ 
    type, 
    size = 48, 
    color = 'currentColor',
    className = '' 
}) => {
    // Basic SVG container
    const renderFigure = () => {
        switch (type) {
            case 'w': // Redonda (Whole)
                return (
                    <ellipse cx="12" cy="18" rx="8" ry="5" fill="none" stroke={color} strokeWidth="2.5" transform="rotate(-20 12 18)" />
                );
            case 'h': // Blanca (Half)
                return (
                    <g>
                        <ellipse cx="10" cy="32" rx="7" ry="4.5" fill="none" stroke={color} strokeWidth="2.5" transform="rotate(-20 10 32)" />
                        <path d="M16 32 L16 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                );
            case 'q': // Negra (Quarter)
            default:
                if (type !== 'q' && !['8', '16'].includes(type) && !type.startsWith('r')) {
                    // Fallback or handle unknown
                }
                return (
                    <g>
                        <ellipse cx="10" cy="32" rx="7" ry="4.5" fill={color} transform="rotate(-20 10 32)" />
                        <path d="M16 32 L16 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                );
            case '8': // Corchea (Eighth)
                return (
                    <g>
                        <ellipse cx="10" cy="32" rx="7" ry="4.5" fill={color} transform="rotate(-20 10 32)" />
                        <path d="M16 32 L16 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M16 8 C 22 12, 24 18, 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                );
            case '16': // Semicorchea (Sixteenth)
                return (
                    <g>
                        <ellipse cx="10" cy="32" rx="7" ry="4.5" fill={color} transform="rotate(-20 10 32)" />
                        <path d="M16 32 L16 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M16 8 C 22 12, 24 18, 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                        <path d="M16 14 C 22 18, 24 24, 24 30" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                    </g>
                );
            
            // Rests
            case 'rw': // Silencio de Redonda (Whole Rest)
                return (
                    <g>
                        <line x1="4" y1="12" x2="28" y2="12" stroke={color} strokeWidth="2" />
                        <rect x="8" y="12" width="16" height="6" fill={color} />
                    </g>
                );
            case 'rh': // Silencio de Blanca (Half Rest)
                return (
                    <g>
                        <line x1="4" y1="20" x2="28" y2="20" stroke={color} strokeWidth="2" />
                        <rect x="8" y="14" width="16" height="6" fill={color} />
                    </g>
                );
            case 'rq': // Silencio de Negra (Quarter Rest)
                return (
                    <path d="M12 8 L18 14 L10 22 L16 28 C 14 32, 10 34, 8 32" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'r8': // Silencio de Corchea (Eighth Rest)
                return (
                    <g>
                        <circle cx="10" cy="14" r="3" fill={color} />
                        <path d="M10 14 C 18 14, 18 20, 14 34" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                );
        }
    };

    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 32 40" 
            className={`inline-block align-middle ${className}`}
            aria-label={`Figura musical: ${type}`}
        >
            {renderFigure()}
        </svg>
    );
};

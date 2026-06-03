import React from 'react';

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Prefer a turquoise range instead of arbitrary hues (avoid violet)
    const base = 180; // turquoise-cyan around 180
    const range = 30; // small variation
    const hue = base + (Math.abs(hash) % range);
    return `hsl(${hue} 65% 45%)`;
}

function initialsFromName(name) {
    if (!name) return '—';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    const first = parts[0][0] || '';
    const last = parts[parts.length - 1][0] || '';
    return (first + last).toUpperCase();
}

export default function AvatarInitials({ name, src, size = 80, className = '', bgColor = '#13c3b8' }) {
    const s = typeof size === 'number' ? size : parseInt(size, 10) || 80;
    if (src) {
        return <img src={src} alt={name || 'Avatar'} width={s} height={s} className={className} style={{ borderRadius: '50%', objectFit: 'cover' }} />;
    }

    const initials = initialsFromName(name || '');
    // Allow explicit bgColor override or use turquoise base
    const bg = bgColor || stringToColor(name || initials) || '#13c3b8';

    return (
        <div
            className={className}
            style={{
                width: s,
                height: s,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: bg,
                color: 'white',
                fontWeight: 700,
                fontSize: Math.max(12, Math.floor(s / 2.5)),
                userSelect: 'none',
            }}
        >
            {initials}
        </div>
    );
}

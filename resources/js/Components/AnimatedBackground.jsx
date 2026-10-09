import { motion } from 'motion/react';

/**
 * AnimatedBackground – Lapis animasi latar belakang untuk halaman Display.
 * Menggunakan SVG dan CSS motion untuk performa tinggi tanpa emoji.
 * Estetika: bersih, putih, profesional dengan aksen biru-ungu lembut.
 */
export default function AnimatedBackground() {
    return (
        <div className="anim-bg-root" aria-hidden="true">
            {/* ── Layer 1: Dot Grid (statis, opacity rendah) ── */}
            <div className="anim-bg-dotgrid" />

            {/* ── Layer 2: Ambient Glow Blobs ── */}
            <motion.div
                className="anim-glow anim-glow-a"
                animate={{
                    x: [0, 40, -20, 0],
                    y: [0, -30, 50, 0],
                    scale: [1, 1.08, 0.95, 1],
                }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="anim-glow anim-glow-b"
                animate={{
                    x: [0, -50, 30, 0],
                    y: [0, 40, -20, 0],
                    scale: [1, 0.92, 1.06, 1],
                }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="anim-glow anim-glow-c"
                animate={{
                    x: [0, 25, -35, 0],
                    y: [0, -40, 20, 0],
                    scale: [1, 1.05, 0.97, 1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* ── Layer 3: Floating Geometric Orbs (Clay Palette) ── */}
            <FloatingOrb size={260} top="8%" left="5%" delay={0} duration={14} color="radial-gradient(circle at 35% 35%, rgba(255, 101, 132, 0.22), rgba(255, 101, 132, 0.05))" />
            <FloatingOrb size={180} top="65%" left="2%" delay={3} duration={18} color="radial-gradient(circle at 35% 35%, rgba(59, 130, 246, 0.20), rgba(59, 130, 246, 0.04))" />
            <FloatingOrb size={150} top="15%" left="86%" delay={1.5} duration={12} color="radial-gradient(circle at 35% 35%, rgba(139, 92, 246, 0.22), rgba(139, 92, 246, 0.05))" />
            <FloatingOrb size={210} top="72%" left="80%" delay={4} duration={16} color="radial-gradient(circle at 35% 35%, rgba(245, 158, 11, 0.20), rgba(245, 158, 11, 0.04))" />
            <FloatingOrb size={120} top="45%" left="48%" delay={6} duration={20} color="radial-gradient(circle at 35% 35%, rgba(16, 185, 129, 0.20), rgba(16, 185, 129, 0.04))" />

            {/* ── Layer 4: Animated SVG Patterns ── */}
            <svg
                className="anim-svg-layer"
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Diagonal sweep lines */}
                <motion.line
                    x1="-100" y1="900" x2="500" y2="-100"
                    stroke="rgba(99,102,241,0.14)" strokeWidth="2"
                    animate={{ x1: ['-100', '200', '-100'], y1: ['900', '700', '900'] }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.line
                    x1="200" y1="950" x2="900" y2="-100"
                    stroke="rgba(59,130,246,0.10)" strokeWidth="1.5"
                    animate={{ x1: ['200', '400', '200'] }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                />
                <motion.line
                    x1="1000" y1="950" x2="1600" y2="-100"
                    stroke="rgba(139,92,246,0.12)" strokeWidth="1.5"
                    animate={{ x1: ['1000', '850', '1000'] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                />

                {/* Animated rings */}
                <motion.circle
                    cx="150" cy="150" r="80" fill="none"
                    stroke="rgba(99,102,241,0.18)" strokeWidth="2"
                    animate={{ r: [80, 115, 80], opacity: [0.18, 0.06, 0.18] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.circle
                    cx="1300" cy="750" r="100" fill="none"
                    stroke="rgba(59,130,246,0.15)" strokeWidth="1.5"
                    animate={{ r: [100, 135, 100], opacity: [0.15, 0.05, 0.15] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
                <motion.circle
                    cx="720" cy="450" r="200" fill="none"
                    stroke="rgba(139,92,246,0.10)" strokeWidth="1.5"
                    animate={{ r: [200, 245, 200], opacity: [0.10, 0.03, 0.10] }}
                    transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                />

                {/* Floating diamond shapes */}
                <AnimatedDiamond cx={80}   cy={500} size={24} delay={0} color="rgba(99,102,241,0.22)" />
                <AnimatedDiamond cx={1380} cy={200} size={18} delay={2} color="rgba(59,130,246,0.20)" />
                <AnimatedDiamond cx={700}  cy={50}  size={28} delay={4} color="rgba(139,92,246,0.18)" />
                <AnimatedDiamond cx={400}  cy={830} size={20} delay={1} color="rgba(99,102,241,0.18)" />
                <AnimatedDiamond cx={1100} cy={600} size={26} delay={3} color="rgba(16,185,129,0.16)"  />

                {/* Subtle horizontal wave arcs */}
                <motion.path
                    d="M 0 450 Q 360 400 720 450 Q 1080 500 1440 450"
                    fill="none"
                    stroke="rgba(99,102,241,0.04)"
                    strokeWidth="2"
                    animate={{
                        d: [
                            'M 0 450 Q 360 400 720 450 Q 1080 500 1440 450',
                            'M 0 450 Q 360 500 720 450 Q 1080 400 1440 450',
                            'M 0 450 Q 360 400 720 450 Q 1080 500 1440 450',
                        ],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.path
                    d="M 0 650 Q 360 620 720 650 Q 1080 680 1440 650"
                    fill="none"
                    stroke="rgba(59,130,246,0.03)"
                    strokeWidth="1.5"
                    animate={{
                        d: [
                            'M 0 650 Q 360 620 720 650 Q 1080 680 1440 650',
                            'M 0 650 Q 360 680 720 650 Q 1080 620 1440 650',
                            'M 0 650 Q 360 620 720 650 Q 1080 680 1440 650',
                        ],
                    }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                />
            </svg>

            {/* ── Layer 5: Floating Particle Dots ── */}
            {PARTICLES.map((p) => (
                <motion.div
                    key={p.id}
                    className="anim-particle"
                    style={{
                        width: p.size,
                        height: p.size,
                        top: p.top,
                        left: p.left,
                        background: p.color,
                    }}
                    animate={{ y: [0, -p.travel, 0], opacity: [p.opacity, p.opacity * 0.4, p.opacity] }}
                    transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                />
            ))}
        </div>
    );
}

// ── Subcomponen: Floating Orb ────────────────────────────────────────────────
function FloatingOrb({ size, top, left, delay, duration, color }) {
    return (
        <motion.div
            className="anim-orb"
            style={{ width: size, height: size, top, left, background: color }}
            animate={{ y: [0, -20, 0], scale: [1, 1.04, 1] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

// ── Subcomponen: Animated Diamond (SVG) ─────────────────────────────────────
function AnimatedDiamond({ cx, cy, size, delay, color }) {
    const half = size / 2;
    const points = `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
    return (
        <motion.polygon
            points={points}
            fill={color}
            animate={{ rotate: [0, 180, 360], scale: [1, 1.15, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            transition={{ duration: 12 + delay * 2, repeat: Infinity, ease: 'linear', delay }}
        />
    );
}

// ── Data: Particle Dots ──────────────────────────────────────────────────────
const PARTICLES = [
    { id: 1,  size: 10, top: '15%', left: '12%', color: 'rgba(255,101,132,0.65)', opacity: 0.65, travel: 25, duration: 9,  delay: 0   },
    { id: 2,  size: 8,  top: '32%', left: '78%', color: 'rgba(59,130,246,0.60)',  opacity: 0.60, travel: 30, duration: 11, delay: 1.5 },
    { id: 3,  size: 11, top: '58%', left: '22%', color: 'rgba(139,92,246,0.65)', opacity: 0.65, travel: 18, duration: 13, delay: 2   },
    { id: 4,  size: 7,  top: '72%', left: '65%', color: 'rgba(245,158,11,0.60)',  opacity: 0.60, travel: 22, duration: 8,  delay: 3   },
    { id: 5,  size: 9,  top: '88%', left: '40%', color: 'rgba(16,185,129,0.55)', opacity: 0.55, travel: 28, duration: 15, delay: 0.5 },
    { id: 6,  size: 8,  top: '5%',  left: '55%', color: 'rgba(236,72,153,0.60)', opacity: 0.60, travel: 20, duration: 10, delay: 4   },
    { id: 7,  size: 7,  top: '45%', left: '92%', color: 'rgba(99,102,241,0.55)', opacity: 0.55, travel: 32, duration: 12, delay: 2.5 },
    { id: 8,  size: 10, top: '25%', left: '35%', color: 'rgba(16,185,129,0.55)', opacity: 0.55, travel: 16, duration: 16, delay: 1   },
    { id: 9,  size: 8,  top: '60%', left: '50%', color: 'rgba(249,115,22,0.55)', opacity: 0.55, travel: 24, duration: 14, delay: 3.5 },
    { id: 10, size: 9,  top: '80%', left: '8%',  color: 'rgba(236,72,153,0.60)', opacity: 0.60, travel: 20, duration: 11, delay: 0.8 },
];

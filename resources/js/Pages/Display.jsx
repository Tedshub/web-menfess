import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../Components/Navbar';
import { useAntreanPesan } from '../hooks/useAntreanPesan';

function formatWaktu(waktuStr) {
    if (!waktuStr) return 'Baru saja';
    try {
        const d = new Date(waktuStr);
        if (isNaN(d.getTime())) return 'Baru saja';
        const jam = String(d.getHours()).padStart(2, '0');
        const menit = String(d.getMinutes()).padStart(2, '0');
        return `${jam}:${menit} WIB`;
    } catch {
        return 'Baru saja';
    }
}

// ─── Penentuan Ukuran Font Dinamis Berdasarkan Panjang Teks & Jumlah Kata ───────
function tentukanKelasFontPesan(teks, isSpan2) {
    const str = (teks || '').trim();
    const len = str.length;
    const words = str ? str.split(/\s+/).filter(Boolean).length : 0;

    if (isSpan2) {
        // Kartu Lebar (Span 2): Rentang Font 1.02rem (Min) hingga 3.25rem (Max)
        if (len <= 25 && words <= 4) return 'kartu-isi-sangat-singkat'; // Batas Maksimal (Besar)
        if (len <= 55 && words <= 9) return 'kartu-isi-singkat';
        if (len <= 95 && words <= 16) return 'kartu-isi-sedang';
        if (len <= 145 && words <= 25) return 'kartu-isi-panjang';
        return 'kartu-isi-sangat-panjang'; // Batas Minimal (Kecil)
    } else {
        // Kartu Standar (Span 1): Rentang Font 0.92rem (Min) hingga 2.5rem (Max)
        if (len <= 20 && words <= 3) return 'kartu-isi-sangat-singkat'; // Batas Maksimal (Besar)
        if (len <= 45 && words <= 7) return 'kartu-isi-singkat';
        if (len <= 80 && words <= 14) return 'kartu-isi-sedang';
        if (len <= 130 && words <= 22) return 'kartu-isi-panjang';
        return 'kartu-isi-sangat-panjang'; // Batas Minimal (Kecil)
    }
}

function tentukanKelasFontNama(nama, isSpan2) {
    const len = (nama || '').trim().length;
    if (isSpan2) {
        if (len <= 16) return 'kartu-nama-lg';
        if (len <= 26) return 'kartu-nama-md';
        return 'kartu-nama-sm';
    } else {
        if (len <= 14) return 'kartu-nama-md';
        return 'kartu-nama-sm';
    }
}

// ─── Komponen Kartu Putih Modern ──────────────────────────────────────────────
function KartuPesanModern({ kartu, isCompact }) {
    const { pesan, posisi, warna } = kartu;
    const teks = pesan.isi_pesan || '';
    const isSpan2 = posisi.lebar === 2;

    const kelasFontNama = tentukanKelasFontNama(pesan.nama, isSpan2);
    const kelasFontPesan = tentukanKelasFontPesan(teks, isSpan2);

    return (
        <motion.div
            className={`kartu-modern-white kartu-span-${posisi.lebar} ${isCompact ? 'kartu-compact' : ''}`}
            style={{
                '--aksen-warna': warna.accent,
                '--aksen-shadow': warna.shadow || '#cbd5e1',
                width: '100%',
                height: '100%',
            }}
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: -15 }}
            transition={{
                duration: 0.38,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {/* Top accent bar */}
            <div
                className="kartu-accent-bar"
                style={{ backgroundColor: warna.accent }}
            />

            {/* Header info (tanpa label/badge pill seperti harapan, selamat, dll) */}
            <div className="kartu-top-row">
                <div className="kartu-author-wrap">
                    <div
                        className="kartu-avatar-circle"
                        style={{
                            backgroundColor: warna.avatarBg,
                            color: warna.avatarText,
                        }}
                    >
                        {(pesan.nama || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="kartu-author-meta">
                        <span className={`kartu-author-name ${kelasFontNama}`}>
                            {pesan.nama}
                        </span>
                        <span className="kartu-author-role">Wisuda FTI 2026</span>
                    </div>
                </div>
            </div>

            {/* Isi Pesan dengan font dinamis (besar jika pendek, kecil jika panjang) */}
            <div className="kartu-body-wrap">
                <p className={`kartu-pesan-text ${kelasFontPesan}`}>
                    "{pesan.isi_pesan}"
                </p>
            </div>

            {/* Subtle footer */}
            <div className="kartu-bottom-row">
                <div className="kartu-live-indicator">
                    <span className="kartu-pulse-dot" style={{ backgroundColor: warna.accent }} />
                    <span className="kartu-pulse-text">Terverifikasi</span>
                </div>
                <span className="kartu-quote-mark">❞</span>
            </div>
        </motion.div>
    );
}

// ─── Halaman Display Utama ────────────────────────────────────────────────────
export default function Display({ pesanAwal = [] }) {
    const { kartuAktif, semuaPesan } = useAntreanPesan(pesanAwal);
    const [sidebarTerbuka, setSidebarTerbuka] = useState(false);
    const [kataKunciCari, setKataKunciCari] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        function updateFullscreenState() {
            const isFs = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement ||
                (window.innerHeight === screen.height && window.innerWidth === screen.width)
            );
            setIsFullscreen(isFs);
        }

        document.addEventListener('fullscreenchange', updateFullscreenState);
        document.addEventListener('webkitfullscreenchange', updateFullscreenState);
        document.addEventListener('mozfullscreenchange', updateFullscreenState);
        document.addEventListener('MSFullscreenChange', updateFullscreenState);
        window.addEventListener('resize', updateFullscreenState);

        return () => {
            document.removeEventListener('fullscreenchange', updateFullscreenState);
            document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
            document.removeEventListener('mozfullscreenchange', updateFullscreenState);
            document.removeEventListener('MSFullscreenChange', updateFullscreenState);
            window.removeEventListener('resize', updateFullscreenState);
        };
    }, []);

    async function handleToggleFullscreen() {
        const doc = document;
        const docEl = document.documentElement;
        const isFs = !!(
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement ||
            isFullscreen
        );

        if (!isFs) {
            try {
                if (docEl.requestFullscreen) {
                    await docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) {
                    docEl.webkitRequestFullscreen();
                } else if (docEl.mozRequestFullScreen) {
                    docEl.mozRequestFullScreen();
                } else if (docEl.msRequestFullscreen) {
                    docEl.msRequestFullscreen();
                }
                setIsFullscreen(true);
            } catch (err) {
                console.warn('Native requestFullscreen diblokir lingkungan browser/iframe:', err);
                // Fallback mode layar penuh CSS untuk environment embedded/preview
                setIsFullscreen(true);
            }
        } else {
            try {
                if (doc.fullscreenElement && doc.exitFullscreen) {
                    await doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    doc.mozCancelFullScreen();
                } else if (doc.msExitFullscreen) {
                    doc.msExitFullscreen();
                }
            } catch (err) {
                console.warn('exitFullscreen error:', err);
            }
            setIsFullscreen(false);
        }
    }

    const daftarPesanTersaring = useMemo(() => {
        if (!kataKunciCari.trim()) return semuaPesan;
        const q = kataKunciCari.toLowerCase();
        return semuaPesan.filter(
            (p) =>
                (p.nama && p.nama.toLowerCase().includes(q)) ||
                (p.isi_pesan && p.isi_pesan.toLowerCase().includes(q))
        );
    }, [semuaPesan, kataKunciCari]);

    return (
        <div className={`display-canvas-modern ${isFullscreen ? 'mode-layar-penuh' : ''}`}>
            {/* Background lighting accents yang mengisi penuh halaman termasuk lapisan bawah navbar */}
            <div className="light-glow-wrapper" aria-hidden="true">
                <div className="light-glow-orb light-glow-1" />
                <div className="light-glow-orb light-glow-2" />
                <div className="light-glow-orb light-glow-3" />
            </div>

            {/* Navbar Global dengan Tombol Toggle Sidebar & Fullscreen */}
            <Navbar
                jumlahPesan={kartuAktif.length}
                totalSemuaPesan={semuaPesan.length}
                sidebarTerbuka={sidebarTerbuka}
                onToggleSidebar={() => setSidebarTerbuka((s) => !s)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
            />

            {/* Layout Desktop: Grid Kartu + Sidebar Kanan (disembunyikan di mobile) */}
            <div className={`display-content-layout display-desktop-layout ${sidebarTerbuka ? 'sidebar-terbuka' : 'sidebar-tertutup'}`}>
                {/* Area Grid Kartu Pesan */}
                <main className={`display-cards-grid ${sidebarTerbuka ? 'display-cards-grid-compact' : ''}`}>
                    {kartuAktif.length === 0 ? (
                        <div className="display-empty-state">
                            <div className="display-empty-card">
                                <div className="display-empty-icon">✨</div>
                                <h3 className="display-empty-title">Belum Ada Pesan</h3>
                                <p className="display-empty-desc">
                                    Pesan ucapan dari wisudawan dan keluarga akan langsung muncul di sini secara real-time.
                                </p>
                            </div>
                        </div>
                    ) : (
                        kartuAktif.map((kartu) => (
                            <div
                                key={kartu.slotKey}
                                className={`display-slot-cell slot-span-${kartu.posisi.lebar}`}
                                style={{
                                    gridColumnStart: kartu.posisi.kolom + 1,
                                    gridColumnEnd: kartu.posisi.kolom + 1 + kartu.posisi.lebar,
                                    gridRowStart: kartu.posisi.baris + 1,
                                    gridRowEnd: kartu.posisi.baris + 1 + kartu.posisi.tinggi,
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <KartuPesanModern
                                        key={`pesan-${kartu.pesan.id}`}
                                        kartu={kartu}
                                        isCompact={sidebarTerbuka}
                                    />
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </main>

                {/* Sidebar Sisi Kanan (Semua Pesan Terkirim, Urut Terbaru) */}
                <aside className={`display-sidebar-drawer ${sidebarTerbuka ? 'drawer-open' : 'drawer-closed'}`}>
                    <div className="sidebar-drawer-inner">
                        {/* Header Sidebar */}
                        <div className="sidebar-header">
                            <div className="sidebar-header-title-row">
                                <div className="sidebar-title-wrap">
                                    <h3 className="sidebar-title">Riwayat Pesan</h3>
                                    <span className="sidebar-count-badge">
                                        {semuaPesan.length} Total
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSidebarTerbuka(false)}
                                    className="sidebar-btn-close"
                                    title="Tutup Sidebar"
                                    aria-label="Tutup Sidebar"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Search box */}
                            <div className="sidebar-search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    value={kataKunciCari}
                                    onChange={(e) => setKataKunciCari(e.target.value)}
                                    placeholder="Cari pengirim atau ucapan..."
                                    className="sidebar-search-input"
                                />
                                {kataKunciCari && (
                                    <button
                                        type="button"
                                        onClick={() => setKataKunciCari('')}
                                        className="sidebar-search-clear"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List Pesan */}
                        <div className="sidebar-messages-list">
                            {daftarPesanTersaring.length === 0 ? (
                                <div className="sidebar-empty">
                                    <span>📭</span>
                                    <p>
                                        {kataKunciCari
                                            ? 'Tidak ada pesan yang cocok dengan pencarian.'
                                            : 'Belum ada pesan yang terkirim.'}
                                    </p>
                                </div>
                            ) : (
                                daftarPesanTersaring.map((pesan, index) => (
                                    <div
                                        key={`side-${pesan.id}`}
                                        className={`sidebar-msg-item ${index === 0 ? 'sidebar-msg-newest' : ''}`}
                                    >
                                        <div className="sidebar-msg-top">
                                            <div className="sidebar-msg-author">
                                                <div className="sidebar-msg-avatar">
                                                    {(pesan.nama || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="sidebar-msg-author-meta">
                                                    <span className="sidebar-msg-name">
                                                        {pesan.nama}
                                                    </span>
                                                    <span className="sidebar-msg-time">
                                                        {formatWaktu(pesan.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            {index === 0 && (
                                                <span className="sidebar-badge-newest">
                                                    Terbaru
                                                </span>
                                            )}
                                        </div>

                                        <p className="sidebar-msg-body">
                                            "{pesan.isi_pesan}"
                                        </p>

                                        <div className="sidebar-msg-footer">
                                            <span className="sidebar-dot-verified" />
                                            <span className="sidebar-text-verified">
                                                Terverifikasi
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {/* ─── Tampilan Khusus Mobile: List Semua Pesan ─────────────────────── */}
            <div className="display-mobile-feed">
                {/* Header Mobile Feed */}
                <div className="mobile-feed-header">
                    <div className="mobile-feed-title-row">
                        <h2 className="mobile-feed-title">Semua Pesan Terkirim</h2>
                        <span className="mobile-feed-count">{semuaPesan.length} Pesan</span>
                    </div>

                    {/* Search box Mobile */}
                    <div className="sidebar-search-box mobile-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={kataKunciCari}
                            onChange={(e) => setKataKunciCari(e.target.value)}
                            placeholder="Cari pengirim atau ucapan..."
                            className="sidebar-search-input"
                        />
                        {kataKunciCari && (
                            <button
                                type="button"
                                onClick={() => setKataKunciCari('')}
                                className="sidebar-search-clear"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Stream Kartu Semua Pesan Mobile */}
                <div className="mobile-messages-stream">
                    {daftarPesanTersaring.length === 0 ? (
                        <div className="mobile-empty-card">
                            <div className="display-empty-icon">📭</div>
                            <h3 className="display-empty-title">
                                {kataKunciCari ? 'Tidak Ditemukan' : 'Belum Ada Pesan'}
                            </h3>
                            <p className="display-empty-desc">
                                {kataKunciCari
                                    ? `Tidak ada pesan yang cocok dengan "${kataKunciCari}".`
                                    : 'Belum ada pesan yang masuk. Kirim pesan pertamamu sekarang!'}
                            </p>
                        </div>
                    ) : (
                        daftarPesanTersaring.map((pesan, idx) => (
                            <div
                                key={`mob-${pesan.id}`}
                                className={`mobile-msg-card ${idx === 0 ? 'mobile-msg-newest' : ''}`}
                            >
                                <div className="mobile-msg-header">
                                    <div className="mobile-msg-author">
                                        <div className="mobile-msg-avatar">
                                            {(pesan.nama || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="mobile-msg-meta">
                                            <span className="mobile-msg-name">{pesan.nama}</span>
                                            <span className="mobile-msg-role">Wisuda FTI 2026</span>
                                        </div>
                                    </div>
                                    <div className="mobile-msg-time-badge">
                                        {idx === 0 && (
                                            <span className="sidebar-badge-newest">Terbaru</span>
                                        )}
                                        <span className="mobile-msg-time">{formatWaktu(pesan.created_at)}</span>
                                    </div>
                                </div>

                                <p className="mobile-msg-text">"{pesan.isi_pesan}"</p>

                                <div className="mobile-msg-footer">
                                    <span className="sidebar-dot-verified" />
                                    <span className="sidebar-text-verified">
                                        Terverifikasi
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

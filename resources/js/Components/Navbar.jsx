import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Navbar({
    jumlahPesan = null,
    totalSemuaPesan = null,
    sidebarTerbuka = false,
    onToggleSidebar = null,
    onToggleFullscreen = null,
}) {
    const { url } = usePage();
    const isKirim = url === '/' || url === '';
    const isDisplay = url.startsWith('/display');

    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        function handleFsChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    function toggleFullscreen() {
        if (onToggleFullscreen) {
            onToggleFullscreen();
        } else {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    return (
        <header className="navbar-container">
            <div className="navbar-inner">
                {/* Brand / Logo */}
                <Link href="/" className="navbar-brand">
                    <div className="navbar-brand-badge">
                        <img src="/logo.jpg" alt="Logo Utama" className="navbar-logo-img" />
                    </div>
                    <div className="navbar-brand-text">
                        <span className="navbar-title">Live Wall</span>
                        <span className="navbar-subtitle">Wisuda FTI</span>
                    </div>
                </Link>

                {/* Navigation Pills */}
                <nav className="navbar-links" aria-label="Navigasi Utama">
                    <Link
                        href="/"
                        className={`navbar-link ${isKirim ? 'navbar-link-active' : ''}`}
                    >
                        <svg
                            className="navbar-link-svg"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                        <span>Kirim Pesan</span>
                    </Link>

                    <Link
                        href="/display"
                        className={`navbar-link ${isDisplay ? 'navbar-link-active' : ''}`}
                    >
                        <svg
                            className="navbar-link-svg"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <span>Layar Display</span>
                    </Link>
                </nav>

                {/* Quick actions (Sidebar / Fullscreen / Counter) */}
                <div className="navbar-actions">
                    {jumlahPesan !== null && (
                        <div className="navbar-counter-badge">
                            <span className="navbar-counter-dot" />
                            <span>{jumlahPesan} kartu aktif</span>
                        </div>
                    )}
                    {onToggleSidebar && (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className={`navbar-btn-sidebar ${sidebarTerbuka ? 'navbar-btn-sidebar-active' : ''}`}
                            title={sidebarTerbuka ? 'Tutup Riwayat Pesan' : 'Buka Riwayat Semua Pesan'}
                            aria-label="Toggle Sidebar Riwayat Pesan"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            <span className="navbar-btn-fs-label">
                                {sidebarTerbuka ? 'Tutup Riwayat' : 'Semua Pesan'}
                            </span>
                            {totalSemuaPesan !== null && (
                                <span className="navbar-badge-count">
                                    {totalSemuaPesan}
                                </span>
                            )}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="navbar-btn-fs"
                        title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Proyektor)'}
                        aria-label="Toggle Fullscreen"
                    >
                        {isFullscreen ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        )}
                        <span className="navbar-btn-fs-label">
                            {isFullscreen ? 'Kecilkan' : 'Layar Penuh'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}

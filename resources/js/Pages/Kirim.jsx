import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';

const MAKS_NAMA = 30;
const MAKS_PESAN = 200;
const JEDA_KIRIM_LAGI_MS = 3000;

export default function Kirim() {
    const { props } = usePage();
    const [sukses, setSukses] = useState(false);
    const [disetujui, setDisetujui] = useState(true);
    const [hitungMundur, setHitungMundur] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        isi_pesan: '',
        website: '', // honeypot - disembunyikan via CSS
    });

    // Deteksi flash sukses dari Inertia
    useEffect(() => {
        if (props.flash?.sukses) {
            setSukses(true);
            setDisetujui(props.flash.disetujui !== false);
            setHitungMundur(Math.ceil(JEDA_KIRIM_LAGI_MS / 1000));
        }
    }, [props.flash?.sukses, props.flash?.disetujui]);

    // Hitung mundur untuk tombol "Kirim pesan lagi"
    useEffect(() => {
        if (hitungMundur <= 0) return;
        const timer = setTimeout(() => setHitungMundur((h) => h - 1), 1000);
        return () => clearTimeout(timer);
    }, [hitungMundur]);

    function handleSubmit(e) {
        e.preventDefault();
        post('/kirim', {
            preserveScroll: true,
            onSuccess: () => {
                reset('isi_pesan');
            },
        });
    }

    function handleKirimLagi() {
        setSukses(false);
        setDisetujui(true);
        reset();
    }

    return (
        <div className="app-canvas">
            {/* Background lighting accents yang mengisi penuh halaman termasuk lapisan bawah navbar */}
            <div className="light-glow-wrapper" aria-hidden="true">
                <div className="light-glow-orb light-glow-1" />
                <div className="light-glow-orb light-glow-2" />
                <div className="light-glow-orb light-glow-3" />
            </div>

            {/* Global Navbar */}
            <Navbar />

            <main className="kirim-page-container">

                {sukses ? (
                    <div className={`kirim-sukses-card ${!disetujui ? 'kirim-peringatan-card' : ''}`}>
                        <div className="kirim-sukses-icon-wrap">
                            <span className="kirim-sukses-icon">
                                {disetujui ? '🎉' : '⚠️'}
                            </span>
                        </div>
                        <div className="kirim-sukses-badge">
                            {disetujui ? 'Status: Berhasil Dikirim' : 'Status: Tidak Ditampilkan'}
                        </div>
                        <h1 className="kirim-sukses-judul">
                            {disetujui ? 'Pesanmu Sudah Mengudara!' : 'Pesan Tidak Ditampilkan'}
                        </h1>
                        <p className="kirim-sukses-deskripsi">
                            {disetujui
                                ? 'Pesan kamu langsung masuk ke antrean dan segera tampil di layar proyektor wisuda. Silakan cek layar di depan panggung!'
                                : 'Pesan kamu tidak akan ditampilkan pada halaman display karena mengandung kata atau kalimat yang tidak diperbolehkan. Mohon gunakan bahasa yang sopan dan santun.'}
                        </p>
                        <div className="kirim-sukses-action">
                            <button
                                type="button"
                                onClick={handleKirimLagi}
                                disabled={hitungMundur > 0}
                                className={`btn-kirim-lagi ${!disetujui ? 'btn-kirim-ulang' : ''}`}
                            >
                                {hitungMundur > 0
                                    ? `Tulis pesan baru (${hitungMundur}s)`
                                    : '✍️ Tulis Pesan Baru'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="kirim-card-modern">
                        {/* Header Box */}
                        <div className="kirim-header-modern">
                            <h1 className="kirim-title-modern">Bagikan Ucapan &amp; Pesan</h1>
                            <p className="kirim-subtitle-modern">
                                Tulis ucapan selamat, kesan, atau pesan kebahagiaan.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="kirim-form-modern" noValidate>
                            {/* Honeypot - hidden via CSS */}
                            <div className="kirim-honeypot" aria-hidden="true" tabIndex={-1}>
                                <label htmlFor="website">Website</label>
                                <input
                                    type="text"
                                    id="website"
                                    name="website"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            {/* Nama Field */}
                            <div className="form-group-modern">
                                <div className="form-label-row">
                                    <label htmlFor="nama" className="form-label-modern">
                                        Nama Lengkap / Panggilan
                                    </label>
                                    <span className="char-badge">
                                        {data.nama.length}/{MAKS_NAMA}
                                    </span>
                                </div>
                                <div className="input-wrap-modern">
                                    <input
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        maxLength={MAKS_NAMA}
                                        placeholder="Contoh: Budi / Anonim"
                                        className={`form-input-modern ${errors.nama ? 'form-input-error' : ''}`}
                                        disabled={processing}
                                        autoComplete="name"
                                        enterKeyHint="next"
                                    />
                                </div>
                                {errors.nama && (
                                    <p className="form-error-msg">{errors.nama}</p>
                                )}
                            </div>

                            {/* Isi Pesan Field */}
                            <div className="form-group-modern">
                                <div className="form-label-row">
                                    <label htmlFor="isi_pesan" className="form-label-modern">
                                        Pesan Kamu
                                    </label>
                                    <span className="char-badge">
                                        {data.isi_pesan.length}/{MAKS_PESAN}
                                    </span>
                                </div>
                                <div className="input-wrap-modern">
                                    <textarea
                                        id="isi_pesan"
                                        value={data.isi_pesan}
                                        onChange={(e) => setData('isi_pesan', e.target.value)}
                                        maxLength={MAKS_PESAN}
                                        placeholder="Tulis ucapan selamat, quotes, doa, atau pesan ceria..."
                                        rows={4}
                                        className={`form-textarea-modern ${errors.isi_pesan ? 'form-input-error' : ''}`}
                                        disabled={processing}
                                        enterKeyHint="send"
                                    />
                                </div>
                                {errors.isi_pesan && (
                                    <p className="form-error-msg">{errors.isi_pesan}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing || !data.nama.trim() || !data.isi_pesan.trim()}
                                className="btn-submit-modern"
                            >
                                {processing ? (
                                    <span className="btn-loading-state">
                                        <span className="spinner-modern" />
                                        <span>Mengirim ke Layar...</span>
                                    </span>
                                ) : (
                                    <span className="btn-content-state">
                                        <span>Kirim ke Layar Utama</span>
                                        <svg
                                            className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const KONFIG = {
    maksKartu: 6, // 2 rows x 3 columns = 6 pesan maksimal pada display
    durasiNormalMs: 12000,
    intervalPollingMs: 2000,
};

const PALET_AKSEN = [
    { nama: 'rose', accent: '#ff4d6d', shadow: '#f43f5e', avatarBg: '#ffe4e6', avatarText: '#e11d48' },
    { nama: 'sky', accent: '#3b82f6', shadow: '#60a5fa', avatarBg: '#dbeafe', avatarText: '#1d4ed8' },
    { nama: 'emerald', accent: '#10b981', shadow: '#34d399', avatarBg: '#d1fae5', avatarText: '#047857' },
    { nama: 'purple', accent: '#8b5cf6', shadow: '#a78bfa', avatarBg: '#ede9fe', avatarText: '#6d28d9' },
    { nama: 'amber', accent: '#f59e0b', shadow: '#fbbf24', avatarBg: '#fef3c7', avatarText: '#b45309' },
    { nama: 'pink', accent: '#ec4899', shadow: '#f472b6', avatarBg: '#fce7f3', avatarText: '#be185d' },
];

/**
 * Susunan Grid 2 Row x 3 Column (Total 4 grid track columns):
 * Row 1: [Lebar (2), Sedang (1), Sedang (1)]
 * Row 2: [Sedang (1), Sedang (1), Lebar (2)] -> Kebalikan dari Row 1 agar dinamis & variatif!
 */
const POSISI_GRID_6 = [
    // Row 1 (Baris 0): 3 kolom kartu
    { baris: 0, kolom: 0, lebar: 2, tinggi: 1 }, // Kartu 1: Lebar (span 2)
    { baris: 0, kolom: 2, lebar: 1, tinggi: 1 }, // Kartu 2: Sedang (span 1)
    { baris: 0, kolom: 3, lebar: 1, tinggi: 1 }, // Kartu 3: Sedang (span 1)

    // Row 2 (Baris 1): 3 kolom kartu (kebalikan dari Row 1)
    { baris: 1, kolom: 0, lebar: 1, tinggi: 1 }, // Kartu 4: Sedang (span 1)
    { baris: 1, kolom: 1, lebar: 1, tinggi: 1 }, // Kartu 5: Sedang (span 1)
    { baris: 1, kolom: 2, lebar: 2, tinggi: 1 }, // Kartu 6: Lebar (span 2)
];

function tentukanPosisiKartu(indeks, total) {
    if (total === 1) {
        // 1 pesan: tampil gagah di tengah layar mengisi 2 row
        return { baris: 0, kolom: 1, lebar: 2, tinggi: 2 };
    }
    if (total === 2) {
        // 2 pesan: tampil seimbang berdampingan mengisi 2 row
        return { baris: 0, kolom: indeks === 0 ? 0 : 2, lebar: 2, tinggi: 2 };
    }
    // 3 sampai 6 pesan: susunan 2 baris x 3 kolom
    return POSISI_GRID_6[indeks] || POSISI_GRID_6[0];
}

export function useAntreanPesan(pesanAwal = []) {
    // Semua pesan yang tercatat di database (urut terbaru ke terlama)
    const [semuaPesan, setSemuaPesan] = useState(() => {
        const unik = [];
        const seen = new Set();
        const urut = [...pesanAwal].sort((a, b) => b.id - a.id);
        for (const p of urut) {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                unik.push(p);
            }
        }
        return unik;
    });

    // Pesan-pesan yang sedang aktif tampil di layar (maksimal 8, masing-masing unik)
    const [pesanAktifList, setPesanAktifList] = useState(() => {
        const unik = [];
        const seen = new Set();
        for (const p of pesanAwal) {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                unik.push(p);
            }
            if (unik.length >= KONFIG.maksKartu) break;
        }
        return unik;
    });

    // Slot index tracker untuk penggantian kartu secara berurutan dan rapi
    const nextSlotGantiRef = useRef(0);

    const idTerakhirRef = useRef(
        pesanAwal.length > 0 ? Math.max(...pesanAwal.map((p) => p.id)) : 0
    );

    // Fungsi menambah pesan baru dari polling secara bersih pada slot target
    const tambahPesanBaru = useCallback((pesanBaruList) => {
        if (!pesanBaruList || pesanBaruList.length === 0) return;

        setPesanAktifList((aktifList) => {
            let hasil = [...aktifList];
            for (const pesan of pesanBaruList) {
                // Hindari duplikat jika pesan sudah ada di layar aktif
                if (hasil.some((p) => p.id === pesan.id)) continue;

                if (hasil.length < KONFIG.maksKartu) {
                    // Tambahkan ke slot berikutnya jika belum penuh 6 kartu
                    hasil.push(pesan);
                } else {
                    // Ganti slot target secara berurutan agar pesan lama bersih diganti pesan baru
                    const targetIdx = nextSlotGantiRef.current % KONFIG.maksKartu;
                    hasil[targetIdx] = pesan;
                    nextSlotGantiRef.current = (targetIdx + 1) % KONFIG.maksKartu;
                }
            }
            return hasil;
        });
    }, []);

    // ── Rotasi Halus Otomatis (1 kartu per interval jika total pesan > 6) ────────
    useEffect(() => {
        if (semuaPesan.length <= KONFIG.maksKartu) return;

        const intervalRotasi = setInterval(() => {
            setPesanAktifList((aktifList) => {
                if (aktifList.length < KONFIG.maksKartu) return aktifList;

                // Cari pesan dari riwayat yang saat ini TIDAK sedang tampil di layar
                const idAktif = new Set(aktifList.map((p) => p.id));
                const kandidat = semuaPesan.filter((p) => !idAktif.has(p.id));
                if (kandidat.length === 0) return aktifList;

                const pengganti = kandidat[Math.floor(Math.random() * kandidat.length)];
                const targetIdx = nextSlotGantiRef.current % KONFIG.maksKartu;
                nextSlotGantiRef.current = (targetIdx + 1) % KONFIG.maksKartu;

                const hasil = [...aktifList];
                hasil[targetIdx] = pengganti;
                return hasil;
            });
        }, KONFIG.durasiNormalMs);

        return () => clearInterval(intervalRotasi);
    }, [semuaPesan]);

    // ── Polling Realtime ke Server ─────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;

        async function poll() {
            if (!isMounted) return;
            try {
                const res = await fetch(
                    `/api/pesan?setelah_id=${idTerakhirRef.current}`
                );
                if (!res.ok) return;
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const baru = [];
                    for (const item of data) {
                        if (item.id > idTerakhirRef.current) {
                            idTerakhirRef.current = item.id;
                            baru.push(item);
                        }
                    }

                    if (baru.length > 0) {
                        // Tambahkan ke riwayat semua pesan
                        setSemuaPesan((prev) => {
                            const idAda = new Set(prev.map((p) => p.id));
                            const tambahan = baru.filter((p) => !idAda.has(p.id));
                            return [...tambahan.sort((a, b) => b.id - a.id), ...prev];
                        });

                        // Masukkan ke layar aktif
                        tambahPesanBaru(baru);
                    }
                }
            } catch {
                // Diam-diam tanpa error di layar
            }
        }

        const interval = setInterval(poll, KONFIG.intervalPollingMs);
        poll();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [tambahPesanBaru]);

    // Format objek kartu untuk komponen Display
    const kartuAktif = useMemo(() => {
        const total = pesanAktifList.length;

        return pesanAktifList.map((pesan, indeks) => ({
            slotKey: `slot-${indeks}`,
            uid: `kartu-${pesan.id}`,
            pesan,
            posisi: tentukanPosisiKartu(indeks, total),
            warna: PALET_AKSEN[indeks % PALET_AKSEN.length],
        }));
    }, [pesanAktifList]);

    return {
        kartuAktif,
        semuaPesan,
    };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const KONFIG = {
    maksKartu: 6, // 2 rows x 3 columns = 6 pesan maksimal pada display
    durasiNormalMs: 12000,
    intervalPollingMs: 2000,
    maksBeruntunSlotPanjang: 2, // Maksimal 2 kali berturut-turut pesan panjang masuk ke slot panjang [0, 5]
    maksPaksaSlotKecil: 2,      // Setelah itu, paksa minimal 2 kali masuk ke slot kecil [1, 2, 3, 4]
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
 * Row 1: [Lebar (2), Sedang (1), Sedang (1)] -> Slot 0: Lebar, Slot 1 & 2: Sedang
 * Row 2: [Sedang (1), Sedang (1), Lebar (2)] -> Slot 3 & 4: Sedang, Slot 5: Lebar
 */
const POSISI_GRID_6 = [
    // Row 1 (Baris 0): 3 kolom kartu
    { baris: 0, kolom: 0, lebar: 2, tinggi: 1 }, // Slot 0: Lebar (span 2)
    { baris: 0, kolom: 2, lebar: 1, tinggi: 1 }, // Slot 1: Sedang (span 1)
    { baris: 0, kolom: 3, lebar: 1, tinggi: 1 }, // Slot 2: Sedang (span 1)

    // Row 2 (Baris 1): 3 kolom kartu (kebalikan dari Row 1)
    { baris: 1, kolom: 0, lebar: 1, tinggi: 1 }, // Slot 3: Sedang (span 1)
    { baris: 1, kolom: 1, lebar: 1, tinggi: 1 }, // Slot 4: Sedang (span 1)
    { baris: 1, kolom: 2, lebar: 2, tinggi: 1 }, // Slot 5: Lebar (span 2)
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

/**
 * Menghitung bobot panjang pesan berdasarkan jumlah karakter dan kata.
 */
function hitungBobotPanjang(pesan) {
    if (!pesan || !pesan.isi_pesan) return 0;
    const str = pesan.isi_pesan.trim();
    const len = str.length;
    const words = str ? str.split(/\s+/).filter(Boolean).length : 0;
    return len + words * 3;
}

/**
 * Mengecek apakah suatu pesan tergolong "kalimat panjang".
 * Pesan dianggap panjang jika memiliki minimal 48 karakter ATAU minimal 8 kata.
 * Kalimat di bawah batas ini adalah kalimat pendek (contoh: "g*blok", "Lulus!", "Mantap jiwa").
 */
function isKalimatPanjang(pesan) {
    if (!pesan || !pesan.isi_pesan) return false;
    const str = pesan.isi_pesan.trim();
    const len = str.length;
    const words = str ? str.split(/\s+/).filter(Boolean).length : 0;
    return len >= 48 || words >= 8;
}

/**
 * Menyusun 6 slot awal secara cerdas:
 * Slot 0 & 5 (Panjang/Lebar): Diisi pesan panjang (jika tersedia).
 * Slot 1, 2, 3, 4 (Sedang/Pendek): Diisi pesan pendek/sedang.
 * "kecuali tidak ada pilihan atau tidak ada pesan lain baru masuk ke pesan yang panjang"
 */
function aturSusunanAwalSlots(pesanList) {
    const unik = [];
    const seen = new Set();
    const urut = [...pesanList].sort((a, b) => b.id - a.id);
    for (const p of urut) {
        if (!seen.has(p.id)) {
            seen.add(p.id);
            unik.push(p);
        }
    }

    if (unik.length === 0) {
        return Array(KONFIG.maksKartu).fill(null);
    }

    if (unik.length < KONFIG.maksKartu) {
        const res = Array(KONFIG.maksKartu).fill(null);
        for (let i = 0; i < unik.length; i++) {
            res[i] = unik[i];
        }
        return res;
    }

    // Ambil kumpulan pesan terbaru untuk seleksi terbaik
    const pool = unik.slice(0, 16);
    const sudahDipakai = new Set();

    const kandidatPanjang = pool
        .filter((p) => isKalimatPanjang(p))
        .sort((a, b) => hitungBobotPanjang(b) - hitungBobotPanjang(a));

    const kandidatPendek = pool
        .filter((p) => !isKalimatPanjang(p))
        .sort((a, b) => b.id - a.id);

    const hasil = Array(KONFIG.maksKartu).fill(null);

    // 1. Alokasi untuk Slot Panjang (Index 0 dan Index 5): Utamakan kalimat panjang
    const slotPanjangIdx = [0, 5];
    for (const idx of slotPanjangIdx) {
        const pilihan = kandidatPanjang.find((p) => !sudahDipakai.has(p.id));
        if (pilihan) {
            hasil[idx] = pilihan;
            sudahDipakai.add(pilihan.id);
        }
    }

    // 2. Alokasi untuk Slot Pendek (Index 1, 2, 3, 4): Utamakan kalimat pendek
    const slotPendekIdx = [1, 2, 3, 4];
    for (const idx of slotPendekIdx) {
        const pilihan = kandidatPendek.find((p) => !sudahDipakai.has(p.id));
        if (pilihan) {
            hasil[idx] = pilihan;
            sudahDipakai.add(pilihan.id);
        }
    }

    // 3. Fallback jika slot belum terisi (misal pesan panjang < 2 atau pesan pendek < 4):
    // "kecuali tidak ada pilihan atau tidak ada pesan lain baru masuk ke pesan yang panjang"
    for (let i = 0; i < KONFIG.maksKartu; i++) {
        if (!hasil[i]) {
            const sisa = unik.find((p) => !sudahDipakai.has(p.id));
            if (sisa) {
                hasil[i] = sisa;
                sudahDipakai.add(sisa.id);
            }
        }
    }

    return hasil;
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

    // 6 slot terstruktur: Slot 0 & 5 (Panjang), Slot 1, 2, 3, 4 (Pendek/Sedang)
    const [slots, setSlots] = useState(() => aturSusunanAwalSlots(pesanAwal));

    // Pointer giliran penggantian untuk slot panjang (0 atau 5) dan slot pendek (1, 2, 3, 4)
    const nextSlotPanjangRef = useRef(0);
    const nextSlotPendekRef = useRef(1);
    const nextSlotRotasiRef = useRef(0);

    // Counter untuk mencegah looping beruntun hanya di 2 pesan panjang jika mayoritas pesan panjang
    const beruntunSlotPanjangRef = useRef(0);
    const beruntunPaksaKecilRef = useRef(0);

    const idTerakhirRef = useRef(
        pesanAwal.length > 0 ? Math.max(...pesanAwal.map((p) => p.id)) : 0
    );

    // Fungsi menambah pesan baru dari polling secara cerdas sesuai panjang kalimat
    const tambahPesanBaru = useCallback((pesanBaruList) => {
        if (!pesanBaruList || pesanBaruList.length === 0) return;

        setSlots((prevSlots) => {
            let currentSlots = [...prevSlots];

            for (const pesan of pesanBaruList) {
                // Hindari duplikat jika pesan sudah aktif di salah satu slot
                if (currentSlots.some((s) => s && s.id === pesan.id)) continue;

                const isPanjang = isKalimatPanjang(pesan);

                // Jika masih ada slot kosong (saat data awal < 6):
                const emptyIdx = currentSlots.findIndex((s) => s === null);
                if (emptyIdx !== -1) {
                    if (!isPanjang) {
                        const emptyPendek = [1, 2, 3, 4].find((idx) => currentSlots[idx] === null);
                        if (emptyPendek !== undefined) {
                            currentSlots[emptyPendek] = pesan;
                            continue;
                        }
                    } else {
                        const emptyPanjang = [0, 5].find((idx) => currentSlots[idx] === null);
                        if (emptyPanjang !== undefined) {
                            currentSlots[emptyPanjang] = pesan;
                            continue;
                        }
                    }
                    currentSlots[emptyIdx] = pesan;
                    continue;
                }

                // Ketika 6 slot sudah penuh terisi:
                if (isPanjang) {
                    // PESAN PANJANG:
                    // Prioritas 1: Jika ada slot panjang yang memegang pesan pendek (karena fallback awal),
                    // segera gantikan slot panjang tersebut dengan pesan panjang ini.
                    const slotPanjangDenganPesanPendek = [0, 5].find(
                        (idx) => currentSlots[idx] && !isKalimatPanjang(currentSlots[idx])
                    );

                    if (slotPanjangDenganPesanPendek !== undefined) {
                        currentSlots[slotPanjangDenganPesanPendek] = pesan;
                        beruntunSlotPanjangRef.current += 1;
                        beruntunPaksaKecilRef.current = 0;
                        nextSlotPanjangRef.current = slotPanjangDenganPesanPendek === 0 ? 5 : 0;
                        continue;
                    }

                    // Prioritas 2: Aturan Anti-Looping — jika terlalu sering masuk ke 2 pesan panjang tersebut,
                    // paksa dialihkan masuk ke pesan-pesan kecilnya agar seluruh 6 kartu berputar aktif!
                    const sudahTerlaluSering =
                        beruntunSlotPanjangRef.current >= KONFIG.maksBeruntunSlotPanjang;

                    if (sudahTerlaluSering) {
                        // PAKSA TARUH DI PESAN KECILNYA (Slot 1, 2, 3, atau 4)!
                        const targetSlot = nextSlotPendekRef.current;
                        currentSlots[targetSlot] = pesan;

                        const urutanPendek = [1, 2, 3, 4];
                        const curPos = urutanPendek.indexOf(targetSlot);
                        const nextPos = (curPos + 1) % urutanPendek.length;
                        nextSlotPendekRef.current = urutanPendek[nextPos];

                        beruntunPaksaKecilRef.current += 1;

                        // Jika sudah cukup dialihkan ke slot kecil (misal 2 kali), kembalikan kuota ke slot panjang
                        if (beruntunPaksaKecilRef.current >= KONFIG.maksPaksaSlotKecil) {
                            beruntunSlotPanjangRef.current = 0;
                            beruntunPaksaKecilRef.current = 0;
                        }
                    } else {
                        // Masih dalam kuota slot panjang (0 atau 5)
                        const targetSlot = nextSlotPanjangRef.current;
                        currentSlots[targetSlot] = pesan;

                        nextSlotPanjangRef.current = targetSlot === 0 ? 5 : 0;
                        beruntunSlotPanjangRef.current += 1;
                        beruntunPaksaKecilRef.current = 0;
                    }
                } else {
                    // PESAN PENDEK: Selalu masuk ke slot pendek (1, 2, 3, atau 4)
                    const targetSlot = nextSlotPendekRef.current;
                    currentSlots[targetSlot] = pesan;

                    const urutanPendek = [1, 2, 3, 4];
                    const curPos = urutanPendek.indexOf(targetSlot);
                    const nextPos = (curPos + 1) % urutanPendek.length;
                    nextSlotPendekRef.current = urutanPendek[nextPos];

                    // Pesan pendek asli sudah menyegarkan slot kecil, reset counter beruntun panjang
                    beruntunSlotPanjangRef.current = 0;
                    beruntunPaksaKecilRef.current = 0;
                }
            }

            return currentSlots;
        });
    }, []);

    // ── Rotasi Halus Otomatis (1 kartu per interval jika total pesan > 6) ────────
    useEffect(() => {
        if (semuaPesan.length <= KONFIG.maksKartu) return;

        const intervalRotasi = setInterval(() => {
            setSlots((currentSlots) => {
                const idAktif = new Set(currentSlots.filter(Boolean).map((p) => p.id));
                const kandidat = semuaPesan.filter((p) => !idAktif.has(p.id));
                if (kandidat.length === 0) return currentSlots;

                const targetSlot = nextSlotRotasiRef.current;
                nextSlotRotasiRef.current = (targetSlot + 1) % KONFIG.maksKartu;

                const isTargetSlotPanjang = targetSlot === 0 || targetSlot === 5;
                let pengganti = null;

                if (isTargetSlotPanjang) {
                    // Target Slot Panjang (0 atau 5): Wajib utamakan pesan yang PANJANG!
                    const kandidatPanjang = kandidat.filter((p) => isKalimatPanjang(p));

                    if (kandidatPanjang.length > 0) {
                        pengganti = kandidatPanjang[Math.floor(Math.random() * kandidatPanjang.length)];
                    } else {
                        // "kecuali tidak ada pilihan atau tidak ada pesan lain baru masuk ke pesan yang panjang"
                        // Jika tidak ada pesan panjang lain yang tersisa, ambil kandidat terpanjang yang ada
                        const terurut = [...kandidat].sort(
                            (a, b) => hitungBobotPanjang(b) - hitungBobotPanjang(a)
                        );
                        pengganti = terurut[0];
                    }
                } else {
                    // Target Slot Pendek (1, 2, 3, atau 4): Utamakan pesan yang PENDEK / SEDANG
                    const kandidatPendek = kandidat.filter((p) => !isKalimatPanjang(p));

                    if (kandidatPendek.length > 0) {
                        pengganti = kandidatPendek[Math.floor(Math.random() * kandidatPendek.length)];
                    } else {
                        pengganti = kandidat[Math.floor(Math.random() * kandidat.length)];
                    }
                }

                if (!pengganti) return currentSlots;

                const hasil = [...currentSlots];
                hasil[targetSlot] = pengganti;
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

                        // Masukkan ke layar aktif sesuai aturan panjang/pendek
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
        const slotTerisi = slots
            .map((pesan, indeks) => ({ pesan, indeks }))
            .filter((item) => item.pesan !== null);

        const total = slotTerisi.length;

        return slotTerisi.map(({ pesan, indeks }) => ({
            slotKey: `slot-${indeks}`,
            uid: `kartu-${pesan.id}`,
            pesan,
            posisi: tentukanPosisiKartu(indeks, total),
            warna: PALET_AKSEN[indeks % PALET_AKSEN.length],
        }));
    }, [slots]);

    return {
        kartuAktif,
        semuaPesan,
    };
}

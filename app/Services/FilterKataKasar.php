<?php

namespace App\Services;

class FilterKataKasar
{
    /**
     * @var array<string, array<string, string>> Cache pola regex terkompilasi
     */
    private static array $polaCache = [];

    /**
     * @var array<int, string>
     */
    private array $daftar;

    public function __construct()
    {
        $this->daftar = config('kata_kasar.daftar', []);
        $this->siapkanPolaRegex();
    }

    /**
     * Siapkan pola regex cerdas untuk mendeteksi variasi sensor simbol, leet speak, dan pengulangan karakter.
     */
    private function siapkanPolaRegex(): void
    {
        $kunci = md5(implode('|', $this->daftar));
        if (isset(self::$polaCache[$kunci])) {
            return;
        }

        $list = [];
        foreach ($this->daftar as $kata) {
            $kataClean = trim(mb_strtolower($kata));
            if ($kataClean !== '') {
                $list[$kataClean] = $this->buatPolaRegex($kataClean);
            }
        }

        self::$polaCache[$kunci] = $list;
    }

    /**
     * Buat regex pattern untuk sebuah kata dengan toleransi karakter sensor, simbol, dan leet speak.
     */
    private function buatPolaRegex(string $kata): string
    {
        // Karakter sensor yang biasa digunakan pengguna untuk menyamarkan huruf
        $sensor = '[\*\@\#\$\%\^\&\_\-\.\+\=\!\?\~\/\;\|\'\"\,\(\)\[\]]';

        // Peta substitusi huruf ke leet speak atau simbol sensor
        $peta = [
            'a' => '(?:[a4@]|'.$sensor.')',
            'b' => '(?:[b8]|'.$sensor.')',
            'c' => '(?:[c]|'.$sensor.')',
            'd' => '(?:[d]|'.$sensor.')',
            'e' => '(?:[e3]|'.$sensor.')',
            'f' => '(?:[f]|'.$sensor.')',
            'g' => '(?:[g69]|'.$sensor.')',
            'h' => '(?:[h]|'.$sensor.')',
            'i' => '(?:[i1!|]|'.$sensor.')',
            'j' => '(?:[j]|'.$sensor.')',
            'k' => '(?:[k]|'.$sensor.')',
            'l' => '(?:[l1|]|'.$sensor.')',
            'm' => '(?:[m]|'.$sensor.')',
            'n' => '(?:[n]|'.$sensor.')',
            'o' => '(?:[o0]|'.$sensor.')',
            'p' => '(?:[p]|'.$sensor.')',
            'q' => '(?:[q]|'.$sensor.')',
            'r' => '(?:[r]|'.$sensor.')',
            's' => '(?:[s5$]|'.$sensor.')',
            't' => '(?:[t7+]|'.$sensor.')',
            'u' => '(?:[uv]|'.$sensor.')',
            'v' => '(?:[vu]|'.$sensor.')',
            'w' => '(?:[w]|'.$sensor.')',
            'x' => '(?:[x]|'.$sensor.')',
            'y' => '(?:[y]|'.$sensor.')',
            'z' => '(?:[z2]|'.$sensor.')',
            ' ' => '[\s\_\-]+',
        ];

        $chars = str_split($kata);
        $parts = [];

        foreach ($chars as $c) {
            if (isset($peta[$c])) {
                $parts[] = $c === ' ' ? $peta[$c] : $peta[$c].'+';
            } else {
                $parts[] = preg_quote($c, '/').'+';
            }
        }

        // Pemisah opsional antar karakter (spasi, titik, bintang, dsb)
        $separator = '(?:[\s\.\_\-\*\@\#\$\%\^\&]*)';
        $pattern = implode($separator, $parts);

        // Batas kata: memastikan sebelum dan sesudah bukan huruf/angka latin agar tidak false positive
        return '/(?<![a-zA-Z0-9])'.$pattern.'(?![a-zA-Z0-9])/ui';
    }

    /**
     * Periksa apakah teks mengandung kata kasar (baik teks langsung maupun tersensor).
     */
    public function mengandungKataKasar(string $teks): bool
    {
        $teksLower = mb_strtolower($teks);
        $kunci = md5(implode('|', $this->daftar));
        $polaList = self::$polaCache[$kunci] ?? [];

        foreach ($polaList as $kata => $pola) {
            if (preg_match_all($pola, $teksLower, $matches)) {
                // Hitung karakter nyata alfanumerik untuk mencegah false positive pada pure simbol (seperti '***')
                $minHuruf = strlen($kata) <= 3 ? 2 : 2;
                foreach ($matches[0] as $match) {
                    $jumlahHuruf = preg_match_all('/[a-zA-Z0-9]/', $match);
                    if ($jumlahHuruf >= $minHuruf) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Periksa apakah nama atau isi pesan mengandung kata kasar.
     */
    public function periksaPesan(string $nama, string $isiPesan): bool
    {
        return $this->mengandungKataKasar($nama) || $this->mengandungKataKasar($isiPesan);
    }
}

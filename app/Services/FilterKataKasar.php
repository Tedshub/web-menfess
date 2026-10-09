<?php

namespace App\Services;

class FilterKataKasar
{
    private array $daftar;

    public function __construct()
    {
        $this->daftar = config('kata_kasar.daftar', []);
    }

    /**
     * Periksa apakah teks mengandung kata kasar.
     */
    public function mengandungKataKasar(string $teks): bool
    {
        $teksLower = mb_strtolower($teks);

        foreach ($this->daftar as $kata) {
            $kataLower = mb_strtolower($kata);
            // Gunakan word boundary untuk menghindari false positive
            if (preg_match('/\b' . preg_quote($kataLower, '/') . '\b/u', $teksLower)) {
                return true;
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

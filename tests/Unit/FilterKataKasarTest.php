<?php

namespace Tests\Unit;

use App\Services\FilterKataKasar;
use Tests\TestCase;

class FilterKataKasarTest extends TestCase
{
    private FilterKataKasar $filter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->filter = new FilterKataKasar;
    }

    public function test_mengenali_kata_kasar_asli(): void
    {
        $this->assertTrue($this->filter->mengandungKataKasar('dasar kamu goblok'));
        $this->assertTrue($this->filter->mengandungKataKasar('anjing sekali'));
        $this->assertTrue($this->filter->mengandungKataKasar('bangsat lu'));
        $this->assertTrue($this->filter->mengandungKataKasar('anak kontol'));
    }

    public function test_mengenali_kata_kasar_yang_disensor_dengan_simbol_variatif(): void
    {
        // Variasi sensor bintang (*)
        $this->assertTrue($this->filter->mengandungKataKasar('kamu g*blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('dasar an*ing'));
        $this->assertTrue($this->filter->mengandungKataKasar('k*ntol lu'));
        $this->assertTrue($this->filter->mengandungKataKasar('b*ngsat'));

        // Variasi sensor simbol lain: @, #, !, $, _, -, ., dll
        $this->assertTrue($this->filter->mengandungKataKasar('g@blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('g#blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('g!blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('g_blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('g-blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('g.blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('g$blok'));
        $this->assertTrue($this->filter->mengandungKataKasar('@njing'));
        $this->assertTrue($this->filter->mengandungKataKasar('an#ing'));
        $this->assertTrue($this->filter->mengandungKataKasar('k#nt#l'));
        $this->assertTrue($this->filter->mengandungKataKasar('b@ngsat'));
    }

    public function test_mengenali_kata_kasar_dengan_leet_speak_dan_angka(): void
    {
        $this->assertTrue($this->filter->mengandungKataKasar('g0bl0k'));
        $this->assertTrue($this->filter->mengandungKataKasar('4njing'));
        $this->assertTrue($this->filter->mengandungKataKasar('b4ngs4t'));
        $this->assertTrue($this->filter->mengandungKataKasar('k0nt0l'));
        $this->assertTrue($this->filter->mengandungKataKasar('g*bl0k'));
    }

    public function test_mengenali_kata_kasar_dengan_spasi_atau_titik_antar_huruf(): void
    {
        $this->assertTrue($this->filter->mengandungKataKasar('g o b l o k'));
        $this->assertTrue($this->filter->mengandungKataKasar('g.o.b.l.o.k'));
        $this->assertTrue($this->filter->mengandungKataKasar('a n j i n g'));
        $this->assertTrue($this->filter->mengandungKataKasar('g***ok'));
        $this->assertTrue($this->filter->mengandungKataKasar('gooooobloooook'));
    }

    public function test_tidak_salah_mendeteksi_kalimat_aman_atau_simbol_dekorasi(): void
    {
        // Simbol dekorasi / divider wisuda
        $this->assertFalse($this->filter->mengandungKataKasar('*** Selamat Wisuda Rekan-Rekan ***'));
        $this->assertFalse($this->filter->mengandungKataKasar('--- Sukses Selalu Semua! ---'));

        // Kata-kata bahasa Indonesia yang mirip sebagian hurufnya
        $this->assertFalse($this->filter->mengandungKataKasar('Mengobrol santai di kantin kampus'));
        $this->assertFalse($this->filter->mengandungKataKasar('Kantor pusat teknologi informasi'));
        $this->assertFalse($this->filter->mengandungKataKasar('Titik awal kehidupan baru'));
        $this->assertFalse($this->filter->mengandungKataKasar('Panjang umur persahabatan kita'));
        $this->assertFalse($this->filter->mengandungKataKasar('Tali silaturahmi tetap terjaga'));
        $this->assertFalse($this->filter->mengandungKataKasar('Memancing ide-ide kreatif'));
        $this->assertFalse($this->filter->mengandungKataKasar('Kontrak kerja pertama sudah siap'));

        // Ucapan wisuda umum
        $this->assertFalse($this->filter->mengandungKataKasar('Dari kampus ke dunia nyata, tetap jaga semangat!'));
        $this->assertFalse($this->filter->mengandungKataKasar('Bangga bisa lulus dari Fakultas Teknik dan Informatika!'));
        $this->assertFalse($this->filter->mengandungKataKasar('Terima kasih kepada bapak ibu dosen dan orang tua tercinta.'));
    }

    public function test_periksa_pesan_memeriksa_nama_dan_isi_pesan(): void
    {
        // Nama mengandung sensor kata kasar
        $this->assertTrue($this->filter->periksaPesan('g*blok', 'Selamat wisuda teman'));

        // Isi pesan mengandung sensor kata kasar
        $this->assertTrue($this->filter->periksaPesan('Budi Santoso', 'Hai an*ing'));

        // Keduanya aman
        $this->assertFalse($this->filter->periksaPesan('Ayu Wulandari', 'Selamat atas kelulusannya!'));
    }
}

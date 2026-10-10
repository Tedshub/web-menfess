<?php

namespace Tests\Feature;

use App\Models\Pesan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PesanTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_kirim_dapat_diakses(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_halaman_display_dapat_diakses(): void
    {
        $response = $this->get('/display');
        $response->assertStatus(200);
    }

    public function test_peserta_dapat_mengirim_pesan_valid(): void
    {
        $response = $this->post('/kirim', [
            'nama' => 'Budi Santoso',
            'isi_pesan' => 'Selamat atas wisuda rekan-rekan!',
        ]);

        $response->assertSessionHas('sukses', true);

        $this->assertDatabaseHas('pesan', [
            'nama' => 'Budi Santoso',
            'isi_pesan' => 'Selamat atas wisuda rekan-rekan!',
            'disetujui' => true,
        ]);
    }

    public function test_honeypot_tidak_menyimpan_ke_database(): void
    {
        $response = $this->post('/kirim', [
            'nama' => 'Bot Spammer',
            'isi_pesan' => 'Promo link spam!',
            'website' => 'http://spam.com',
        ]);

        $response->assertSessionHas('sukses', true);
        $this->assertDatabaseMissing('pesan', [
            'nama' => 'Bot Spammer',
        ]);
    }

    public function test_kata_kasar_disimpan_dengan_disetujui_false(): void
    {
        $response = $this->post('/kirim', [
            'nama' => 'User Nakal',
            'isi_pesan' => 'Halo anjing kamu hebat',
        ]);

        $response->assertSessionHas('sukses', true);
        $response->assertSessionHas('disetujui', false);

        $this->assertDatabaseHas('pesan', [
            'nama' => 'User Nakal',
            'isi_pesan' => 'Halo anjing kamu hebat',
            'disetujui' => false,
        ]);
    }

    public function test_kata_kasar_tersensor_disimpan_dengan_disetujui_false(): void
    {
        $response = $this->post('/kirim', [
            'nama' => 'User Iseng',
            'isi_pesan' => 'Selamat wisuda g*blok',
        ]);

        $response->assertSessionHas('sukses', true);
        $response->assertSessionHas('disetujui', false);

        $this->assertDatabaseHas('pesan', [
            'nama' => 'User Iseng',
            'isi_pesan' => 'Selamat wisuda g*blok',
            'disetujui' => false,
        ]);
    }

    public function test_rate_limit_per_perangkat_maksimal_3_pesan_per_menit(): void
    {
        $cookie = ['_pmw_token' => 'token-test-123'];

        for ($i = 1; $i <= 3; $i++) {
            $res = $this->withCookies($cookie)->post('/kirim', [
                'nama' => "User {$i}",
                'isi_pesan' => "Pesan ke {$i}",
            ]);
            $res->assertSessionHas('sukses', true);
        }

        // Pesan ke-4 harus ditolak oleh rate limit
        $resKe4 = $this->withCookies($cookie)->post('/kirim', [
            'nama' => 'User 4',
            'isi_pesan' => 'Pesan ke 4',
        ]);

        $resKe4->assertSessionHasErrors('isi_pesan');
    }

    public function test_api_polling_hanya_mengambil_pesan_disetujui(): void
    {
        $p1 = Pesan::create([
            'nama' => 'Lolos 1',
            'isi_pesan' => 'Pesan satu',
            'disetujui' => true,
            'sidik_perangkat' => 'test-1',
            'created_at' => now(),
        ]);

        $p2 = Pesan::create([
            'nama' => 'Ditolak',
            'isi_pesan' => 'Pesan kasar',
            'disetujui' => false,
            'sidik_perangkat' => 'test-2',
            'created_at' => now(),
        ]);

        $p3 = Pesan::create([
            'nama' => 'Lolos 2',
            'isi_pesan' => 'Pesan dua',
            'disetujui' => true,
            'sidik_perangkat' => 'test-3',
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/pesan?setelah_id=0');

        $response->assertStatus(200);
        $response->assertJsonCount(2);
        $response->assertJsonFragment(['nama' => 'Lolos 1']);
        $response->assertJsonFragment(['nama' => 'Lolos 2']);
        $response->assertJsonMissing(['nama' => 'Ditolak']);
    }

    public function test_artisan_sembunyikan_pesan(): void
    {
        $p = Pesan::create([
            'nama' => 'Test Mod',
            'isi_pesan' => 'Tampilkan lalu sembunyikan',
            'disetujui' => true,
            'sidik_perangkat' => 'test-mod',
            'created_at' => now(),
        ]);

        $this->artisan("pesan:sembunyikan {$p->id}")
            ->assertSuccessful();

        $this->assertDatabaseHas('pesan', [
            'id' => $p->id,
            'disetujui' => false,
        ]);
    }
}

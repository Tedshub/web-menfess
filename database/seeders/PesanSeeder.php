<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PesanSeeder extends Seeder
{
    /**
     * Seed 10 pesan dummy untuk demo Live Message Wall.
     */
    public function run(): void
    {
        $pesan = [
            [
                'nama'     => 'Budi Santoso',
                'isi_pesan' => 'Selamat wisuda! Semoga ilmu yang didapat bermanfaat bagi nusa dan bangsa. Terus berkarya dan jangan berhenti belajar!',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(60),
            ],
            [
                'nama'     => 'Rini Rahayu',
                'isi_pesan' => 'Congratulations! Akhirnya toga di kepala juga. Perjalanan panjang ini membuktikan kamu pantang menyerah. Proud of you!',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(55),
            ],
            [
                'nama'     => 'Ahmad Fauzi',
                'isi_pesan' => 'Wisuda bukan akhir dari belajar, tapi awal dari petualangan baru. Semoga sukses di langkah berikutnya!',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(48),
            ],
            [
                'nama'     => 'Siti Nurhaliza',
                'isi_pesan' => 'Terima kasih sudah menginspirasi kami semua. Semoga Allah SWT memudahkan setiap langkah dan cita-citamu. Aamiin.',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(40),
            ],
            [
                'nama'     => 'Dika Pratama',
                'isi_pesan' => 'Bro, kita akhirnya sampai juga di sini! Selamat bro, hari ini perjuangan kita terbayar. Next stop: dunia kerja!',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(35),
            ],
            [
                'nama'     => 'Mama & Papa',
                'isi_pesan' => 'Anakku, hari ini adalah hari yang paling membahagiakan bagi kami. Kami sangat bangga denganmu. Terus jaga kesehatan dan selalu ingat doa orang tua.',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(30),
            ],
            [
                'nama'     => 'Hendra Wijaya',
                'isi_pesan' => 'Selamat atas kelulusanmu! Dunia sudah menunggu kontribusimu. Jadilah pemimpin yang amanah dan inovatif.',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(22),
            ],
            [
                'nama'     => 'Keluarga Besar FTI',
                'isi_pesan' => 'Selamat kepada seluruh wisudawan FTI 2026! Kalian adalah kebanggaan kampus. Harum nama almamater di manapun kalian berada.',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(15),
            ],
            [
                'nama'     => 'Dewi Kusuma',
                'isi_pesan' => 'Selamat wisuda sayang! Semoga karir cemerlang menanti di depan. Jangan lupa sesekali main-main ke kampus ya haha.',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(8),
            ],
            [
                'nama'     => 'Anonim',
                'isi_pesan' => 'Selamat! Nikmati hari spesial ini sepenuhnya. Kamu layak atas semua ini. Masa depan cerah sudah menunggumu.',
                'disetujui' => true,
                'sidik_perangkat' => null,
                'created_at' => now()->subMinutes(2),
            ],
        ];

        DB::table('pesan')->insert($pesan);
    }
}

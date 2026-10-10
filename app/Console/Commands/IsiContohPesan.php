<?php

namespace App\Console\Commands;

use App\Models\Pesan;
use Illuminate\Console\Command;

class IsiContohPesan extends Command
{
    protected $signature = 'pesan:isi-contoh 
                            {jumlah=20 : Jumlah pesan contoh yang akan dibuat} 
                            {--delay=0 : Jeda dalam detik antar pesan untuk simulasi tampilan realtime (misal: --delay=2)}';

    protected $description = 'Buat pesan contoh untuk menguji tampilan Display';

    private array $namaContoh = [
        'Budi Santoso', 'Siti Rahayu', 'Ahmad Fauzi', 'Dewi Lestari', 'Rizky Pratama',
        'Nurul Hidayah', 'Fajar Setiawan', 'Rina Kusuma', 'Andi Wijaya', 'Maya Putri',
        'Dian Permata', 'Hendra Gunawan', 'Fitri Amalia', 'Bayu Saputra', 'Ayu Wulandari',
        'Rendi Firmansyah', 'Nisa Rahmadhani', 'Teguh Santoso', 'Lina Marlina', 'Doni Ardiansyah',
    ];

    private array $pesanContoh = [
        'Selamat atas wisuda kalian semua! Semoga sukses di dunia kerja.',
        'Terima kasih kepada seluruh dosen yang telah membimbing kami.',
        'Hari ini adalah awal dari perjalanan baru yang luar biasa!',
        'Bangga bisa lulus dari Fakultas Teknik dan Informatika!',
        'Semoga ilmu yang didapat bermanfaat bagi nusa dan bangsa.',
        'Congratulations! Hard work pays off!',
        'Selamat kepada semua wisudawan dan wisudawati!',
        'Terima kasih buat teman-teman seperjuangan yang selalu ada.',
        'Finally done! Now let the real adventure begin!',
        'Semoga langkah selanjutnya dipenuhi berkah dan kemudahan.',
        'Proud to be part of this amazing batch!',
        'Hore! Akhirnya lulus juga setelah berjuang bersama.',
        'Tetap rendah hati meski sudah meraih gelar sarjana.',
        'Terima kasih orang tua yang selalu mendukung dari jauh.',
        'Dream big, work hard, stay humble!',
        'Selamat! Semoga karir kalian gemilang.',
        'FTI keren banget! Bangga jadi bagian dari kampus ini.',
        'Ini bukan akhir, ini baru permulaan. Semangat terus!',
        'Kepada wisudawan: kalian sudah buktikan kalian bisa!',
        'Selamat menempuh hidup baru dengan ilmu yang bermanfaat!',
        'Terimakasih sudah berjuang bersama selama ini. Sukses selalu!',
        'Wisuda adalah gerbang menuju kehidupan yang sesungguhnya.',
        'Dari kampus ke dunia nyata, tetap jaga semangat!',
        'Congratulations to all graduates! You made it!',
        'Semoga persahabatan kita tetap terjaga meski sudah lulus.',
    ];

    public function handle(): int
    {
        $jumlah = (int) $this->argument('jumlah');
        $delay = (int) $this->option('delay');

        if ($jumlah < 1 || $jumlah > 1000) {
            $this->error('Jumlah harus antara 1 dan 1000.');

            return self::FAILURE;
        }

        if ($delay > 0) {
            $this->info("Memulai simulasi live: membuat {$jumlah} pesan dengan jeda {$delay} detik...");
            $this->comment('Buka http://localhost:8000/display di browsermu untuk melihat pesan masuk secara live!');
            $this->newLine();

            for ($i = 0; $i < $jumlah; $i++) {
                if ($i > 0) {
                    sleep($delay);
                }

                $nama = $this->namaContoh[array_rand($this->namaContoh)];
                $pesanTeks = $this->pesanContoh[array_rand($this->pesanContoh)];

                $pesan = Pesan::create([
                    'nama' => $nama,
                    'isi_pesan' => $pesanTeks,
                    'disetujui' => true,
                    'sidik_perangkat' => hash('sha256', 'contoh-'.uniqid()),
                    'created_at' => now(),
                ]);

                $nomor = $i + 1;
                $this->line("<info>[{$nomor}/{$jumlah}]</info> <comment>{$nama}:</comment> \"{$pesanTeks}\"");
            }
        } else {
            $this->info("Membuat {$jumlah} pesan contoh sekaligus...");
            $bar = $this->output->createProgressBar($jumlah);
            $bar->start();

            for ($i = 0; $i < $jumlah; $i++) {
                Pesan::create([
                    'nama' => $this->namaContoh[array_rand($this->namaContoh)],
                    'isi_pesan' => $this->pesanContoh[array_rand($this->pesanContoh)],
                    'disetujui' => true,
                    'sidik_perangkat' => hash('sha256', 'contoh-'.$i),
                    'created_at' => now()->subSeconds($jumlah - $i),
                ]);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
        }

        $this->newLine();
        $this->info("{$jumlah} pesan contoh berhasil dibuat!");

        return self::SUCCESS;
    }
}

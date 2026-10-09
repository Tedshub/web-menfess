<?php

namespace App\Console\Commands;

use App\Models\Pesan;
use Illuminate\Console\Command;

class SembunyikanPesan extends Command
{
    protected $signature = 'pesan:sembunyikan {id : ID pesan yang akan disembunyikan}';

    protected $description = 'Sembunyikan pesan dari layar Display berdasarkan ID';

    public function handle(): int
    {
        $id = $this->argument('id');

        $pesan = Pesan::find($id);

        if (!$pesan) {
            $this->error("Pesan dengan ID {$id} tidak ditemukan.");
            return self::FAILURE;
        }

        if (!$pesan->disetujui) {
            $this->warn("Pesan ID {$id} sudah disembunyikan.");
            return self::SUCCESS;
        }

        $pesan->update(['disetujui' => false]);

        $this->info("Pesan ID {$id} berhasil disembunyikan.");
        $this->line("  Pengirim : {$pesan->nama}");
        $this->line("  Isi      : {$pesan->isi_pesan}");

        return self::SUCCESS;
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\KirimPesanRequest;
use App\Models\Pesan;
use App\Services\FilterKataKasar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PesanController extends Controller
{
    public function kirim(): Response
    {
        return Inertia::render('Kirim');
    }

    public function simpan(KirimPesanRequest $request): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        // Periksa honeypot: jika field website terisi, balas sukses palsu
        if ($request->filled('website')) {
            return back()->with('sukses', true);
        }

        // Buat sidik perangkat: dari cookie token acak atau hash IP + user agent
        $sidikPerangkat = $this->getSidikPerangkat($request);

        // Rate limit per perangkat: 3 pesan per menit
        $kunciPerangkat = 'kirim-pesan:perangkat:' . $sidikPerangkat;
        if (RateLimiter::tooManyAttempts($kunciPerangkat, 3)) {
            return back()->withErrors(['isi_pesan' => 'Kamu terlalu sering mengirim pesan. Tunggu sebentar.']);
        }
        RateLimiter::hit($kunciPerangkat, 60);

        // Rate limit per IP: 300 per menit (longgar untuk WiFi kampus)
        $kunciIp = 'kirim-pesan:ip:' . $request->ip();
        if (RateLimiter::tooManyAttempts($kunciIp, 300)) {
            return back()->withErrors(['isi_pesan' => 'Terlalu banyak permintaan. Coba lagi nanti.']);
        }
        RateLimiter::hit($kunciIp, 60);

        // Filter kata kasar
        $filter = new FilterKataKasar();
        $disetujui = !$filter->periksaPesan($request->nama, $request->isi_pesan);

        // Simpan pesan
        Pesan::create([
            'nama'            => $request->nama,
            'isi_pesan'       => $request->isi_pesan,
            'disetujui'       => $disetujui,
            'sidik_perangkat' => $sidikPerangkat,
            'created_at'      => now(),
        ]);

        // Set cookie token jika belum ada
        $response = back()->with('sukses', true)->with('disetujui', $disetujui);

        if (!$request->hasCookie('_pmw_token')) {
            $response = $response->withCookie(
                cookie('_pmw_token', $sidikPerangkat, 60 * 24 * 30, '/', null, false, true)
            );
        }

        return $response;
    }

    public function display(): Response
    {
        $pesanAwal = Pesan::where('disetujui', true)
            ->orderByDesc('id')
            ->limit(100)
            ->get(['id', 'nama', 'isi_pesan', 'created_at'])
            ->reverse()
            ->values();

        return Inertia::render('Display', [
            'pesanAwal' => $pesanAwal,
        ]);
    }

    public function apiPesan(Request $request): \Illuminate\Http\JsonResponse
    {
        $setelahId = (int) $request->query('setelah_id', 0);

        $pesan = Pesan::where('disetujui', true)
            ->where('id', '>', $setelahId)
            ->orderBy('id')
            ->limit(50)
            ->get(['id', 'nama', 'isi_pesan', 'created_at']);

        return response()->json($pesan);
    }

    private function getSidikPerangkat(Request $request): string
    {
        // Gunakan cookie token jika sudah ada
        if ($token = $request->cookie('_pmw_token')) {
            return $token;
        }

        // Buat token baru atau hash dari IP + user agent
        return hash('sha256', $request->ip() . '|' . $request->userAgent());
    }
}

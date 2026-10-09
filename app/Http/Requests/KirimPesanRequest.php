<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KirimPesanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Persiapkan data sebelum validasi: trim spasi dan hapus karakter kontrol.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'nama'     => $this->bersihkanTeks($this->input('nama', '')),
            'isi_pesan' => $this->bersihkanTeks($this->input('isi_pesan', '')),
        ]);
    }

    private function bersihkanTeks(string $teks): string
    {
        // Hilangkan karakter kontrol (ASCII 0-31 kecuali spasi) dan trim
        $bersih = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $teks);
        return trim($bersih ?? $teks);
    }

    public function rules(): array
    {
        return [
            'nama'      => ['required', 'string', 'max:30'],
            'isi_pesan' => ['required', 'string', 'max:200'],
            'website'   => ['nullable', 'string'], // honeypot field
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'      => 'Nama wajib diisi.',
            'nama.max'           => 'Nama maksimal 30 karakter.',
            'isi_pesan.required' => 'Pesan wajib diisi.',
            'isi_pesan.max'      => 'Pesan maksimal 200 karakter.',
        ];
    }
}

<?php

use App\Http\Controllers\PesanController;
use Illuminate\Support\Facades\Route;

// Halaman Kirim Pesan (HP peserta)
Route::get('/', [PesanController::class, 'kirim'])->name('kirim');

// Simpan pesan
Route::post('/kirim', [PesanController::class, 'simpan'])->name('kirim.simpan');

// Halaman Display (proyektor)
Route::get('/display', [PesanController::class, 'display'])->name('display');

// API polling pesan
Route::get('/api/pesan', [PesanController::class, 'apiPesan'])->name('api.pesan');

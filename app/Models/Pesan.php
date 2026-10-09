<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pesan extends Model
{
    public $timestamps = false;

    protected $table = 'pesan';

    protected $fillable = [
        'nama',
        'isi_pesan',
        'disetujui',
        'sidik_perangkat',
        'created_at',
    ];

    protected $casts = [
        'disetujui' => 'boolean',
        'created_at' => 'datetime',
    ];
}

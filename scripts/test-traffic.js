/**
 * Script Simulasi Trafik & Load Testing Menfess Wisuda
 * 
 * Penggunaan:
 *   node scripts/test-traffic.js
 *   node scripts/test-traffic.js --users=250 --requests=500
 *   node scripts/test-traffic.js --endpoint=api --users=300
 */

const BASE_URL = process.argv.find(a => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:8000';
const USERS = parseInt(process.argv.find(a => a.startsWith('--users='))?.split('=')[1] || '200', 10);
const TOTAL_REQUESTS = parseInt(process.argv.find(a => a.startsWith('--requests='))?.split('=')[1] || '400', 10);
const ENDPOINT = process.argv.find(a => a.startsWith('--endpoint='))?.split('=')[1] || 'api'; // 'api' atau 'home'

const NAMA_SAMPLE = [
    'Budi Santoso', 'Siti Rahayu', 'Ahmad Fauzi', 'Dewi Lestari', 'Rizky Pratama',
    'Nurul Hidayah', 'Fajar Setiawan', 'Rina Kusuma', 'Andi Wijaya', 'Maya Putri'
];

const PESAN_SAMPLE = [
    'Selamat wisuda semuanya!', 'Sukses selalu kawan!', 'Bangga jadi alumni FTI!',
    'Terima kasih dosen dan teman-teman!', 'Happy Graduation 2026!'
];

console.log('='.repeat(65));
console.log('  SIMULASI TRAFIK WISUDA (LOAD TESTING)');
console.log('='.repeat(65));
console.log(` Target URL       : ${BASE_URL}`);
console.log(` Concurrent Users : ${USERS} user`);
console.log(` Total Permintaan : ${TOTAL_REQUESTS} request`);
console.log(` Mode Pengujian   : ${ENDPOINT === 'api' ? 'GET /api/pesan (Polling Proyektor/API)' : 'GET / (Halaman Kirim)'}`);
console.log('='.repeat(65));
console.log('Menjalankan pengujian...');

async function main() {
    const latencies = [];
    let success = 0;
    let rateLimited = 0;
    let errors = 0;
    let errorMessages = new Set();

    let requestIndex = 0;
    const startTime = Date.now();

    async function worker() {
        while (requestIndex < TOTAL_REQUESTS) {
            const currentIdx = requestIndex++;
            if (currentIdx >= TOTAL_REQUESTS) break;

            const targetUrl = ENDPOINT === 'api'
                ? `${BASE_URL}/api/pesan?setelah_id=0&t=${Date.now()}_${currentIdx}`
                : `${BASE_URL}/?t=${Date.now()}_${currentIdx}`;

            const reqStart = performance.now();
            try {
                const res = await fetch(targetUrl, {
                    headers: {
                        'User-Agent': `LoadTest-Bot/${currentIdx % USERS}`,
                        'X-Forwarded-For': `192.168.1.${(currentIdx % 250) + 1}`,
                    },
                    signal: AbortSignal.timeout(10000), // Timeout 10s
                });

                const reqDuration = performance.now() - reqStart;
                latencies.push(reqDuration);

                if (res.status === 200 || res.status === 302) {
                    success++;
                } else if (res.status === 429) {
                    rateLimited++;
                } else {
                    errors++;
                    errorMessages.add(`HTTP ${res.status}`);
                }
            } catch (err) {
                const reqDuration = performance.now() - reqStart;
                latencies.push(reqDuration);
                errors++;
                errorMessages.add(err.message || 'Unknown error');
            }
        }
    }

    // Jalankan worker sejumlah CONCURRENT USERS
    const workers = Array.from({ length: USERS }, () => worker());
    await Promise.all(workers);

    const totalTime = (Date.now() - startTime) / 1000;
    latencies.sort((a, b) => a - b);

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
    const minLatency = latencies[0] || 0;
    const maxLatency = latencies[latencies.length - 1] || 0;
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const rps = (success + rateLimited + errors) / totalTime;

    console.log('\n' + '='.repeat(65));
    console.log('  HASIL PENGUJIAN');
    console.log('='.repeat(65));
    console.log(` Durasi Total     : ${totalTime.toFixed(2)} detik`);
    console.log(` Throughput (RPS) : ${rps.toFixed(1)} req/detik`);
    console.log(` Sukses (200/302) : ${success} (${((success / TOTAL_REQUESTS) * 100).toFixed(1)}%)`);
    console.log(` Rate Limited(429): ${rateLimited}`);
    console.log(` Error / Timeout  : ${errors} (${((errors / TOTAL_REQUESTS) * 100).toFixed(1)}%)`);
    if (errorMessages.size > 0) {
        console.log(` Jenis Error      : ${Array.from(errorMessages).join(', ')}`);
    }
    console.log('-'.repeat(65));
    console.log(' Latency / Waktu Respon:');
    console.log(`   - Minimum      : ${minLatency.toFixed(1)} ms`);
    console.log(`   - Rata-rata    : ${avgLatency.toFixed(1)} ms`);
    console.log(`   - Median (p50) : ${p50.toFixed(1)} ms`);
    console.log(`   - 95th (p95)   : ${p95.toFixed(1)} ms`);
    console.log(`   - Maximum      : ${maxLatency.toFixed(1)} ms`);
    console.log('='.repeat(65));

    if (errors > 0) {
        console.log('\n⚠️ PERHATIAN: Ditemukan error atau timeout.');
        console.log('Jika Anda menggunakan `php artisan serve`, server lokal bawaan PHP bersifat single-thread.');
        console.log('Untuk hari H dengan 200-300 pengguna asli, pastikan menggunakan Nginx / Apache / FrankenPHP.');
    } else {
        console.log('\n✅ Uji trafik selesai tanpa kendala koneksi.');
    }
}

main().catch(console.error);

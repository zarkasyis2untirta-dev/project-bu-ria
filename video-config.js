// Pengaturan Link Video YouTube & Database Soal Pre-Test/Post-Test
const videoPresets = {
    video1: "https://www.youtube.com/embed/RUgCoxZx3gY",
    video2: "https://www.youtube.com/embed/cAqkMJyiJmE"
};

const quizQuestions = [
    {
        q: "Apa tujuan utama dari teks deskripsi?",
        options: [
            "A. Menceritakan urutan kejadian peristiwa secara kronologis.",
            "B. Menggambarkan suatu objek secara terperinci sehingga pembaca seolah-olah melihat dan merasakan langsung.",
            "C. Menyajikan langkah-langkah atau petunjuk melakukan sesuatu.",
            "D. Menjelaskan proses terjadinya suatu fenomena alam."
        ],
        answer: 1
    },
    {
        q: "Manakah kalimat di bawah ini yang paling tepat dikategorikan sebagai kalimat deskriptif?",
        options: [
            "A. Rumah itu sangat bagus dan nyaman.",
            "B. Sekolah kami memiliki halaman yang luas.",
            "C. Halaman sekolah kami tampak asri ditumbuhi deretan pohon mangga rindang dengan lantai paving block abu-abu yang bersih.",
            "D. Setiap hari siswa membersihkan ruang kelas."
        ],
        answer: 2
    },
    {
        q: "Dalam struktur teks deskripsi SMP, bagian yang berisi pengenalan nama objek, lokasi, atau gambaran umum disebut...",
        options: [
            "A. Identifikasi / Gambaran Umum",
            "B. Deskripsi Bagian",
            "C. Penutup / Kesimpulan",
            "D. Orientasi"
        ],
        answer: 0
    },
    {
        q: "Unsur kebahasaan yang berfungsi menunjukkan sifat atau keadaan suatu objek (misalnya: rindang, luas, bersih) adalah...",
        options: [
            "A. Kata benda (Nomina)",
            "B. Kata sifat (Adjektiva)",
            "C. Kata kerja (Verba)",
            "D. Kata depan (Preposisi)"
        ],
        answer: 1
    },
    {
        q: "Perhatikan kalimat berikut: 'Suara ombak bergemuruh memecah karang.' Penggunaan panca indera apakah yang dominan pada kalimat tersebut?",
        options: [
            "A. Penglihatan (Mata)",
            "B. Pendengaran (Telinga)",
            "C. Perabaan (Kulit)",
            "D. Penciuman (Hidung)"
        ],
        answer: 1
    },
    {
        q: "Manakah yang termasuk ke dalam struktur 'Deskripsi Bagian' pada teks deskripsi?",
        options: [
            "A. Pengenalan nama perpustakaan sekolah.",
            "B. Kesimpulan bahwa perpustakaan sangat nyaman.",
            "C. Penjelasan terperinci mengenai susunan rak buku cokelat dan tata letak meja baca di dalam perpustakaan.",
            "D. Saran agar siswa rajin membaca."
        ],
        answer: 2
    },
    {
        q: "Contoh penggunaan majas personifikasi dalam teks deskripsi adalah...",
        options: [
            "A. Wajahnya bersinar bagaikan bulan purnama.",
            "B. Angin pagi berbisik lembut menyapa daun-daun.",
            "C. Kucing itu berlari sangat cepat.",
            "D. Rumah itu bertingkat dua."
        ],
        answer: 1
    },
    {
        q: "Jenis teks deskripsi yang menguraikan objek berdasarkan ruang, posisi, atau tata letak disebut...",
        options: [
            "A. Deskripsi Objektif",
            "B. Deskripsi Subjektif",
            "C. Deskripsi Spasial",
            "D. Deskripsi Orang"
        ],
        answer: 2
    },
    {
        q: "Manakah kesalahan umum yang sering dilakukan siswa dalam menulis teks deskripsi?",
        options: [
            "A. Menggunakan terlalu banyak detail panca indera.",
            "B. Penggambaran terlalu umum dan kurangnya detail konkret (misal: hanya menulis 'Rumah itu indah').",
            "C. Menyusun struktur secara runtut.",
            "D. Memilih kata sifat yang bervariasi."
        ],
        answer: 1
    },
    {
        q: "Apa perbedaan utama antara Teks Deskripsi dan Teks Laporan Hasil Observasi (LHO)?",
        options: [
            "A. Teks deskripsi bersifat faktual umum, sedangkan LHO subjektif.",
            "B. Teks deskripsi mengutamakan karakteristik dan kesan detail objek tertentu, sedangkan LHO menyajikan informasi hasil pengamatan secara sistematis dan mengelompokkan secara umum.",
            "C. Teks deskripsi berbentuk alur cerita, sedangkan LHO berbentuk dialog.",
            "D. Tidak ada perbedaan sama sekali."
        ],
        answer: 1
    }
];

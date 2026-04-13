# 🚀 Panduan Ekstensif Deploy Aplikasi (Untuk Pemula)

Jangan panik! Mendeploy (meng-online-kan) aplikasi berbasis Node.js dan React memang sedikit berbeda dengan web *PHP* atau *WordPress* biasa. Panduan super lengkap ini dibuat selangkah demi selangkah dan menggunakan bahasa yang sangat sederhana, khusus untuk pemula yang belum pernah mendayung di lautan *Server*.

Aplikasi kita ini terbagi menjadi 3 "Pilar" utama yang masing-masing harus memiliki rumah siber:
1. **Database (Gudang Data)** -> Tempat PostgreSQL.
2. **Backend (Mesin Server)** -> Logika API Express (Folder `server/`).
3. **Frontend (Tampilan Web)** -> Visual Antarmuka React Vite (Folder `client/`).

> [!TIP]
> **Cara Paling Tepat:** Jangan mendeploy aplikasi modern ini ke **cPanel Web Hosting biasa**. Kita akan menggunakan Ekosistem **Cloud Modern secara GRATIS**: *Supabase* (untuk Database), *Render* (untuk Mesin Node), dan *Vercel* (untuk Tampilan React).

---

## ⚙️ TAHAP 0: Persiapan Kode ke GitHub (Syarat Wajib)
Seluruh layanan Cloud Gratis mewajibkan Anda "menitipkan" kode Anda di brankas online bernama GitHub.

1. Buat akun di [GitHub.com](https://github.com/).
2. Unduh dan install aplikasi **GitHub Desktop** di komputer Anda (Sangat direkomendasikan untuk pemula, tidak perlu mengetik perintah layar hitam/CMD).
3. Seret *(Drag and Drop)* folder `eventmanagement` milik Anda ke dalam GitHub Desktop.
4. Tulis pesan di kolom kiri bawah: *"Pertama kali upload project"*. Klik tombol **Commit**.
5. Klik **Publish Repository**. *(Pastikan centang "Keep this code private" jika ini produk rahasia bisnis Anda).*
Selesai! Sekarang semua *codingan* Anda sudah aman di GitHub dan siap ditarik oleh sistem Hosting.

---

## 🟢 TAHAP 1: Meng-online-kan Database (Gudang Data)

Kita akan menggunakan **Supabase**, platform pangkalan data level industri.

1. Buka [Supabase.com](https://supabase.com/) dan masuk menggunakan akun GitHub Anda (*Sign in with GitHub*).
2. Klik tombol hijau **New Project**. Beri nama bebas, misal: `event-saas-db`.
3. Buat *password* rahasia (Catat atau *Copy* password tersebut dengan baik!).
4. Setelah gudang data terbuat (loading memakan 1-2 menit), pergi ke menu gear ⚙️ **Project Settings -> Database**.
5. Temukan **Connection String** bertipe **URI**. Bentuknya akan seperti ini:
   `postgresql://postgres.xxx:[PASSWORD-ANDA]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
6. *(Ganti tulisan `[PASSWORD-ANDA]` dengan password langkah 3, lalu simpan baris panjang ini ke dalam Notepad).*

### Membangun Meja Tabel Database (*Migrations*)
Karena gudang data di Supabase masih "kosongi", Anda harus mengetuk cetakan strukturnya:
* Di papan panel Supabase kiri, klik ikon **SQL Editor** `</>`.
* Salin semua perintah `CREATE TABLE ...` dari file struktur database yang biasa Anda di pakai di lokal, lalu klik **RUN**. (Kini tabel `events`, `vendors`, dll. sudah siap di awan!).

---

## 🟡 TAHAP 2: Meng-online-kan Backend (Mesin)

Untuk menghidupkan mesin *Node.js*, kita menggunakan layanan **Render.com**.

1. Buka situs [Render.com](https://render.com) dan daftar akun menggunakan GitHub.
2. Klik tombol **New +** -> Pilih **Web Service**.
3. Render akan menampilkan *codingan* GitHub Anda. Klik tulisan **Connect** di sebelah repositori `eventmanagement`.
4. Render akan bertanya beberapa konfigurasi *(Ini sangat penting)*:
   * **Root Directory**: `server` *(Ketik ini agar Render tahu mesin Node ada di dalam folder 'server').*
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start` *(Atau bisa juga mengetik `node server.js`)*.
5. Geser ke bawah ke bagian **Environment Variables** (Kunci Ingatan Server). 
   Masukkan semua rahasia dari `.env` lokal komputer Anda ke sini:
   * Kolom Kiri: `DATABASE_URL` | Kolom Kanan: *(Masukkan Link panjang URL Supabase dari **Tahap 1**)*
   * Kolom Kiri: `JWT_SECRET` | Kolom Kanan: *(Ketik kata kunci rahasia acak contoh: `EventHebatJwtRahasia#123`)*
6. Klik kotak biru **Deploy**.
   > *Tunggu 3-5 Menit. Jika log hitam terbaca "Server run at port...", selamat! Render akan memberi Anda link mesin backend, contoh: `https://event-saas-backend.onrender.com`. Simpan link ini di Notepad!*

---

## 🔵 TAHAP 3: Meng-online-kan Frontend (Tampilan Visual Web)

Langkah penutup! Kita mendeploy wajah tampilan visual React agar bisa dibuka calon klien menggunakan fasilitas ngebut **Vercel.com**.

### Persiapan Terakhir di Komputer Anda:
Saat di komputer lokal Anda, *Frontend* pasti menelepon `localhost:5000`. Kita harus mengganti nomor telepon ini agar ia menghubungi mesin Render dari Tahap 2.
1. Masuk ke folder `client/`. Edit file kode sentral pembangun rute (API Axios di `src/services/api.js`).
2. Pastikan alamatnya menunjuk pada Link URL Render Anda: `axios.defaults.baseURL = 'https://event-saas-backend.onrender.com'`.
   *(Simpan perubahan dan Publish lagi file tersebut melalui Github Desktop).*

### Upload ke Vercel:
1. Buka [Vercel.com](https://vercel.com/) dan masuk (*Sign in with GitHub*).
2. Klik **Add New... -> Project**.
3. *Import* repository Github `eventmanagement` milik Anda.
4. Saat halaman konfigurasi muncul:
   * Menu **Framework Preset**: Vercel otomatis memunculkan logo `Vite`.
   * Menu **Root Directory**: Klik tombol `Edit` -> Pilih folder `client`.
   * Menu **Build Command**: Biarkan terisi standar pencetakan Vercel.
5. Klik **Deploy**!
   > *Biasanya memakan waktu hitungan 1-2 menit hingga animasi Confetti/Kembang Api meledak di layar. Vercel akan menyajikan Link cantik dan permanen untuk produk Anda (contoh: `https://event-saas-client.vercel.app`).*

---

## 🎉 TAHAP 4: Verifikasi & Uji Kelayakan

Segalanya sudah diluncurkan. Kini saatnya mengecek kestabilan satelit di luar angkasa:

1. Sebarkan Link Vercel Anda ke Whatsapp teman atau Coba Anda buka sendiri melalui jaringan Kuota Ponsel Klien (beranikan putus dari WiFi lokal!).
2. Buatlah akun EO baru dari halaman Login/Daftar itu.
3. Coba daftarkan satu event pernikahan, lalu isi *deadline*.
4. **Alur Pengecekan Sukses**: Jika form hijau berputar (Tampilan Vercel sukses), lalu event tercatat tanpa ada notifkasi Gagal (Backend Render merespons), dan keesokan harinya Anda masih bisa melihat data tersebut (Gudang Supabase menyimpan), artinya **Instalasi Skala Pabrik Cloud** Anda berjalan mulus tanpa celah!

> [!WARNING]
> Sangat lumrah apabila saat Anda pertama memencet tombol Vercel setelah 10 menit diam *"Sedikit Telat atau Lemot"*. Render.com versi *Gratisan* akan 'tertidur' (Hibernate) jika lebih dari batas 15 menit tidak ada yang buka web. Jika ada klien yang mengklik, ia butuh 30 detik untuk di-hidupkan otomatis oleh Render. (Kalau Anda nanti menggunakan versi berbayar 50rb/bulan di Render, ia bisa aktif 24 jam non-stop tiada batas tanpa loading tertidur).
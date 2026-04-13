# 🎪 Event Management Micro-SaaS
*Platform Manajemen Cerdas untuk Agensi Acara, Wedding Organizer (WO), dan Perencana Korporat.*

![SaaS Banner](https://img.shields.io/badge/SaaS-Ready-success?style=for-the-badge) ![Multi-Tenant](https://img.shields.io/badge/Multi_Tenant-Secure-blue?style=for-the-badge) ![Automation](https://img.shields.io/badge/Webhook_Ready-Automation-purple?style=for-the-badge)

Aplikasi **Event Management Micro-SaaS** diciptakan untuk menyelesaikan satu masalah brutal di dunia *Event Organizer*: **Kekacauan Koordinasi**.

Saat sebuah agensi menangani 10 klien pernikahan atau acara kantor secara bersaman, manajemen lewat grup *WhatsApp* atau buku *Excel* biasanya berakhir bencana. Ada vendor katering yang belum dibayar lunas, jadwal *meeting fitting* gaun yang terlewat, hingga *deadline* pembayaran MUA (Make Up Artist) yang hangus.

Platform ini mengubah kekacauan tersebut menjadi **Dasbor Digital Pintar** berskala *Enterprise*!

---

## ✨ 1. Fitur Utama & Nilai Jual (Value Proposition)

Aplikasi ini tidak sekadar "Buku Catatan", melainkan *"Ruang Operasi (War Room)"* digital dengan fitur unggulan:

### 🧩 A. Sistem Pusat Penghubung (Event Hub)
Setiap "Event" memiliki halamannya sendiri. Dari 1 halaman *Event Detail*, EO dapat:
*   Mendaftarkan dan menautkan Vendor spesifik (misal: Fotografer A untuk Event B) beserta nilai kontrak kerjanya.
*   Mencatat dan mengelompokkan riwayat Uang Masuk (dari klien) dan Uang Keluar (ke vendor).
*   Menyusun Jadwal *Meetings* (*Online* maupun *Offline*) beserta lokasi dan catatannya.

### ⏱️ B. Pelacak Tenggat Waktu Pintar (*Smart Deadline Tracker*)
Tidak perlu pusing mengecek jadwal secara manual setiap pagi. Sistem membaca ratusan tugas dan mewarnainya secara otomatis:
*   🔴 **Merah (Urgent)**: Tenggat waktu kurang dari 3 hari!
*   🟡 **Kuning (Approaching)**: Tenggat waktu antara 3 - 7 hari.
*   🟢 **Hijau (On Track)**: Perencanaan masih aman.

### 💸 C. Manajemen Finansial (Sistem Tagihan)
Miliki kendali penuh atas putaran uang:
*   Pantau vendor mana yang tagihannya berstatus **Pending**, dan mana yang sudah lunas (**Paid**).
*   Catat nomor referensi *transfer*, *invoice*, dan pisahkan antara pembayaran DP cicilan atau Pelunasan.

### 🤖 D. Automasi Peringatan (*Webhook System*)
Platform ini dipersiapkan untuk berkomunikasi dengan Robot Automasi (contoh: **n8n** atau Zapier). 
Sistem dapat memancarkan peringatan diam-diam setiap kali ada jadwal jatuh tempo. Melalui *n8n*, peringatan ini bisa disambungkan menjadi **Pesan WhatsApp Otomatis** yang langsung dikirim ke *handphone* Klien atau Vendor! (Contoh: *"Halo Vendor A, batas persetujuan desain dekorasi adalah besok!"*).

---

## 🧭 2. Alur Kerja Aplikasi (User Flow)

Bagaimana cara agensi menggunakan aplikasi ini di dunia nyata?

1.  **Daftar/Sewa Akun SaaS (Multi-Tenant)**: Agensi EO Anda membuat akun. Aplikasi melindungi ruang kerja Anda; Agensi WO lain **mustahil** bisa mengintip klien Anda.
2.  **Membuka Klien Baru (Create Event)**: Anda mendapat ketukan dari calon klien ("Pernikahan Maya & Andi"). Anda masuk ke sistem, mengisi tanggal resepsi, budget (misal Rp 200 Juta), dan lokasi *venue*.
3.  **Rekrutmen Vendor**: Anda pergi ke Menu Vendor, merekrut vendor langganan (Katering X, Dekor Y). Kemudian, Anda kembali ke *Detail Event* pernikahan klien tersebut dan **Menghubungkan Vendor** ke kontrak acara klien.
4.  **Pemecahan Tugas (Deadlines)**: Anda membagi tugas (Misal: "Katering: Test Food" -> Deadline 14 Mei). Sistem langsung melacak kalendernya.
5.  **Eksekusi & Pembayaran**: Seiring hari berlalu, klien mentransfer uang DP ke Anda. Anda mencatatnya di tab *Pembayaran*. Anda memakai uang tersebut untuk membayar vendor Katering, dan Anda menekan tombol "Lunas" di status katering.
6.  **Tidur Nyenyak**: Biarkan *Webhook Automations* sistem me-notifikasi siapapun melalui robot otomatis jika ada yang melanggar batas *deadline*.

---

## 🏢 3. Mengapa Berjalan Secara B2B SaaS? (*Multi-Tenancy*)

Micro-SaaS ini mematuhi standar *Business to Business* terbaik.

Jika Anda memiliki bisnis aplikasi ini, Anda bisa menyewakannya ke **Puluhan EO yang berbeda** *(Tenant)*. Karena arsitektur sistem ditopang oleh teknologi basis-data ***Isolasi Tingkat Baris*** (*PostgreSQL Row-Level Security*), setiap *Event*, *Vendor*, hingga *Deadline* secara siluman dicap oleh sidik jari digital masing-masing agen EO. Secara hukum dan sistem data, kerahasiaan tiap perusahaan WO 100% terkunci aman dan tidak akan pernah bocor antar pengguna!

---

## 🚀 4. Panduan Menjalankan Sistem (*Quick Start*)

*(Untuk panduan kode mendalam, arsitektur *Clean Code*, pemrograman dan struktur sistem, kunjungi dokumen* `DEVELOPER_GUIDE.md` *pada repositori ini)*.

Sistem berjalan secara ajaib dalam **Satu Perintah (Monorepo)**:

1. Pastikan Anda punya Database *PostgreSQL* kosong, lalu isi kredensial di file `server/.env`.
2. Buka terminal komputasi pada folder repositori utama Anda.
3. Jalankan:
   ```bash
   npm install        // Hanya saat pertama kali untuk mengunduh modul penggerak
   npm run dev        // Nyalakan mesinnya!
   ```
4. Boom! Sistem *Backend* Engine otomatis hidup di stasiun `localhost:5000` dan merajut *Dashboard Antarmuka* secara serempak di browser Anda pada stasiun `localhost:5173`.

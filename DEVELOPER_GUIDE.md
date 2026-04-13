# 🧑‍💻 Developer Guide & Technical Architecture

Selamat datang di *Core System* dari **Event Management Multi-Tenant SaaS**. 
Dokumen ini adalah *"Bible"* (buku pedoman utama) bagi setiap *Software Engineer* (Bisa Anda, *Freelancer* baru, atau Rekan Tim Anda) yang akan berkontribusi pada pengembangan kode di repository ini. 

Jika Anda akan menambahkan fitur baru, melakukan *maintenance*, atau *debugging*, pastikan Anda menyerap setiap panduan yang tertulis di sini untuk mempertahankan **Kualitas Kode Tingkat Enterprise (Clean Code, DRY, dan High Security)**.

---

## 🗺️ 1. Peta Arsitektur Proyek (Monorepo)

Aplikasi dibangun menggunakan **PERN Stack** yang dipisah menjadi dua wilayah server yang mandiri:

```text
d:\proyekfahri\eventmanagement\
├── client/                     (React + Vite - Port 5173)
│   ├── index.html              (Entry Point)
│   ├── package.json            (Dependencies Frontend)
│   └── src/
│       ├── App.jsx             (React Router DOM & Global Authentication Guard)
│       ├── main.jsx            (Root Renderer)
│       ├── index.css           (Gudang Vanilla CSS, Token Warna & Desain UI Global)
│       ├── assets/             (File gambar/ikon/font statis)
│       ├── components/ui/      (✨ GUDANG UI KITA: Modal.jsx, Badge.jsx, EmptyState.jsx)
│       ├── context/            (AuthContext.jsx - State Management Login via Context API)
│       ├── pages/              (Layout Layar Penuh: EventsPage.jsx, VendorsPage.jsx dll)
│       └── services/           (Helpers format dan Axios API Interceptor)
│
├── server/                     (Node.js + Express.js - Port 5000)
│   ├── server.js               (Engine Starter & Pendengar Port)
│   ├── package.json            (Dependencies Backend)
│   ├── config/
│   │   └── db.js               (Jantung Aplikasi: PostgreSQL Pool & Row-Level Security Enforcer)
│   ├── controllers/            (Kumpulan Logika Eksekusi Bisnis (MVC - Controllers))
│   ├── middleware/             (Pertahanan Baris Depan: authMiddleware.js & errorHandler.js)
│   ├── routes/                 (Alur Lalu Lintas: api/events, api/vendors)
│   └── services/               (Fungsi Latar Belakang: webhookService.js & cron)
│
└── package.json                (Menjalankan Front & Backend berbarengan - `npm run dev`)
```

---

## 🛡️ 2. Doktrin Keamanan Utama: Multi-Tenancy (Row-Level Security)

Aplikasi ini adalah **B2B SaaS**. Data satu pengguna (Satu Event Organizer/Tenant) haram hukumnya tumpang tindih dengan data Event Organizer lain.

### a. Cara Kerja (Wajib Dibaca Oleh Backend Dev)
Sistem menggunakan `app.current_tenant_id` dari PostgreSQL session. Kita sudah menulis satu fungsi jenius di `server/config/db.js` yang secara otomatis mengurung transaksi SQL pada token Tenant tertentu.

### b. Contoh Penulisan Kode yang BENAR:
```javascript
// ✅ BENAR: Memakai abstraksi kita (Aman. Mustahil data EO lain terbaca).
const result = await queryWithTenant(req.user.tenantId, 'SELECT * FROM events');
```

### c. Contoh Penulisan Kode yang SALAH & FATAL:
```javascript
// ❌ SALAH: Mengeksekusi Query langsung ke Pool Database. 
// INI AKAN MENAMPILKAN SEMUA DATA SELURUH CLIENT DI DUNIA!
const result = await pool.query('SELECT * FROM events');
```

**ATURAN MUTLAK:** Setiap `Controller` yang mengatur `CRUD` harus dan wajib membungkus *query database* dengan `queryWithTenant()`.

---

## 🧱 3. Doktrin "Don't Repeat Yourself" (DRY) pada Frontend

Saat membangun *View* (Tampilan) pada React, jangan pernah menulis logika mentah berulang kali. 

### A. Pop-Up Formulir (Modal)
Pada versi awal, tag *overlay*, panel putih, hingga tombol **(X)** ditulis secara manual memakan 30+ baris di semua 8 *pages*. Sekarang, kita sudah menerapkan struktur *Smart Component*.

**Cara standar memanggil Pop-up di proyek ini:**
```jsx
import Modal from '../components/ui/Modal';

function MyPage({ show, setShow }) {
  return (
    <Modal isOpen={show} onClose={() => setShow(false)} title="Tambah Data">
      <form onSubmit={...}>
        <div className="modal-body">
           <input />
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary">Simpan</button>
        </div>
      </form>
    </Modal>
  )
}
```

### B. Notifikasi / Label / Badge Kosong
Sama seperti `Modal`, jangan mengecek panjang Array secara kasar lalu merender teks paragraf kosong `<p>Data Belum Ada</p>`. Panggil **`<EmptyState>`** untuk visual konsisten.
Gunakan **`<Badge>`** untuk memberikan sorotan visual pada status (Misalnya: *Status Pending*, *Status Paid*). `<Badge>` secara pintar mengkalkulasi warna secara mandiri.

---

## 📡 4. Jaringan Data & API Client (*Axios Interceptors*)

Untuk bertransaksi dengan backend, Dev baru tidak perlu repot menyusun *Headers Token* di setiap fetch.
Buka `client/src/services/api.js`. Jika Anda menulis `api.get('/blabla')` di frontend manapun, fungsi tersebut secara otomatis langsung merotasi *Token JWT (JSON Web Token)* ke backend.

### Standardisasi Pembuatan Error Handling UI:
Setiap tombol *"Simpan"* (Submit) di aplikasi memiliki prosedur penangkapan (*Catch*) Error standar.
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/api/endpoint/baru', form);
    // Beri aksi post-success di sini (Menutup modal, me-refresh data)
  } catch (err) {
    // Pola ini HARUS SELALU digunakan karena backend kita mengirim error berupa `{ error: string }`
    alert(err.response?.data?.error || 'Gagal menyimpan');
  }
};
```

---

## 🔐 5. Format Pembersihan Input (Anti-Overposting) di Backend

Pada modul **UPDATE Data** (Sistem ganti data spesifik), backend harus dipersenjatai filter keras agar Hacker tidak menyuntik peran sakti.

Setiap *Controller* seperti `eventController.js` memiliki pola *Looping* yang hanya mengambil data yang DIIZINKAN.
```javascript
const allowedFields = ['title', 'description', 'budget']; // Daftarkan kolom database yang BOLEH diubah user

const updates = [];
const values = [];
let idx = 1;

for (const field of allowedFields) {
  if (fields[field] !== undefined) {
    updates.push(`${field} = $${idx++}`);
    values.push(fields[field]);
  }
}
// Lalu suntikan `updates.join(', ')` ke query UPDATE DB.
```
**Aturan Programmer:** Jika Anda menambah field baru di `events` (Misalnya field `catatan_klien`), pastikan Anda mendaftarkan nama array tersebut kedalam list `allowedFields` pada fungsi Edit agar data tersebut tidak di-blok oleh keamanan sistem.

---

## 🎨 6. Arsitektur Styling CSS Terpusat (Vanilla CSS Tokens)

*Project* ini menggunakan CSS mentah tanpa framework berat (Tanpa *Tailwind* / *Bootstrap*) agar sangat ringan *(Blazing Fast)*.
Rahasia yang digunakan adalah pola pendefinisian **Variabel CSS Global**.

- Semua warna, *padding gap*, shadow, dan parameter kurva (radius) diletakkan absolut pada Puncak file **`client/index.css`** pada deklarasi `:root`.
- Jika Tim Desain ingin mengubah citra warna perusahaan EO kita dari **Ungu (`#8b5cf6`)** menjadi **Merah (`#f43f5e`)**, Anda TIDAK perlu menyusuri ribuan baris `.jsx`. Anda hanya tinggal mengganti:
  `--primary: #f43f5e;` pada file `index.css`.
- Pola tombol **HANYA** boleh memanggil:
  - `<button className="btn btn-primary">` untuk Call to Action utama.
  - `<button className="btn btn-secondary">` untuk tombol batal/sampingan.
  - `<button className="btn btn-danger">` untuk menghapus.

---

## 🤖 7. Mekanisme Cron Job & Webhook Latar Belakang

Sistem tidak hanya beroperasi di depan layar, melainkan juga *"Mesin yang terus bekerja di belakang"*.
Pada `server/server.js`, kami telah menyalakan *Cron Job Validator*.

1. Mesin menyala **Setiap Jam**.
2. Mesin menggunakan `node-cron` untuk mencari data *Deadlines* yang tertunggak.
3. Mesin otomatis mencari konfigurasi URL Webhook yang didaftarkan EO tersebut.
4. Mesin menebakkan muatan JSON (*Payload*) ke URL `n8n` klien yang kemudian dimanfaatkan klien sebagai alat pelontar Blast Pesan WA/Email secara *out-of-the-box*.

**Penambahan Logika Waktu:** Letak kecerdasan *Cron Job* ini ada di `server/services/deadlineChecker.js`. Jika sewaktu-waktu algoritma waktunya perlu diubah, manipulasi di sana.

---

### *Good luck! Keep the codebase clean, elegant, and secure.* 🧑‍💻🔥

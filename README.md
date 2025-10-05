## Praktikum Pemograman Website/Modul-2/ Recipes Collection – Dokumentasi singkat 

Disini kita bikin project websitenya menggunakan dua halaman dengan vanilla/gapake framework hanya HTML, CSS, dan javascript untuk login dan menampilkan koleksi resep. Datanya diambil via fetch dari `https://dummyjson.com/users` sama `https://dummyjson.com/recipes`. tambahaan: profil dashboard, dark mode, tambahkan ke favorit, debounce search /nyari secara realtime, dan filter favorit.

### Struktur File Proyek

- `index.html` — Halaman Login
- `recipes.html` — Halaman Koleksi Resep (hanya setelah login)
- `profile.html` — Sub-halaman Profil Publik (tanpa login; mendukung `?u=username`)
- `style.css` — Gaya global (tema luxury + dark mode)
- `script.js` — Logika aplikasi (login, resep, favorit, modal, dll.)
- `types.d.ts` — Deklarasi tipe global untuk data API (User, Recipe)
- `script.ts` — Helper TypeScript bertipe (fetch, validasi, filter)

---

## index.html (Login)

Fungsi:
- Menyediakan form login: `username` dan `password`.
- Validasi: `password` wajib, `username` harus cocok salah satu user dari API users.
- Saat sukses: simpan `firstName` di `localStorage` (opsional mirror ke sessionStorage jika remember) dan redirect ke `recipes.html`.

Elemen penting:
- Header brand + tombol toggle tema (`#toggle-theme`).
- Form `#login-form` dengan input `#username`, `#password`, checkbox `#remember`, dan helper status `#auth-status`.

Alur (script.js):
- Event `submit` pada `#login-form` → `handleLoginSubmit`.
- `handleLoginSubmit` → fetch `https://dummyjson.com/users` → cari `username` → jika ketemu, `saveUserName(firstName, remember)` → tampilkan “Login berhasil!” → redirect.

---

## recipes.html (Koleksi Resep)

Fungsi:
- Proteksi akses: wajib ada `firstName` di storage.
- Navbar menampilkan brand, tombol tema, link `Profil`, dan tombol `Logout`.
- Controls: search realtime (debounce 300ms), `select` filter `cuisine`, tombol `Favorit` (toggle) untuk menampilkan hanya resep favorit.
- Grid kartu resep: gambar, nama, meta (waktu, difficulty, cuisine), rating (bintaang), ingredients singkat, tombol “View Full Recipe”.
- Modal detail resep: menampilkan gambar, detail lengkap, ingredients, dan instructions.
- Pagination via tombol “Show More” (menambah 10 item per klik).

Elemen penting:
- `#search`, `#cuisine-filter`, `#filter-favorites`, `#recipes-grid`, `#show-more`.

---

## profile.html (Profil Publik)

Fungsi:
- Mendukung `profile.html?u=USERNAME` untuk memilih user spesifik; jika tidak ada, gunakan user pertama.
- Menampilkan profil ringkas: avatar, nama lengkap, username, role, email, phone, alamat, perusahaan, universitas, data biologis (gender, birth, blood, body), data teknis (IP, UserAgent), dan info bank/crypto.

---

## style.css (global css atau ui keseluruahn)

Konsep UI:
- Tema Luxury mewah: Ivory background, Charcoal text, Gold accent, opsi Wine Red.
- Tipografi/font: "Playfair Display" (heading), "Inter" (body).
- Dark mode dengan CSS variables (toggle via `data-theme="dark"`).
- Grid responsif (2 kolom desktop, 1 kolom mobile), animasi fade-in, navbar sticky.

Komponen penting:
- `:root` dan `[data-theme="dark"]` untuk palet warna dan shadow.
- `.navbar`, `.btn-gold`, `.card`, `.grid`, `.recipe-card`, `.modal`.
- `.btn-gold[aria-pressed="true"]` untuk status aktif tombol Favorit.

---

## script.js (logika webappnya)

Ringkasan segment di skripnya:
- Utilities: selektor `$`, `$$`, `debounce`, tema (`loadTheme`, `toggleTheme`).
- Auth storage: `saveUserName`, `getUserName`, `clearUser`.
- Login: `handleLoginSubmit`, `initLoginPage`.
- Resep: state `allRecipes`, `filteredRecipes`, `visibleCount`, favorit `favoritesSet`, flag `showFavoritesOnly`.
- Favorites storage: `favoritesKey`, `loadFavorites`, `saveFavorites`.
- Guard & UI header: `requireAuth`, `renderWelcome`.
- Rendering: `stars`, `createRecipeCard`, `renderGrid`.
- Filter: `applyFilters` (query, cuisine, favorit-only).
- Fetching: `loadRecipes`.
- Interaksi: `attachGridEvents` (view modal, toggle favorit), inisialisasi `initRecipesPage`.
- Modal: `openModal`, `closeModal`.
- Profil publik: `fillProfile`, `initPublicProfilePage`.
- Boot: `DOMContentLoaded` memilih initializer berdasarkan `data-page`.

Alur Penting/user flow:
1) Boot
   - Cek `data-page` pada `<body>`: `login` → `initLoginPage`, `recipes` → `initRecipesPage`, `profile` → `initPublicProfilePage`.

2) Login
   - `handleLoginSubmit`
     - Validasi password kosong → error.
     - Fetch users → cari by `username` (case-insensitive).
     - Simpan `firstName` (selalu ke localStorage, opsional mirror sessionStorage jika remember).
     - Redirect ke `recipes.html`.

3) Resep
   - `requireAuth` blokir akses jika belum login.
   - `loadFavorites` memuat favorit user (key `favorites:<firstName>`).
   - `loadRecipes` fetch `https://dummyjson.com/recipes` → isi `allRecipes`, `filteredRecipes`, isi dropdown cuisine, render grid awal.
   - `applyFilters` digunakan oleh search (debounce 300ms), change cuisine, dan tombol Favorit (toggle `showFavoritesOnly`).
   - `attachGridEvents`
     - Klik “View Full Recipe” → tampilkan modal dengan detail lengkap.
     - Klik “Favorit” di kartu → add/remove dari `favoritesSet` → simpan → render ulang filter (agar filter favorit langsung bereaksi).

4) Modal
   - `openModal`/`closeModal` + tombol close + klik backdrop + Escape.

Variabel/Baris Penting:
- Storage nama user: `saveUserName` menyimpan `firstName` ke localStorage (konsisten dengan requirement).
- Penyimpanan favorit per user: kunci `favorites:<firstName>` memastikan favorit per pengguna berbeda.
- Filter favorit: flag `showFavoritesOnly` diikat ke tombol `#filter-favorites` (atribut `aria-pressed`).
- Debounce search 300ms: mencegah render berulang saat mengetik cepat.

---

## types.d.ts (tempat kita ngedecleare global)

Tujuan:
- Menyediakan interface untuk data API agar konsisten di seluruh proyek dan terbaca oleh editor/TS.

Tipe Utama:
- `User`: subset relevan dari data user DummyJSON (id, username, firstName, dsb.; `password?` disediakan untuk validasi bentuk meski API dummy bisa tak pakai password).
- `Recipe`: tipe lengkap (id, name, image, cuisine, difficulty, cookTimeMinutes, rating, ingredients, instructions?, tags?, caloriesPerServing?).
- `ApiUsersResponse`, `ApiRecipesResponse`: bentuk response dari API.

Catatan:
- File `.d.ts` tidak menghasilkan JavaScript saat build; dipakai untuk hinting dan validasi tipe.

---

## script.ts (ini opsinoal buat helper bertipe)

Tujuan:
- Mengelompokkan fungsi yang erat dengan data agar strongly-typed.

Fungsi:
- `fetchUsers(): Promise<User[]>` — ambil semua user dari API.
- `fetchRecipes(): Promise<Recipe[]>` — ambil semua resep dari API.
- `validateLogin(users, username, password): User | null` — cek username ada dan password tidak kosong.
- `filterRecipes(recipes, query, cuisine, favorites): Recipe[]` — utility filter gabungan.
- `fetchUserByUsername(username): Promise<User | null>` — cari user spesifik.

Integrasi Tipe:
- Di baris pertama `script.ts` ada `/// <reference path="./types.d.ts" />` agar tipe global dikenali editor/TS.
- `script.js` tetap menjalankan DOM logic tanpa build step; `script.ts` bersifat edukatif/opsional.

---

## Penyimpanan & Login

- `firstName`
  - Disimpan di `localStorage` saat login (opsional mirror ke `sessionStorage` jika Remember Me dicentang).
  - Dipakai untuk header sapaan dan key favorit.
- `favorites:<firstName>`
  - Menyimpan array id resep favorit (dalam bentuk Set saat runtime).

---

## Error Handling

- Semua `fetch` dibungkus cek `res.ok`; jika gagal, tampilkan pesan ramah: login → “Gagal terhubung ke server”, resep → placeholder error di grid.
- Validasi form menangani kondisi password kosong dan username tidak ditemukan.

---

## Dark Mode

- Menggunakan atribut `data-theme="dark"` pada `html`; toggle via tombol bulan sabit.
- Preferensi disimpan di `localStorage` key `theme`.

---

## Jalankan Proyek

1) Buka `index.html` di browser (VS Code Live Server atau server statis lain disarankan karena beberapa browser membatasi `fetch` file lokal).
2) Login menggunakan salah satu `username` di DummyJSON, contoh: `emilys` (password apa pun non-kosong untuk validasi bentuk).
3) Setelah masuk, gunakan pencarian, filter cuisine, toggle Favorit, dan “Show More”.
4) Buka `profile.html` atau `profile.html?u=emilys` untuk melihat profil publik.
5) Atau tinggal blok index.htmlnya terus klik kanan open with live server (wajib punya pluginnya). 

---





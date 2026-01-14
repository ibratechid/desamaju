# DESAKU - Sistem Manajemen Surat Desa

Sistem manajemen surat desa dengan workflow approval berjenjang untuk RT, RW, dan Kepala Desa.

## Fitur Utama

### 🔐 Sistem Autentikasi
- Login dengan 5 role berbeda
- Session management dengan localStorage
- Proteksi akses berdasarkan role

### 👥 Role & Hak Akses

1. **Administrator**
   - Dashboard overview dengan statistik
   - Kelola semua surat (lihat, edit, download, hapus)
   - User Management (CRUD)
   - Master Data (Jenis Surat, Data Warga, TTD Digital, Nomor Surat)
   - Pengaturan sistem

2. **Kepala RT**
   - Dashboard dengan surat pending approval
   - Approve/Reject surat dari warga
   - Lihat semua surat

3. **Kepala RW**
   - Dashboard dengan surat pending approval
   - Approve/Reject surat yang sudah disetujui RT
   - Lihat semua surat

4. **Kepala Desa**
   - Dashboard dengan surat pending approval
   - Approve/Reject surat yang sudah disetujui RW
   - Tanda tangan digital pada surat
   - Generate PDF surat yang disetujui

5. **Warga**
   - Dashboard overview surat pribadi
   - Buat surat baru
   - Lihat status dan download surat yang disetujui

### 📄 Workflow Approval

```
Warga Submit → RT Approve → RW Approve → Kepala Desa Approve → Disetujui
```

- **Pending**: Surat yang dibuat warga, menunggu approval RT
- **Process**: Surat yang sudah disetujui RT, menunggu approval RW/Kepala Desa
- **Disetujui**: Surat yang sudah melalui semua approval
- **Rejected**: Surat yang ditolak salah satu approval

### 📊 Fitur Teknis
- Responsive design (mobile-first)
- Data persistence dengan localStorage
- PDF generation dengan html2pdf.js
- Toast notifications
- Modal dialogs
- Form validation
- Search & filter
- Audit trail

## Teknologi

- **HTML5** - Semantic markup
- **CSS3** - Modern styling dengan CSS variables
- **Vanilla JavaScript ES6+** - Tanpa framework
- **html2pdf.js** - PDF generation
- **localStorage** - Data persistence

## Instalasi

1. Clone repository
2. Buka `index.html` di browser
3. Login dengan akun demo

## Login Demo

| Role | Username | Password |
|------|----------|----------|
| Administrator | admin | demo123 |
| Kepala RT | rt01 | demo123 |
| Kepala RW | rw01 | demo123 |
| Kepala Desa | kades | demo123 |
| Warga | warga01 | demo123 |

## Struktur File

```
desamaju/
├── index.html              # Halaman utama
├── css/
│   └── style.css          # Semua styling
├── js/
│   ├── app.js             # Main application logic
│   ├── auth.js            # Authentication module
│   ├── utils.js           # Utility functions
│   └── modules/
│       ├── admin.js       # Admin functionality
│       ├── approval.js    # Approval workflow
│       ├── citizen.js     # Warga functionality
│       ├── common.js      # Shared components
│       ├── letters.js     # Letter management
│       └── master-data.js # Master data CRUD
└── README.md
```

## Data

Semua data disimpan di `localStorage` dengan prefix `desamaju.`:
- `desamaju.users` - Data user
- `desamaju.letters` - Data surat
- `desamaju.letter_types` - Jenis surat
- `desamaju.citizens` - Data warga
- `desamaju.digital_signatures` - TTD digital
- `desamaju.letter_numbering` - Format nomor surat
- `desamaju.settings` - Pengaturan sistem
- `desamaju.activity_logs` - Log aktivitas

## Demo Data

Sistem akan otomatis membuat data demo saat pertama kali dijalankan:
- 5 user (1 per role)
- 5 jenis surat
- 10 data warga
- 3 sample surat dengan status berbeda

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License

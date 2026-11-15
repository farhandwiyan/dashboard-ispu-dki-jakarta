# ISPU DKI Jakarta - Aqua Bento Dashboard (2024 - 2025)

Dashboard interaktif pemantauan kualitas udara (ISPU) DKI Jakarta berbasis **Aqua Bento Design System** dan arsitektur visual 3 zona sesuai Permen LHK No. 14/2020 & PP No. 22/2021.

---

## 🚀 Cara Menjalankan Project

Pilih salah satu cara di bawah ini yang paling praktis:

### Opsi 1: Menjalankan Langsung (Paling Cepat, Tanpa Perlu Install Node.js)
Folder `dist/` sudah berisi build produksi siap pakai. Kamu bisa langsung menjalankannya dengan Python HTTP server:

```bash
cd dist
python3 -m http.server 3000
```
Lalu buka di browser: **[http://localhost:3000](http://localhost:3000)**

*(Atau jika punya extension `Live Server` di VS Code, klik kanan file `dist/index.html` lalu pilih "Open with Live Server")*

---

### Opsi 2: Mode Development (Untuk Edit & Kembangkan Source Code)
Memerlukan **Node.js** (versi 18 ke atas disarankan):

1. **Install dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan otomatis terbuka di browser pada **[http://localhost:3000](http://localhost:3000)**.

3. **Build ulang untuk produksi:**
   ```bash
   npm run build
   ```
   Hasil build akan diperbarui di folder `dist/`.

---

## 📁 Struktur Folder Source Code

```
website/
├── dist/                          # Hasil compile static web siap deploy
├── public/                        # Aset publik statis
├── src/
│   ├── components/
│   │   ├── bento/                 # Widget & panel Bento Dashboard
│   │   │   ├── ExecutiveScorecards.tsx  # Zona 1: 4 Kartu KPI Ringkasan
│   │   │   ├── TemporalTrendPanel.tsx   # Zona 2: Grafik Garis Fluktuasi Bulanan
│   │   │   ├── SpatialMapPanel.tsx      # Zona 2: Peta Leaflet Koroplet 5 Wilayah
│   │   │   ├── RankingBarPanel.tsx      # Zona 3: Bar Chart Peringkat 5 SPKU
│   │   │   ├── YoYStackedBarPanel.tsx   # Zona 3: 100% Stacked Bar Tahunan (2024 vs 2025)
│   │   │   ├── HexaMetricGridPanel.tsx  # Zona 3: Grid 6 Parameter Pencemar Ambien
│   │   │   └── SearchBarWidget.tsx      # Input pencarian stasiun & wilayah
│   │   └── ui/
│   │       └── MetricCard.tsx           # Reusable metric card komponen
│   ├── data/
│   │   └── jakarta_kecamatan.json       # Poligon spasial 42 kecamatan DKI Jakarta
│   ├── lib/
│   │   ├── aqi.ts                       # Skala warna & kategori ISPU (Permen LHK 14/2020)
│   │   └── data.ts                      # Data stasiun, tren bulanan & 6 sub-indeks
│   ├── pages/
│   │   └── BentoDashboardPage.tsx       # Halaman utama Aqua Bento Dashboard
│   ├── styles/
│   │   └── tokens.css                   # Token warna & styling Aqua Bento
│   ├── App.tsx                          # Root component
│   └── main.tsx                         # Entry point aplikasi
├── index.html                           # File HTML utama
├── package.json                         # Dependensi (React 19, Tailwind CSS v4, Vite 6, Leaflet)
├── tailwind.config.js                   # Konfigurasi Tailwind CSS
├── tsconfig.json                        # Konfigurasi TypeScript
└── vite.config.ts                       # Konfigurasi Vite
```

---

## 🛠️ Teknologi yang Digunakan
- **Frontend Framework**: React 19 (TypeScript)
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4 + Aqua Bento Design System
- **Peta Spasial**: Leaflet JS + Esri World Light Canvas (Tanpa API Key)
- **Icons**: Lucide React

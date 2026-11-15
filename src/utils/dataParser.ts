import rawCsv from '../data/data_bersih.csv?raw';

export interface RawIspuRow {
  parameter_pencemar_kritis: string;
  kategori: string;
  periode_data: string;
  bulan: number;
  tanggal: number;
  stasiun: string;
  pm_sepuluh: number | null;
  pm_duakomalima: number | null;
  sulfur_dioksida: number | null;
  karbon_monoksida: number | null;
  ozon: number | null;
  nitrogen_dioksida: number | null;
  max: number | null;
  stasiun_clean: string;
  tahun: number;
  periode_str: string;
}

export interface StationData {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  avgIspu: number;
  pm25: number;
  pm10: number;
  so2: number;
  co: number;
  o3: number;
  no2: number;
  maxIspu: number;
  minIspu: number;
  criticalPollutant: string;
  criticalRatioPercent: number;
  observationCount: number;
  typology: string;
  address: string;
}

export interface MonthlyTrend {
  period: string; // YYYY-MM
  monthShort: string;
  label: string;
  ispu: number; // mean(max)
  avgIspu: number; // alias for mean(max)
  maxIspu: number; // peak daily max in that month
  minIspu: number;
  peakDay: number;
  peakDateLabel: string;
  peakStation: string;
  peakPollutant: string;
  peakCategory: string;
  year: number;
  month: number;
  count: number;
  season: string;
  seasonTag: string;
}

export interface DailyPeakPoint {
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // DD MMM YYYY
  period: string; // YYYY-MM
  year: number;
  month: number;
  day: number;
  maxIspu: number;
  meanIspu: number;
  station: string;
  pollutant: string;
  category: string;
}

export interface YoYCategoryStat {
  year: number;
  totalDays: number;
  meanIspu: number;
  counts: {
    BAIK: number;
    SEDANG: number;
    'TIDAK SEHAT': number;
    'SANGAT TIDAK SEHAT': number;
  };
  percentages: {
    BAIK: number;
    SEDANG: number;
    'TIDAK SEHAT': number;
    'SANGAT TIDAK SEHAT': number;
  };
}

export interface SubIndexInfo {
  code: string;
  csvColumn: string;
  name: string;
  avgValue: number;
  minValue: number;
  maxValue: number;
  validCount: number;
  unit: string;
  standard: string;
  standardValue: number;
  ratioPercent: number;
  isExceeded: boolean;
  statusLabel: string;
  description: string;
  clinicalImpact: string;
  whoRatio: string;
}

export interface ExecutiveSummaryMetrics {
  totalRows: number;
  cityMeanIspu: number;
  mean2024: number;
  mean2025: number;
  yoyIspuDiffPercent: number;
  goodDaysCount: number;
  goodDaysPercent: number;
  goodDays2024Percent: number;
  goodDays2025Percent: number;
  goodDaysYoyDelta: number;
  dominantPollutant: string;
  dominantPollutantCount: number;
  dominantPollutantLabeledTotal: number;
  dominantPollutantPercentLabeled: number;
  dominantPollutantPercentAll: number;
  cleanestStation: StationData;
  highestStation: StationData;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const STATION_META: Record<
  string,
  {
    id: string;
    name: string;
    city: string;
    lat: number;
    lng: number;
    typology: string;
    address: string;
  }
> = {
  'DKI1 (Bundaran HI)': {
    id: 'DKI1',
    name: 'DKI1 (Bundaran HI)',
    city: 'Jakarta Pusat',
    lat: -6.195,
    lng: 106.823,
    typology: 'Pusat Komersial & Transportasi Padat',
    address: 'Kawasan Bundaran Hotel Indonesia, Menteng, Jakarta Pusat'
  },
  'DKI2 (Kelapa Gading)': {
    id: 'DKI2',
    name: 'DKI2 (Kelapa Gading)',
    city: 'Jakarta Utara',
    lat: -6.156,
    lng: 106.911,
    typology: 'Koridor Pesisir & Logistik Pelabuhan',
    address: 'Kawasan Boulevard Barat Kelapa Gading, Jakarta Utara'
  },
  'DKI3 (Jagakarsa)': {
    id: 'DKI3',
    name: 'DKI3 (Jagakarsa)',
    city: 'Jakarta Selatan',
    lat: -6.33,
    lng: 106.803,
    typology: 'Penyangga Hijau & Residensial Suburban',
    address: 'Kawasan Ragunan - Jagakarsa, Jakarta Selatan'
  },
  'DKI4 (Lubang Buaya)': {
    id: 'DKI4',
    name: 'DKI4 (Lubang Buaya)',
    city: 'Jakarta Timur',
    lat: -6.289,
    lng: 106.909,
    typology: 'Residensial Timur & Koridor Tol Jagorawi',
    address: 'Kawasan Cipayung - Lubang Buaya, Jakarta Timur'
  },
  'DKI5 (Kebon Jeruk)': {
    id: 'DKI5',
    name: 'DKI5 (Kebon Jeruk)',
    city: 'Jakarta Barat',
    lat: -6.202,
    lng: 106.752,
    typology: 'Koridor Komersial Barat & Arteri Merak',
    address: 'Kawasan Panjang - Kebon Jeruk, Jakarta Barat'
  }
};

function toNum(val: string | undefined): number | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function normalizePollutantLabel(raw: string, row?: RawIspuRow): string {
  const clean = raw.trim().toUpperCase();
  if (clean === 'PM25' || clean === 'PM2.5') return 'PM2.5';
  if (clean) return clean;

  // Infer critical pollutant when column is blank in CSV by matching max value
  if (row && row.max !== null) {
    const candidates: Array<[string, number | null]> = [
      ['PM2.5', row.pm_duakomalima],
      ['PM10', row.pm_sepuluh],
      ['SO2', row.sulfur_dioksida],
      ['CO', row.karbon_monoksida],
      ['O3', row.ozon],
      ['NO2', row.nitrogen_dioksida]
    ];
    for (const [label, v] of candidates) {
      if (v !== null && Math.abs(v - row.max) < 0.01) {
        return label;
      }
    }
  }
  return 'PM2.5';
}

function getSeasonMetadata(month: number, avgIspu: number): { season: string; seasonTag: string } {
  if (month === 1 || month === 2 || month === 12) {
    return {
      season: 'Musim Hujan',
      seasonTag: avgIspu <= 50 ? 'Kategori Baik' : 'Wet Deposition'
    };
  }
  if (month >= 6 && month <= 9) {
    return {
      season: 'Musim Kemarau',
      seasonTag: avgIspu >= 88 ? 'Puncak Kemarau' : 'Akumulasi Kering'
    };
  }
  return {
    season: 'Musim Peralihan',
    seasonTag: avgIspu >= 80 ? 'Transisi Kemarau' : 'Peralihan Musim'
  };
}

/**
 * Membaca dan mem-parsing seluruh baris `data_bersih.csv`
 */
export function parseIspuCsv(csvText: string): RawIspuRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const rows: RawIspuRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');
    if (cols.length < 16) continue;

    rows.push({
      parameter_pencemar_kritis: cols[0].trim(),
      kategori: cols[1].trim().toUpperCase(),
      periode_data: cols[2].trim(),
      bulan: Number(cols[3]) || 1,
      tanggal: Number(cols[4]) || 1,
      stasiun: cols[5].trim(),
      pm_sepuluh: toNum(cols[6]),
      pm_duakomalima: toNum(cols[7]),
      sulfur_dioksida: toNum(cols[8]),
      karbon_monoksida: toNum(cols[9]),
      ozon: toNum(cols[10]),
      nitrogen_dioksida: toNum(cols[11]),
      max: toNum(cols[12]),
      stasiun_clean: cols[13].trim(),
      tahun: Number(cols[14]) || 2024,
      periode_str: cols[15].trim()
    });
  }
  return rows;
}

function mean(vals: number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((acc, v) => acc + v, 0) / vals.length;
}

export const RAW_CSV_ROWS: RawIspuRow[] = parseIspuCsv(rawCsv);

// 1. Station Aggregations (DKI1 - DKI5)
function buildStationData(rows: RawIspuRow[]): StationData[] {
  const stationOrder = [
    'DKI1 (Bundaran HI)',
    'DKI2 (Kelapa Gading)',
    'DKI3 (Jagakarsa)',
    'DKI4 (Lubang Buaya)',
    'DKI5 (Kebon Jeruk)'
  ];

  return stationOrder.map((stKey) => {
    const meta = STATION_META[stKey];
    const stRows = rows.filter((r) => r.stasiun_clean === stKey);

    const maxVals = stRows.map((r) => r.max).filter((v): v is number => v !== null);
    const pm25Vals = stRows.map((r) => r.pm_duakomalima).filter((v): v is number => v !== null);
    const pm10Vals = stRows.map((r) => r.pm_sepuluh).filter((v): v is number => v !== null);
    const so2Vals = stRows.map((r) => r.sulfur_dioksida).filter((v): v is number => v !== null);
    const coVals = stRows.map((r) => r.karbon_monoksida).filter((v): v is number => v !== null);
    const o3Vals = stRows.map((r) => r.ozon).filter((v): v is number => v !== null);
    const no2Vals = stRows.map((r) => r.nitrogen_dioksida).filter((v): v is number => v !== null);

    // Modus parameter_pencemar_kritis
    const critCounter: Record<string, number> = {};
    let critTotal = 0;
    for (const r of stRows) {
      if (r.parameter_pencemar_kritis) {
        const label = normalizePollutantLabel(r.parameter_pencemar_kritis, r);
        critCounter[label] = (critCounter[label] || 0) + 1;
        critTotal++;
      }
    }
    const topCrit = Object.entries(critCounter).sort((a, b) => b[1] - a[1])[0] || ['PM2.5', 0];

    return {
      id: meta.id,
      name: meta.name,
      city: meta.city,
      lat: meta.lat,
      lng: meta.lng,
      avgIspu: Number(mean(maxVals).toFixed(2)),
      pm25: Number(mean(pm25Vals).toFixed(1)),
      pm10: Number(mean(pm10Vals).toFixed(1)),
      so2: Number(mean(so2Vals).toFixed(1)),
      co: Number(mean(coVals).toFixed(1)),
      o3: Number(mean(o3Vals).toFixed(1)),
      no2: Number(mean(no2Vals).toFixed(1)),
      maxIspu: maxVals.length ? Math.max(...maxVals) : 0,
      minIspu: maxVals.length ? Math.min(...maxVals) : 0,
      criticalPollutant: topCrit[0],
      criticalRatioPercent: critTotal > 0 ? Number(((topCrit[1] / critTotal) * 100).toFixed(1)) : 0,
      observationCount: stRows.length,
      typology: meta.typology,
      address: meta.address
    };
  });
}

export const STATIONS: StationData[] = buildStationData(RAW_CSV_ROWS);

// 2. Monthly Trends (23 Periode: 2024-01 s.d. 2025-11)
function buildMonthlyTrends(rows: RawIspuRow[]): MonthlyTrend[] {
  const grouped = new Map<string, RawIspuRow[]>();
  for (const r of rows) {
    if (!r.periode_str) continue;
    const arr = grouped.get(r.periode_str) || [];
    arr.push(r);
    grouped.set(r.periode_str, arr);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, pRows]) => {
      const validRows = pRows.filter((r) => r.max !== null);
      const maxVals = validRows.map((r) => r.max as number);
      const avg = mean(maxVals);

      // Peak record in this month
      let peakRow = validRows[0];
      for (const r of validRows) {
        if ((r.max ?? 0) > (peakRow?.max ?? 0)) {
          peakRow = r;
        }
      }

      const year = pRows[0].tahun;
      const month = pRows[0].bulan;
      const monthShort = MONTH_NAMES_SHORT[month - 1] || 'Jan';
      const { season, seasonTag } = getSeasonMetadata(month, avg);
      const peakDay = peakRow ? peakRow.tanggal : 1;

      return {
        period,
        monthShort,
        label: `${monthShort} ${year}`,
        ispu: Number(avg.toFixed(2)),
        avgIspu: Number(avg.toFixed(2)),
        maxIspu: peakRow?.max ?? 0,
        minIspu: maxVals.length ? Math.min(...maxVals) : 0,
        peakDay,
        peakDateLabel: `${String(peakDay).padStart(2, '0')} ${monthShort} ${year}`,
        peakStation: peakRow?.stasiun_clean || 'DKI1 (Bundaran HI)',
        peakPollutant: peakRow ? normalizePollutantLabel(peakRow.parameter_pencemar_kritis, peakRow) : 'PM2.5',
        peakCategory: peakRow?.kategori || 'SEDANG',
        year,
        month,
        count: validRows.length,
        season,
        seasonTag
      };
    });
}

export const MONTHLY_TRENDS: MonthlyTrend[] = buildMonthlyTrends(RAW_CSV_ROWS);

// 3. Daily Peak Series (Pilihan B: Absolute Anomaly Line Chart - Harian)
function buildDailyPeakSeries(rows: RawIspuRow[]): DailyPeakPoint[] {
  const byDate = new Map<string, RawIspuRow[]>();
  for (const r of rows) {
    if (r.max === null) continue;
    const dayStr = String(r.tanggal).padStart(2, '0');
    const dateKey = `${r.periode_str}-${dayStr}`;
    const list = byDate.get(dateKey) || [];
    list.push(r);
    byDate.set(dateKey, list);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, dRows]) => {
      let topRow = dRows[0];
      for (const r of dRows) {
        if ((r.max ?? 0) > (topRow.max ?? 0)) {
          topRow = r;
        }
      }
      const vals = dRows.map((r) => r.max as number);
      const monthShort = MONTH_NAMES_SHORT[topRow.bulan - 1] || 'Jan';
      const dayPad = String(topRow.tanggal).padStart(2, '0');

      return {
        dateStr,
        displayDate: `${dayPad} ${monthShort} ${topRow.tahun}`,
        period: topRow.periode_str,
        year: topRow.tahun,
        month: topRow.bulan,
        day: topRow.tanggal,
        maxIspu: topRow.max ?? 0,
        meanIspu: Number(mean(vals).toFixed(1)),
        station: topRow.stasiun_clean,
        pollutant: normalizePollutantLabel(topRow.parameter_pencemar_kritis, topRow),
        category: topRow.kategori
      };
    });
}

export const DAILY_PEAK_SERIES: DailyPeakPoint[] = buildDailyPeakSeries(RAW_CSV_ROWS);

export const TOP_ANOMALY_RECORDS: DailyPeakPoint[] = [...DAILY_PEAK_SERIES]
  .sort((a, b) => b.maxIspu - a.maxIspu)
  .slice(0, 10);

// 4. YoY Category Breakdown (2024 vs 2025)
function buildYoYBreakdown(rows: RawIspuRow[]): Record<number, YoYCategoryStat> {
  const result: Record<number, YoYCategoryStat> = {};

  for (const yr of [2024, 2025]) {
    const yrRows = rows.filter((r) => r.tahun === yr && r.kategori);
    const total = yrRows.length;
    const maxVals = yrRows.map((r) => r.max).filter((v): v is number => v !== null);

    const counts = {
      BAIK: 0,
      SEDANG: 0,
      'TIDAK SEHAT': 0,
      'SANGAT TIDAK SEHAT': 0
    };

    for (const r of yrRows) {
      if (r.kategori in counts) {
        counts[r.kategori as keyof typeof counts]++;
      }
    }

    result[yr] = {
      year: yr,
      totalDays: total,
      meanIspu: Number(mean(maxVals).toFixed(2)),
      counts,
      percentages: {
        BAIK: total ? Number(((counts.BAIK / total) * 100).toFixed(2)) : 0,
        SEDANG: total ? Number(((counts.SEDANG / total) * 100).toFixed(2)) : 0,
        'TIDAK SEHAT': total ? Number(((counts['TIDAK SEHAT'] / total) * 100).toFixed(2)) : 0,
        'SANGAT TIDAK SEHAT': total ? Number(((counts['SANGAT TIDAK SEHAT'] / total) * 100).toFixed(2)) : 0
      }
    };
  }

  return result;
}

export const YOY_BREAKDOWN = buildYoYBreakdown(RAW_CSV_ROWS);

// 5. Zona 1: Executive Summary Metrics
function buildExecutiveSummary(rows: RawIspuRow[], stations: StationData[]): ExecutiveSummaryMetrics {
  const maxVals = rows.map((r) => r.max).filter((v): v is number => v !== null);
  const cityMeanIspu = Number(mean(maxVals).toFixed(2));

  const mean2024 = YOY_BREAKDOWN[2024]?.meanIspu ?? 75.06;
  const mean2025 = YOY_BREAKDOWN[2025]?.meanIspu ?? 71.49;
  const yoyIspuDiffPercent = Number((((mean2025 - mean2024) / mean2024) * 100).toFixed(1));

  const goodDaysCount = rows.filter((r) => r.kategori === 'BAIK').length;
  const goodDaysPercent = Number(((goodDaysCount / rows.length) * 100).toFixed(2));

  const goodDays2024Percent = YOY_BREAKDOWN[2024]?.percentages.BAIK ?? 9.21;
  const goodDays2025Percent = YOY_BREAKDOWN[2025]?.percentages.BAIK ?? 16.67;
  const goodDaysYoyDelta = Number((goodDays2025Percent - goodDays2024Percent).toFixed(1));

  // Modus parameter_pencemar_kritis
  const critCounts: Record<string, number> = {};
  let labeledTotal = 0;
  for (const r of rows) {
    if (r.parameter_pencemar_kritis) {
      const k = normalizePollutantLabel(r.parameter_pencemar_kritis, r);
      critCounts[k] = (critCounts[k] || 0) + 1;
      labeledTotal++;
    }
  }
  const topPollutant = Object.entries(critCounts).sort((a, b) => b[1] - a[1])[0] || ['PM2.5', 0];

  const sortedByCleanest = [...stations].sort((a, b) => a.avgIspu - b.avgIspu);

  return {
    totalRows: rows.length,
    cityMeanIspu,
    mean2024,
    mean2025,
    yoyIspuDiffPercent,
    goodDaysCount,
    goodDaysPercent,
    goodDays2024Percent,
    goodDays2025Percent,
    goodDaysYoyDelta,
    dominantPollutant: topPollutant[0],
    dominantPollutantCount: topPollutant[1],
    dominantPollutantLabeledTotal: labeledTotal,
    dominantPollutantPercentLabeled: Number(((topPollutant[1] / labeledTotal) * 100).toFixed(1)),
    dominantPollutantPercentAll: Number(((topPollutant[1] / rows.length) * 100).toFixed(1)),
    cleanestStation: sortedByCleanest[0],
    highestStation: sortedByCleanest[sortedByCleanest.length - 1]
  };
}

export const EXECUTIVE_SUMMARY: ExecutiveSummaryMetrics = buildExecutiveSummary(RAW_CSV_ROWS, STATIONS);

// 6. Zona 3: 6 Ambient Pollutant Parameters (Hexa-Metric Grid)
function buildSubIndices(rows: RawIspuRow[]): SubIndexInfo[] {
  const specs: Array<{
    code: string;
    csvColumn: keyof RawIspuRow;
    name: string;
    unit: string;
    standard: string;
    standardValue: number;
    statusSafe: string;
    description: string;
    clinicalImpact: string;
    whoLimit: number;
  }> = [
    {
      code: 'PM2.5',
      csvColumn: 'pm_duakomalima',
      name: 'Partikulat Halus (≤ 2.5 µm)',
      unit: 'ISPU',
      standard: '50 ISPU (Ambang Baik) / 65 µg/m³',
      standardValue: 65.0,
      statusSafe: 'Terkendali',
      description: 'Partikel mikroskopis dari knalpot diesel dan industri yang mampu menembus alveolus paru ke sirkulasi darah.',
      clinicalImpact: 'Memicu serangan jantung, asma akut, stroke, dan penyakit pernapasan kronis.',
      whoLimit: 15
    },
    {
      code: 'PM10',
      csvColumn: 'pm_sepuluh',
      name: 'Partikulat Kasar (≤ 10 µm)',
      unit: 'ISPU',
      standard: '75 µg/m³ (Baku Mutu 24 Jam)',
      standardValue: 75.0,
      statusSafe: 'Terkendali',
      description: 'Debu jalanan, aktivitas konstruksi infrastruktur, dan suspensi partikel tanah di ruang terbuka.',
      clinicalImpact: 'Iritasi saluran pernapasan atas, batuk berdahak, dan penurunan fungsi paru-paru.',
      whoLimit: 45
    },
    {
      code: 'SO2',
      csvColumn: 'sulfur_dioksida',
      name: 'Sulfur Dioksida',
      unit: 'ISPU',
      standard: '75 µg/m³ (Baku Mutu 24 Jam)',
      standardValue: 75.0,
      statusSafe: 'Aman',
      description: 'Gas hasil pembakaran bahan bakar fosil bersulfur, emisi PLTU, dan cerobong kawasan industri berat.',
      clinicalImpact: 'Bronkokonstriksi, peningkatan serangan asma, dan pembentukan hujan asam.',
      whoLimit: 40
    },
    {
      code: 'CO',
      csvColumn: 'karbon_monoksida',
      name: 'Karbon Monoksida',
      unit: 'ISPU',
      standard: '100 ISPU / 4.000 µg/m³ (8 Jam)',
      standardValue: 100.0,
      statusSafe: 'Sangat Rendah',
      description: 'Gas tidak berbau hasil pembakaran mesin tidak sempurna saat antrean kemacetan kendaraan.',
      clinicalImpact: 'Mengikat hemoglobin darah, menurunkan asupan oksigen ke otak dan jantung.',
      whoLimit: 100
    },
    {
      code: 'O3',
      csvColumn: 'ozon',
      name: 'Ozon Permukaan (Troposferik)',
      unit: 'ISPU',
      standard: '100 µg/m³ (Baku Mutu 8 Jam)',
      standardValue: 100.0,
      statusSafe: 'Aman',
      description: 'Polutan sekunder hasil reaksi fotokimia antara NOx dan VOC di bawah terik radiasi matahari.',
      clinicalImpact: 'Kerusakan jaringan paru, inflamasi saluran napas, dan nyeri dada saat menarik napas.',
      whoLimit: 100
    },
    {
      code: 'NO2',
      csvColumn: 'nitrogen_dioksida',
      name: 'Nitrogen Dioksida',
      unit: 'ISPU',
      standard: '65 µg/m³ (Baku Mutu 24 Jam)',
      standardValue: 65.0,
      statusSafe: 'Terkendali',
      description: 'Emisi mesin kendaraan bermotor kompresi tinggi dan instalasi pembangkit tenaga listrik.',
      clinicalImpact: 'Peningkatan risiko infeksi saluran pernapasan anak dan memperburuk gejala bronkitis.',
      whoLimit: 25
    }
  ];

  return specs.map((sp) => {
    const vals = rows
      .map((r) => r[sp.csvColumn])
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

    const avg = Number(mean(vals).toFixed(2));
    const minVal = vals.length ? Math.min(...vals) : 0;
    const maxVal = vals.length ? Math.max(...vals) : 0;
    const ratioPercent = Number(((avg / sp.standardValue) * 100).toFixed(1));
    const isExceeded = avg > sp.standardValue || avg > 50;

    return {
      code: sp.code,
      csvColumn: String(sp.csvColumn),
      name: sp.name,
      avgValue: avg,
      minValue: minVal,
      maxValue: maxVal,
      validCount: vals.length,
      unit: sp.unit,
      standard: sp.standard,
      standardValue: sp.standardValue,
      ratioPercent,
      isExceeded,
      statusLabel: isExceeded ? 'Melebihi Batas' : sp.statusSafe,
      description: sp.description,
      clinicalImpact: sp.clinicalImpact,
      whoRatio: `${(avg / sp.whoLimit).toFixed(1)}× Ambang Referensi (${sp.whoLimit})`
    };
  });
}

export const SUB_INDICES: SubIndexInfo[] = buildSubIndices(RAW_CSV_ROWS);

export const CITY_STATION_MAP: Record<string, string> = {
  'JAKARTA PUSAT': 'DKI1',
  'JAKARTA UTARA': 'DKI2',
  'JAKARTA SELATAN': 'DKI3',
  'JAKARTA TIMUR': 'DKI4',
  'JAKARTA BARAT': 'DKI5'
};

export const KECAMATAN_STATION_MAP: Record<string, { stationId: string; city: string }> = {
  // Jakarta Pusat (DKI1)
  'GAMBIR': { stationId: 'DKI1', city: 'Jakarta Pusat' },
  'SAWAH BESAR': { stationId: 'DKI1', city: 'Jakarta Pusat' },
  'KEMAYORAN': { stationId: 'DKI1', city: 'Jakarta Pusat' },
  'SENEN': { stationId: 'DKI1', city: 'Jakarta Pusat' },
  'CEMPAKA PUTIH': { stationId: 'DKI1', city: 'Jakarta Pusat' },
  'MENTENG': { stationId: 'DKI1', city: 'Jakarta Pusat' },
  'TANAH ABANG': { stationId: 'DKI1', city: 'Jakarta Pusat' },
  'JOHAR BARU': { stationId: 'DKI1', city: 'Jakarta Pusat' },

  // Jakarta Utara (DKI2)
  'PENJARINGAN': { stationId: 'DKI2', city: 'Jakarta Utara' },
  'TANJUNG PRIOK': { stationId: 'DKI2', city: 'Jakarta Utara' },
  'KOJA': { stationId: 'DKI2', city: 'Jakarta Utara' },
  'CILINCING': { stationId: 'DKI2', city: 'Jakarta Utara' },
  'PADEMANGAN': { stationId: 'DKI2', city: 'Jakarta Utara' },
  'KELAPA GADING': { stationId: 'DKI2', city: 'Jakarta Utara' },

  // Jakarta Barat (DKI5)
  'CENGKARENG': { stationId: 'DKI5', city: 'Jakarta Barat' },
  'GROGOL PETAMBURAN': { stationId: 'DKI5', city: 'Jakarta Barat' },
  'TAMAN SARI': { stationId: 'DKI5', city: 'Jakarta Barat' },
  'TAMBORA': { stationId: 'DKI5', city: 'Jakarta Barat' },
  'KEBON JERUK': { stationId: 'DKI5', city: 'Jakarta Barat' },
  'KALIDERES': { stationId: 'DKI5', city: 'Jakarta Barat' },
  'PALMERAH': { stationId: 'DKI5', city: 'Jakarta Barat' },
  'KEMBANGAN': { stationId: 'DKI5', city: 'Jakarta Barat' },

  // Jakarta Selatan (DKI3)
  'TEBET': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'SETIABUDI': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'MAMPANG PRAPATAN': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'PASAR MINGGU': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'KEBAYORAN LAMA': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'CILANDAK': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'KEBAYORAN BARU': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'PANCORAN': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'JAGAKARSA': { stationId: 'DKI3', city: 'Jakarta Selatan' },
  'PESANGGRAHAN': { stationId: 'DKI3', city: 'Jakarta Selatan' },

  // Jakarta Timur (DKI4)
  'MATRAMAN': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'PULOGADUNG': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'JATINEGARA': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'KRAMAT JATI': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'PASAR REBO': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'CAKUNG': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'DUREN SAWIT': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'MAKASAR': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'CIRACAS': { stationId: 'DKI4', city: 'Jakarta Timur' },
  'CIPAYUNG': { stationId: 'DKI4', city: 'Jakarta Timur' }
};


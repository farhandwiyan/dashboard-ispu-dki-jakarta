export type IspuCategoryKey = 'good' | 'moderate' | 'unhealthy' | 'very' | 'hazard' | 'nodata';

export interface IspuCategoryInfo {
  key: IspuCategoryKey;
  label: string;
  color: string;
  bg: string;
  border: string;
  textBadge: string;
  desc: string;
}

/**
 * Fungsi pewarnaan kategori ISPU sesuai Permen LHK No. 14/2020 & planning.md:
 * - 0 - 50 (BAIK): Hijau (#10B981)
 * - 51 - 100 (SEDANG): Biru (#0284C7)
 * - 101 - 200 (TIDAK SEHAT): Kuning / Oranye (#F59E0B)
 * - 201 - 300 (SANGAT TIDAK SEHAT): Merah (#EF4444)
 * - > 300 (BERBAHAYA): Hitam / Merah Gelap (#7F1D1D)
 */
export function getIspuCategory(val: number | null | undefined): IspuCategoryInfo {
  if (val === null || val === undefined || isNaN(val) || val <= 0) {
    return {
      key: 'nodata',
      label: 'TIDAK ADA DATA',
      color: '#94A3B8',
      bg: '#F1F5F9',
      border: '#CBD5E1',
      textBadge: '#475569',
      desc: 'Sensor sedang dalam masa pemeliharaan kalibrasi berkala.'
    };
  }

  if (val <= 50) {
    return {
      key: 'good',
      label: 'BAIK',
      color: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      textBadge: '#065F46',
      desc: 'Tingkat kualitas udara sangat baik, tidak memberikan efek negatif bagi kesehatan manusia maupun lingkungan.'
    };
  }

  if (val <= 100) {
    return {
      key: 'moderate',
      label: 'SEDANG',
      color: '#0284C7',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      textBadge: '#0369A1',
      desc: 'Kualitas udara masih dapat diterima pada kesehatan manusia, hewan, dan tumbuhan (51 - 100 ISPU).'
    };
  }

  if (val <= 200) {
    return {
      key: 'unhealthy',
      label: 'TIDAK SEHAT',
      color: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      textBadge: '#B45309',
      desc: 'Tingkat mutu udara bersifat merugikan pada manusia, hewan, dan tumbuhan yang sensitif (101 - 200 ISPU).'
    };
  }

  if (val <= 300) {
    return {
      key: 'very',
      label: 'SANGAT TIDAK SEHAT',
      color: '#EF4444',
      bg: '#FEF2F2',
      border: '#FECACA',
      textBadge: '#991B1B',
      desc: 'Kualitas udara dapat meningkatkan risiko kesehatan signifikan pada sejumlah segmen populasi yang terpapar (201 - 300 ISPU).'
    };
  }

  return {
    key: 'hazard',
    label: 'BERBAHAYA',
    color: '#7F1D1D',
    bg: '#450A0A',
    border: '#991B1B',
    textBadge: '#FFFFFF',
    desc: 'Tingkat kualitas udara berbahaya secara klinis bagi seluruh populasi; hindari seluruh kegiatan di luar ruangan (>300 ISPU).'
  };
}

/**
 * Pewarnaan Koroplet (Choropleth) berdasarkan kepekatan nilai rata-rata `max` ISPU per stasiun.
 * Semakin tinggi rata-rata `max`, warna poligon semakin pekat.
 */
export function getChoroplethColor(avgMax: number): {
  fillColor: string;
  pinColor: string;
  intensityLabel: string;
} {
  if (avgMax <= 71.5) {
    // DKI4 Lubang Buaya (~70.81) - Beban Terendah / Paling Bersih
    return {
      fillColor: '#38BDF8',
      pinColor: '#0284C7',
      intensityLabel: 'Rendah (Paling Bersih)'
    };
  }
  if (avgMax <= 72.8) {
    // DKI3 Jagakarsa (~72.45) - Beban Menengah-Rendah
    return {
      fillColor: '#0EA5E9',
      pinColor: '#0369A1',
      intensityLabel: 'Menengah-Rendah'
    };
  }
  if (avgMax <= 73.5) {
    // DKI1 Bundaran HI (~73.04) - Beban Menengah
    return {
      fillColor: '#0284C7',
      pinColor: '#1D4ED8',
      intensityLabel: 'Menengah'
    };
  }
  if (avgMax <= 75.0) {
    // DKI2 Kelapa Gading (~73.92) - Beban Menengah-Tinggi
    return {
      fillColor: '#1D4ED8',
      pinColor: '#1E40AF',
      intensityLabel: 'Menengah-Tinggi'
    };
  }
  // DKI5 Kebon Jeruk (~76.56) - Beban Tertinggi / Paling Pekat
  return {
    fillColor: '#1E3A8A',
    pinColor: '#D97706',
    intensityLabel: 'Tinggi (Paling Pekat)'
  };
}


import React from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EXECUTIVE_SUMMARY } from '../../utils/dataParser';
import { getIspuCategory } from '../../utils/colorMapping';
import { MetricCard, ScorecardMetricCardProps } from '../ui/MetricCard';

export const ExecutiveScorecards: React.FC = () => {
  const s = EXECUTIVE_SUMMARY;
  const cityCat = getIspuCategory(s.cityMeanIspu);
  const cleanestCat = getIspuCategory(s.cleanestStation.avgIspu);

  const cards: Array<ScorecardMetricCardProps & { id: string }> = [
    {
      id: 'avg-ispu',
      variant: 'scorecard',
      label: 'ISPU Rata-rata Kota',
      sublabel: `Mean kolom max (${s.totalRows.toLocaleString('id-ID')} baris CSV)`,
      value: s.cityMeanIspu.toFixed(1),
      unit: 'ISPU',
      status: cityCat.label,
      statusBg: 'bg-[#F0F9FF]',
      statusColor: 'text-[#0284C7]',
      statusBorder: 'border-[#BAE6FD]',
      change: `${s.yoyIspuDiffPercent}% YoY (${s.mean2024.toFixed(1)} → ${s.mean2025.toFixed(1)})`,
      changeColor: 'text-[#059669]',
      icon: TrendingDown,
      accentBarColor: cityCat.color
    },
    {
      id: 'good-days',
      variant: 'scorecard',
      label: 'Proporsi Hari Baik',
      sublabel: `${s.goodDaysCount} dari ${s.totalRows.toLocaleString('id-ID')} observasi se-DKI`,
      value: `${s.goodDaysPercent.toFixed(1)}%`,
      unit: 'Hari Baik',
      status: 'BAIK (0-50)',
      statusBg: 'bg-[#ECFDF5]',
      statusColor: 'text-[#059669]',
      statusBorder: 'border-[#A7F3D0]',
      change: `+${s.goodDaysYoyDelta.toFixed(1)}% YoY (${s.goodDays2024Percent.toFixed(1)}% → ${s.goodDays2025Percent.toFixed(1)}%)`,
      changeColor: 'text-[#059669]',
      icon: TrendingUp,
      accentBarColor: '#10B981'
    },
    {
      id: 'critical-pollutant',
      variant: 'scorecard',
      label: 'Polutan Dominan',
      sublabel: 'Modus kolom parameter_pencemar_kritis',
      value: s.dominantPollutant,
      unit: 'Partikulat',
      status: `${s.dominantPollutantPercentLabeled.toFixed(1)}%`,
      statusBg: 'bg-[#FFFBEB]',
      statusColor: 'text-[#B45309]',
      statusBorder: 'border-[#FDE68A]',
      change: `${s.dominantPollutantCount.toLocaleString('id-ID')} dari ${s.dominantPollutantLabeledTotal.toLocaleString('id-ID')} hari berlabel`,
      changeColor: 'text-[#B45309]',
      icon: AlertTriangle,
      accentBarColor: '#F59E0B'
    },
    {
      id: 'cleanest-station',
      variant: 'scorecard',
      label: 'Stasiun Paling Bersih',
      sublabel: 'Rata-rata max terendah antar-stasiun',
      value: s.cleanestStation.avgIspu.toFixed(1),
      unit: 'ISPU',
      status: s.cleanestStation.id,
      statusBg: 'bg-[#F0F9FF]',
      statusColor: 'text-[#0284C7]',
      statusBorder: 'border-[#BAE6FD]',
      change: `${s.cleanestStation.name} • ${s.cleanestStation.city}`,
      changeColor: 'text-[#0284C7]',
      icon: ShieldCheck,
      accentBarColor: cleanestCat.color
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <MetricCard key={c.id} {...c} />
      ))}
    </div>
  );
};

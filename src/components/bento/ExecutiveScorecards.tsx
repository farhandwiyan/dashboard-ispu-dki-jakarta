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
      label: '',
      sublabel: '',
      value: s.cityMeanIspu.toFixed(1),
      unit: '',
      status: '',
      statusBg: 'bg-[#F0F9FF]',
      statusColor: 'text-[#0284C7]',
      statusBorder: 'border-[#BAE6FD]',
      change: `${s.yoyIspuDiffPercent}% (${s.mean2024.toFixed(1)} → ${s.mean2025.toFixed(1)})`,
      changeColor: 'text-[#059669]',
      icon: TrendingDown,
      accentBarColor: cityCat.color
    },
    {
      id: 'good-days',
      variant: 'scorecard',
      label: '',
      sublabel: '',
      value: `${s.goodDaysPercent.toFixed(1)}%`,
      unit: '',
      status: '',
      statusBg: 'bg-[#ECFDF5]',
      statusColor: 'text-[#059669]',
      statusBorder: 'border-[#A7F3D0]',
      change: `+${s.goodDaysYoyDelta.toFixed(1)}% (${s.goodDays2024Percent.toFixed(1)}% → ${s.goodDays2025Percent.toFixed(1)}%)`,
      changeColor: 'text-[#059669]',
      icon: TrendingUp,
      accentBarColor: '#10B981'
    },
    {
      id: 'critical-pollutant',
      variant: 'scorecard',
      label: '',
      sublabel: '',
      value: s.dominantPollutant,
      unit: '',
      status: '',
      statusBg: 'bg-[#FFFBEB]',
      statusColor: 'text-[#B45309]',
      statusBorder: 'border-[#FDE68A]',
      change: `${s.dominantPollutantPercentLabeled.toFixed(1)}% (${s.dominantPollutantCount.toLocaleString('id-ID')} / ${s.dominantPollutantLabeledTotal.toLocaleString('id-ID')})`,
      changeColor: 'text-[#B45309]',
      icon: AlertTriangle,
      accentBarColor: '#F59E0B'
    },
    {
      id: 'cleanest-station',
      variant: 'scorecard',
      label: '',
      sublabel: '',
      value: s.cleanestStation.avgIspu.toFixed(1),
      unit: '',
      status: '',
      statusBg: 'bg-[#F0F9FF]',
      statusColor: 'text-[#0284C7]',
      statusBorder: 'border-[#BAE6FD]',
      change: s.cleanestStation.name,
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

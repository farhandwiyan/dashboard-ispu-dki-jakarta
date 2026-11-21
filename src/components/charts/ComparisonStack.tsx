import React from 'react';
import { YOY_BREAKDOWN } from '../../utils/dataParser';

export const ComparisonStack: React.FC = () => {
  const y2024 = YOY_BREAKDOWN[2024];
  const y2025 = YOY_BREAKDOWN[2025];

  const years = [
    {
      label: '2024',
      stat: y2024,
      highlight: false
    },
    {
      label: '2025',
      stat: y2025,
      highlight: true
    }
  ];

  return (
    <div className="bento-card p-5 flex flex-col justify-center h-full bg-white rounded-[20px] shadow-sm border border-[#CDEAEF]">
      {/* 100% Stacked Bars (2024 vs 2025) */}
      <div className="space-y-6 my-2">
        {years.map(({ label, stat, highlight }) => {
          const pBaik = stat.percentages.BAIK;
          const pSedang = stat.percentages.SEDANG;
          const pTidakSehat = stat.percentages['TIDAK SEHAT'];
          const pSangat = stat.percentages['SANGAT TIDAK SEHAT'];

          return (
            <div key={stat.year}>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-sm font-extrabold text-[#0D3843]">{label}</span>
                <span
                  className={`text-[11px] ${
                    highlight ? 'font-bold text-[#059669]' : 'text-[#64748B]'
                  }`}
                >
                  {pBaik.toFixed(1)}% ({stat.counts.BAIK}) •{' '}
                  {pSedang.toFixed(1)}% ({stat.counts.SEDANG}) •{' '}
                  {pTidakSehat.toFixed(1)}% ({stat.counts['TIDAK SEHAT']})
                  {stat.counts['SANGAT TIDAK SEHAT'] > 0
                    ? ` • ${pSangat.toFixed(2)}% (${
                        stat.counts['SANGAT TIDAK SEHAT']
                      })`
                    : ''}
                </span>
              </div>

              <div className="h-6 w-full flex rounded-full overflow-hidden bg-[#EAF5F7] p-0.5 border border-[#D7EFF2] shadow-inner">
                <div
                  style={{ width: `${pBaik}%` }}
                  className="h-full bg-[#10B981] rounded-l-full transition-all"
                />
                <div
                  style={{ width: `${pSedang}%` }}
                  className="h-full bg-[#0284C7] transition-all"
                />
                <div
                  style={{ width: `${pTidakSehat}%` }}
                  className={`h-full bg-[#F59E0B] transition-all ${
                    pSangat === 0 ? 'rounded-r-full' : ''
                  }`}
                />
                {pSangat > 0 && (
                  <div
                    style={{ width: `${Math.max(0.8, pSangat)}%` }}
                    className="h-full bg-[#EF4444] rounded-r-full transition-all"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


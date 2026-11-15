import React from 'react';
import { Layers, TrendingUp } from 'lucide-react';
import { YOY_BREAKDOWN } from '../../utils/dataParser';

export const ComparisonStack: React.FC = () => {
  const y2024 = YOY_BREAKDOWN[2024];
  const y2025 = YOY_BREAKDOWN[2025];

  const goodDelta = (
    (y2025?.percentages.BAIK ?? 0) - (y2024?.percentages.BAIK ?? 0)
  ).toFixed(1);

  const years = [
    {
      label: `Tahun 2024 (12 Bulan • ${y2024.totalDays.toLocaleString('id-ID')} Observasi)`,
      stat: y2024,
      highlight: false
    },
    {
      label: `Tahun 2025 (11 Bulan • ${y2025.totalDays.toLocaleString('id-ID')} Observasi)`,
      stat: y2025,
      highlight: true
    }
  ];

  return (
    <div className="bento-card p-5 flex flex-col justify-between h-full bg-white rounded-[20px] shadow-sm border border-[#CDEAEF]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D3843]">
                Evaluasi Mutu Udara YoY (2024 vs 2025)
              </h3>
              <p className="text-xs text-[#4E7682] mt-0.5">
                100% Stacked Bar Chart • Proporsi Kolom `kategori` per `tahun`
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
            +{goodDelta}% Hari Baik
          </span>
        </div>

        {/* 100% Stacked Bars (2024 vs 2025) */}
        <div className="space-y-4 my-2">
          {years.map(({ label, stat, highlight }) => {
            const pBaik = stat.percentages.BAIK;
            const pSedang = stat.percentages.SEDANG;
            const pTidakSehat = stat.percentages['TIDAK SEHAT'];
            const pSangat = stat.percentages['SANGAT TIDAK SEHAT'];

            return (
              <div key={stat.year}>
                <div className="flex flex-wrap items-center justify-between text-xs font-bold mb-1.5 gap-1">
                  <span className="text-[#0D3843]">{label}</span>
                  <span
                    className={`text-[11px] ${
                      highlight ? 'font-bold text-[#059669]' : 'text-[#64748B]'
                    }`}
                  >
                    Baik: {pBaik.toFixed(1)}% ({stat.counts.BAIK}) • Sedang:{' '}
                    {pSedang.toFixed(1)}% ({stat.counts.SEDANG}) • Tidak Sehat:{' '}
                    {pTidakSehat.toFixed(1)}% ({stat.counts['TIDAK SEHAT']})
                    {stat.counts['SANGAT TIDAK SEHAT'] > 0
                      ? ` • Sangat Tdk Sehat: ${pSangat.toFixed(2)}% (${
                          stat.counts['SANGAT TIDAK SEHAT']
                        })`
                      : ''}
                  </span>
                </div>

                <div className="h-5 w-full flex rounded-full overflow-hidden bg-[#EAF5F7] p-0.5 border border-[#D7EFF2] shadow-inner">
                  <div
                    style={{ width: `${pBaik}%` }}
                    className="h-full bg-[#10B981] rounded-l-full transition-all"
                    title={`BAIK: ${pBaik.toFixed(2)}% (${stat.counts.BAIK} hari)`}
                  />
                  <div
                    style={{ width: `${pSedang}%` }}
                    className="h-full bg-[#0284C7] transition-all"
                    title={`SEDANG: ${pSedang.toFixed(2)}% (${stat.counts.SEDANG} hari)`}
                  />
                  <div
                    style={{ width: `${pTidakSehat}%` }}
                    className={`h-full bg-[#F59E0B] transition-all ${
                      pSangat === 0 ? 'rounded-r-full' : ''
                    }`}
                    title={`TIDAK SEHAT: ${pTidakSehat.toFixed(2)}% (${
                      stat.counts['TIDAK SEHAT']
                    } hari)`}
                  />
                  {pSangat > 0 && (
                    <div
                      style={{ width: `${Math.max(0.8, pSangat)}%` }}
                      className="h-full bg-[#EF4444] rounded-r-full transition-all"
                      title={`SANGAT TIDAK SEHAT: ${pSangat.toFixed(2)}% (${
                        stat.counts['SANGAT TIDAK SEHAT']
                      } hari)`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend (Permen LHK 14/2020 & colorMapping.ts) */}
        <div className="flex flex-wrap items-center justify-center gap-4 my-2.5 text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Baik (0–50)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
            <span>Sedang (51–100)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>Tidak Sehat (101–200)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span>Sangat Tidak Sehat (&gt;200)</span>
          </span>
        </div>
      </div>

      {/* Insight Box */}
      <div className="mt-2 p-2.5 rounded-xl bg-[#F8FDFF] border border-[#D5F0F5] flex items-start gap-2 text-xs">
        <TrendingUp className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-[#4E7682] leading-relaxed">
          <strong className="text-[#0D3843]">Evaluasi Data CSV (2024 vs 2025):</strong>{' '}
          Proporsi hari <strong>BAIK</strong> meningkat signifikan dari{' '}
          <strong>{y2024.percentages.BAIK.toFixed(1)}%</strong> (168 hari) menjadi{' '}
          <strong>{y2025.percentages.BAIK.toFixed(1)}%</strong> (276 hari,{' '}
          <strong>+{goodDelta}% YoY</strong>), diiringi penurunan rata-rata ISPU tahunan dari{' '}
          <strong>{y2024.meanIspu.toFixed(1)}</strong> menjadi{' '}
          <strong>{y2025.meanIspu.toFixed(1)} ISPU</strong> (0 kejadian Sangat Tidak Sehat di 2025).
        </p>
      </div>
    </div>
  );
};


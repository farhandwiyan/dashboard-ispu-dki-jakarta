import React from 'react';
import { BarChart3 } from 'lucide-react';
import { STATIONS, StationData } from '../../utils/dataParser';
import { getChoroplethColor } from '../../utils/colorMapping';

export interface RankingBarProps {
  onSelectStation?: (st: StationData) => void;
}

export const RankingBar: React.FC<RankingBarProps> = ({ onSelectStation }) => {
  // Sort stations from cleanest (lowest avgIspu) to highest avgIspu
  const sortedStations = [...STATIONS].sort((a, b) => a.avgIspu - b.avgIspu);
  const axisMax = 100; // Sumbu X mutlak 0 s.d. 100 ISPU

  const rangeDiff = (
    sortedStations[sortedStations.length - 1].avgIspu - sortedStations[0].avgIspu
  ).toFixed(1);

  return (
    <div className="bento-card p-5 flex flex-col justify-between h-full bg-white rounded-[20px] shadow-sm border border-[#CDEAEF]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D3843]">
                Peringkat 5 Stasiun SPKU (Mean `max`)
              </h3>
              <p className="text-xs text-[#4E7682] mt-0.5">
                Horizontal Bar Chart • Sumbu X Mutlak Berawal dari 0 s.d. 100 ISPU
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#0284C7] bg-[#F0F9FF] px-2.5 py-1 rounded-full border border-[#BAE6FD]">
            Data CSV 2024–2025
          </span>
        </div>

        {/* Horizontal Bars */}
        <div className="space-y-3 my-2">
          {sortedStations.map((st, idx) => {
            const rank = idx + 1;
            const choro = getChoroplethColor(st.avgIspu);
            const fillPercent = Math.min(100, (st.avgIspu / axisMax) * 100);
            const rankBadge =
              rank === 1
                ? 'Paling Bersih'
                : rank === sortedStations.length
                ? 'Beban Tertinggi'
                : `Puncak: ${st.maxIspu} ISPU`;

            return (
              <div
                key={st.id}
                onClick={() => onSelectStation && onSelectStation(st)}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <div className="flex items-center gap-1.5 text-[#0D3843]">
                    <span className="w-4 text-[#88A2AA] font-extrabold">
                      {rank}.
                    </span>
                    <span className="group-hover:text-[#0284C7] transition-colors">
                      {st.name}
                    </span>
                    <span className="text-[11px] font-medium text-[#64748B]">
                      ({st.city})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-semibold text-[#64748B]">
                      {rankBadge}
                    </span>
                    <span className="font-extrabold text-[#0D3843]">
                      {st.avgIspu.toFixed(1)} ISPU
                    </span>
                  </div>
                </div>

                {/* Progress Track starting strictly at 0 */}
                <div className="w-full h-3.5 bg-[#EAF5F7] rounded-none overflow-hidden border border-[#D7EFF2] relative">
                  <div
                    className="h-full rounded-none transition-all duration-500 group-hover:brightness-95"
                    style={{
                      width: `${fillPercent.toFixed(1)}%`,
                      backgroundColor: choro.fillColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Explicit X-Axis Scale (0 - 25 - 50 - 75 - 100) */}
        <div className="flex items-center justify-between text-[10px] font-bold text-[#94A3B8] pt-1 px-0.5">
          <span>0 ISPU</span>
          <span>25</span>
          <span className="text-[#10B981]">50 (Batas Baik)</span>
          <span>75</span>
          <span className="text-[#0284C7]">100 (Batas Sedang)</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2 border-t border-[#F0FAFB] flex items-center justify-between text-xs text-[#64748B]">
        <span>Skala penuh 0–100 ISPU tanpa pemotongan sumbu</span>
        <span className="font-bold text-[#0284C7]">
          Rentang Antar-Stasiun: {rangeDiff} Poin ({sortedStations[0].avgIspu.toFixed(1)} –{' '}
          {sortedStations[sortedStations.length - 1].avgIspu.toFixed(1)})
        </span>
      </div>
    </div>
  );
};


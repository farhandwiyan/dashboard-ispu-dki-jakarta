import React from 'react';
import { STATIONS, StationData } from '../../utils/dataParser';
import { getChoroplethColor } from '../../utils/colorMapping';

export interface RankingBarProps {
  onSelectStation?: (st: StationData) => void;
}

export const RankingBar: React.FC<RankingBarProps> = ({ onSelectStation }) => {
  // Sort stations from cleanest (lowest avgIspu) to highest avgIspu
  const sortedStations = [...STATIONS].sort((a, b) => a.avgIspu - b.avgIspu);
  const axisMax = 100;

  return (
    <div className="bento-card p-5 flex flex-col justify-center h-full bg-white rounded-[20px] shadow-sm border border-[#CDEAEF]">
      {/* Horizontal Bars */}
      <div className="space-y-3.5 my-1">
        {sortedStations.map((st, idx) => {
          const rank = idx + 1;
          const choro = getChoroplethColor(st.avgIspu);
          const fillPercent = Math.min(100, (st.avgIspu / axisMax) * 100);

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
                </div>
                <span className="font-extrabold text-[#0D3843]">
                  {st.avgIspu.toFixed(1)}
                </span>
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

      {/* X-Axis Scale Numbers Only (0 - 25 - 50 - 75 - 100) */}
      <div className="flex items-center justify-between text-[10px] font-bold text-[#94A3B8] pt-3 px-0.5">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
};


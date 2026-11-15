import React from 'react';
import { SUB_INDICES, SubIndexInfo } from '../../utils/dataParser';
import { MetricCard } from '../ui/MetricCard';
import { Layers, AlertCircle, Info } from 'lucide-react';

interface HexaMetricGridPanelProps {
  onSelectSubIndex?: (info: SubIndexInfo) => void;
}

export const HexaMetricGridPanel: React.FC<HexaMetricGridPanelProps> = ({
  onSelectSubIndex
}) => {
  return (
    <div className="bento-card p-5 bg-white rounded-[20px] shadow-sm border border-[#CDEAEF] flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D3843]">
                Rincian 6 Parameter Pencemar Ambien (`data_bersih.csv`)
              </h3>
              <p className="text-xs text-[#4E7682] mt-0.5">
                Sub-Indices Hexa-Metric Grid • Rata-rata (`mean`) `pm10`, `pm25`, `so2`, `co`, `o3`, `no2` vs Baku Mutu Statis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#0284C7] bg-[#F0F9FF] px-2.5 py-1 rounded-full border border-[#BAE6FD]">
              6 Kartu `MetricCard` Terpisah
            </span>
          </div>
        </div>

        {/* Hexa-Metric Grid: 6 Separate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-2">
          {SUB_INDICES.map((item) => (
            <MetricCard
              key={item.code}
              variant="hexa"
              code={item.code}
              name={item.name}
              meanValue={item.avgValue}
              unit={item.unit}
              standardValue={item.standardValue}
              standardLabel={item.standard}
              minValue={item.minValue}
              maxValue={item.maxValue}
              ratioPercent={item.ratioPercent}
              isExceeded={item.isExceeded}
              statusLabel={item.statusLabel}
              sourceDesc={item.description}
              onClick={() => onSelectSubIndex && onSelectSubIndex(item)}
            />
          ))}
        </div>
      </div>

      {/* Footer Callout */}
      <div className="mt-4 pt-3 border-t border-[#F0FAFB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#64748B]">
          <Info className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
          <span>Dasar Standar: Lampiran VII PP No. 22/2021 & Permen LHK No. 14/2020</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#B54708] font-semibold bg-[#FFF8E6] px-2.5 py-1 rounded-lg border border-[#FEDF89]/60">
          <AlertCircle className="w-3.5 h-3.5 text-[#D92D20] flex-shrink-0" />
          <span>PM2.5 (mean 71.4) adalah satu-satunya parameter yang melebihi ambang baku mutu (+9.8%)</span>
        </div>
      </div>
    </div>
  );
};

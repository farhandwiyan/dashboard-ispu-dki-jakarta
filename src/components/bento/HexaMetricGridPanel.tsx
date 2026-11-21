import React from 'react';
import { SUB_INDICES, SubIndexInfo } from '../../utils/dataParser';
import { MetricCard } from '../ui/MetricCard';

interface HexaMetricGridPanelProps {
  onSelectSubIndex?: (info: SubIndexInfo) => void;
}

export const HexaMetricGridPanel: React.FC<HexaMetricGridPanelProps> = ({
  onSelectSubIndex
}) => {
  return (
    <div className="bento-card p-5 bg-white rounded-[20px] shadow-sm border border-[#CDEAEF]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
};

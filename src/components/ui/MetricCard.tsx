import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ScorecardMetricCardProps {
  variant: 'scorecard';
  label: string;
  sublabel: string;
  value: string;
  unit: string;
  status: string;
  statusBg: string;
  statusColor: string;
  statusBorder: string;
  change: string;
  changeColor: string;
  icon: LucideIcon;
  accentBarColor?: string;
}

export interface HexaMetricCardProps {
  variant?: 'hexa';
  code: string;
  name: string;
  meanValue: number;
  unit: string;
  standardValue: number;
  standardLabel: string;
  minValue: number;
  maxValue: number;
  ratioPercent: number;
  isExceeded: boolean;
  statusLabel: string;
  sourceDesc: string;
  onClick?: () => void;
}

export type MetricCardProps = ScorecardMetricCardProps | HexaMetricCardProps;

export const MetricCard: React.FC<MetricCardProps> = (props) => {
  if (props.variant === 'scorecard') {
    const IconComponent = props.icon;
    return (
      <div className="bento-card p-4 sm:p-5 flex flex-col justify-between h-full bg-white rounded-[20px] shadow-sm border border-[#CDEAEF] hover:shadow-md transition-all hover:-translate-y-0.5 relative overflow-hidden">
        {props.accentBarColor && (
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: props.accentBarColor }}
          />
        )}

        {/* Big Metric Value */}
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#0D3843] tracking-tight">
            {props.value}
          </span>
          {props.unit && (
            <span className="text-xs font-bold text-[#64748B]">
              {props.unit}
            </span>
          )}
        </div>

        {/* Bottom row: Short number/name */}
        <div className="pt-2 border-t border-[#F0FAFB] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <IconComponent className={`w-3.5 h-3.5 ${props.changeColor}`} />
            <span className={`text-[11.5px] font-bold ${props.changeColor}`}>
              {props.change}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const {
    code,
    meanValue,
    standardValue,
    minValue,
    maxValue,
    ratioPercent,
    isExceeded,
    onClick
  } = props;

  const barPercent = Math.min(100, Math.max(4, ratioPercent));

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-[18px] border transition-all duration-200 flex flex-col justify-between group ${
        isExceeded
          ? 'bg-[#FFFBF5] border-[#FEDF89] hover:border-[#F59E0B] shadow-[0_2px_8px_rgba(245,158,11,0.08)]'
          : 'bg-[#F8FCFD] border-[#D7EFF2] hover:border-[#0284C7] hover:bg-white shadow-[0_1px_3px_rgba(13,56,67,0.04)]'
      }`}
    >
      <div>
        {/* Top Row: Pollutant Code */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-extrabold text-base text-[#0D3843] tracking-tight">
            {code}
          </span>
          <span className="text-xs font-bold text-[#88A2AA]">
            {minValue.toFixed(0)} – {maxValue.toFixed(0)}
          </span>
        </div>

        {/* Big Mean Metric Value */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0D3843] tracking-tight">
            {meanValue.toFixed(1)}
          </span>
        </div>

        {/* Comparison Gauge Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-[#EAF5F7] rounded-none overflow-hidden border border-[#D7EFF2]">
            <div
              className={`h-full rounded-none transition-all duration-500 ${
                isExceeded ? 'bg-[#F59E0B]' : 'bg-[#0284C7]'
              }`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64778A] font-semibold">
              / {standardValue}
            </span>
            <span
              className={`font-bold ${
                isExceeded ? 'text-[#B42318]' : 'text-[#0A9668]'
              }`}
            >
              {ratioPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

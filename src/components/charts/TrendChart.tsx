import React, { useState } from 'react';
import { Activity, AlertTriangle, Info } from 'lucide-react';
import {
  MONTHLY_TRENDS,
  DAILY_PEAK_SERIES,
  TOP_ANOMALY_RECORDS,
  DailyPeakPoint
} from '../../utils/dataParser';
import { getIspuCategory } from '../../utils/colorMapping';

export const TrendChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spline' | 'anomaly'>('spline');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<DailyPeakPoint>(
    TOP_ANOMALY_RECORDS[0]
  );

  // SVG Geometry (shared dimensions)
  const svgWidth = 520;
  const svgHeight = 215;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 26;
  const padBottom = 32;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // --- TAB A: Monthly Mean Spline Geometry ---
  const minMeanVal = 40;
  const maxMeanVal = 105;
  const getMonthX = (i: number) =>
    padLeft + (i / Math.max(1, MONTHLY_TRENDS.length - 1)) * chartW;
  const getMonthY = (val: number) =>
    padTop + (1 - (val - minMeanVal) / (maxMeanVal - minMeanVal)) * chartH;

  const yMean50 = getMonthY(50);
  const yMean100 = getMonthY(100);

  const monthPoints = MONTHLY_TRENDS.map((d, i) => ({
    x: getMonthX(i),
    y: getMonthY(d.avgIspu)
  }));

  let splinePath = monthPoints.length
    ? `M ${monthPoints[0].x} ${monthPoints[0].y}`
    : '';
  for (let i = 0; i < monthPoints.length - 1; i++) {
    const p0 = monthPoints[i === 0 ? 0 : i - 1];
    const p1 = monthPoints[i];
    const p2 = monthPoints[i + 1];
    const p3 = monthPoints[i + 2 < monthPoints.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    splinePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const splineAreaPath = monthPoints.length
    ? `${splinePath} L ${monthPoints[monthPoints.length - 1].x} ${
        padTop + chartH
      } L ${monthPoints[0].x} ${padTop + chartH} Z`
    : '';

  // Find actual peak & lowest monthly averages from CSV
  const highestMonth = [...MONTHLY_TRENDS].sort((a, b) => b.avgIspu - a.avgIspu)[0];
  const lowestMonth = [...MONTHLY_TRENDS].sort((a, b) => a.avgIspu - b.avgIspu)[0];

  // --- TAB B: Daily Absolute Anomaly Line Chart Geometry ---
  const minDailyVal = 20;
  const maxDailyVal = 215;
  const getDailyX = (i: number) =>
    padLeft + (i / Math.max(1, DAILY_PEAK_SERIES.length - 1)) * chartW;
  const getDailyY = (val: number) =>
    padTop + (1 - (val - minDailyVal) / (maxDailyVal - minDailyVal)) * chartH;

  const yDaily100 = getDailyY(100);
  const yDaily200 = getDailyY(200);

  const dailyPolylinePoints = DAILY_PEAK_SERIES.map(
    (d, i) => `${getDailyX(i).toFixed(1)},${getDailyY(d.maxIspu).toFixed(1)}`
  ).join(' ');

  const dailyAreaPath = DAILY_PEAK_SERIES.length
    ? `M ${getDailyX(0).toFixed(1)} ${padTop + chartH} L ${DAILY_PEAK_SERIES.map(
        (d, i) => `${getDailyX(i).toFixed(1)} ${getDailyY(d.maxIspu).toFixed(1)}`
      ).join(' L ')} L ${getDailyX(DAILY_PEAK_SERIES.length - 1).toFixed(1)} ${
        padTop + chartH
      } Z`
    : '';

  // Map top anomaly dates to their index in DAILY_PEAK_SERIES for marker placement
  const topMarkers = TOP_ANOMALY_RECORDS.slice(0, 6).map((rec) => {
    const idx = DAILY_PEAK_SERIES.findIndex((d) => d.dateStr === rec.dateStr);
    return {
      rec,
      idx,
      x: getDailyX(Math.max(0, idx)),
      y: getDailyY(rec.maxIspu)
    };
  });

  return (
    <div className="bento-card p-5 flex flex-col justify-between h-full bg-white rounded-[20px] shadow-sm border border-[#CDEAEF]">
      {/* Header Bar with Toggle Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D3843]">
                {activeTab === 'spline'
                  ? 'Tren Siklus Rata-Rata ISPU Bulanan'
                  : 'Puncak Absolut Harian (Anomali)'}
              </h3>
              <p className="text-xs text-[#4E7682] mt-0.5">
                {activeTab === 'spline'
                  ? `23 Periode Bulanan (${MONTHLY_TRENDS[0]?.label} – ${
                      MONTHLY_TRENDS[MONTHLY_TRENDS.length - 1]?.label
                    })`
                  : `${DAILY_PEAK_SERIES.length} Hari Pengamatan • Nilai Mentah Tertinggi (max)`}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle Pill */}
        <div className="inline-flex bg-[#F0FAFB] p-1 rounded-full border border-[#BCE8ED] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('spline')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'spline'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'text-[#4E7682] hover:text-[#0D3843]'
            }`}
          >
            Rata-Rata Bulanan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('anomaly')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'anomaly'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'text-[#4E7682] hover:text-[#0D3843]'
            }`}
          >
            Puncak Absolut
          </button>
        </div>
      </div>

      {/* PILIHAN A: Interactive Spline Line Chart (Rata-Rata Bulanan) */}
      {activeTab === 'spline' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="relative w-full overflow-hidden bg-[#F8FDFF] rounded-2xl p-2 border border-[#D5F0F5]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[225px]"
            >
              <defs>
                <linearGradient id="bentoSplineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid Labels */}
              {[50, 75, 100].map((v) => (
                <text
                  key={v}
                  x={padLeft - 6}
                  y={getMonthY(v) + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fontWeight="600"
                  fill="#94A3B8"
                >
                  {v}
                </text>
              ))}

              {/* Threshold 50: Batas Baik (Hijau) */}
              <line
                x1={padLeft}
                y1={yMean50}
                x2={svgWidth - padRight}
                y2={yMean50}
                stroke="#10B981"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - padRight}
                y={yMean50 - 4}
                textAnchor="end"
                fontSize="8.5"
                fontWeight="700"
                fill="#10B981"
              >
                Batas Baik (50)
              </text>

              {/* Threshold 100: Batas Sedang (Biru -> Tidak Sehat) */}
              <line
                x1={padLeft}
                y1={yMean100}
                x2={svgWidth - padRight}
                y2={yMean100}
                stroke="#F59E0B"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - padRight}
                y={yMean100 - 4}
                textAnchor="end"
                fontSize="8.5"
                fontWeight="700"
                fill="#D97706"
              >
                Batas Sedang (100)
              </text>

              {/* Area Under Curve */}
              <path d={splineAreaPath} fill="url(#bentoSplineGrad)" />

              {/* Spline Stroke Line */}
              <path
                d={splinePath}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {MONTHLY_TRENDS.map((d, i) => {
                const pt = monthPoints[i];
                const isHovered = hoveredMonthIdx === i;
                const isHighest = d.period === highestMonth?.period;
                const isLowest = d.period === lowestMonth?.period;
                const dotColor =
                  d.avgIspu <= 50
                    ? '#10B981'
                    : isHighest
                    ? '#F59E0B'
                    : '#0284C7';

                return (
                  <g key={d.period}>
                    {(i === 0 ||
                      i === 3 ||
                      i === 6 ||
                      i === 9 ||
                      i === 12 ||
                      i === 15 ||
                      i === 18 ||
                      i === 22) && (
                      <text
                        x={pt.x}
                        y={svgHeight - 10}
                        fontSize="8.5"
                        fill="#64748B"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {d.monthShort}{' '}
                        {d.year === 2025 && (i === 12 || i === 22) ? `'25` : `'24`}
                      </text>
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : isHighest || isLowest ? 4.5 : 3.2}
                      fill={dotColor}
                      stroke="#FFFFFF"
                      strokeWidth={1.8}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredMonthIdx(i)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredMonthIdx !== null && MONTHLY_TRENDS[hoveredMonthIdx] && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0D3843] text-white px-3 py-1.5 rounded-xl shadow-lg border border-white/20 text-xs flex items-center gap-2 pointer-events-none z-10">
                <span className="font-bold">
                  {MONTHLY_TRENDS[hoveredMonthIdx].label}:
                </span>
                <span className="text-[#38BDF8] font-extrabold">
                  Mean {MONTHLY_TRENDS[hoveredMonthIdx].avgIspu.toFixed(1)} ISPU
                </span>
                <span className="text-[#CBD5E1] text-[11px]">
                  (Puncak: {MONTHLY_TRENDS[hoveredMonthIdx].maxIspu} di{' '}
                  {MONTHLY_TRENDS[hoveredMonthIdx].peakStation.split(' ')[0]})
                </span>
              </div>
            )}
          </div>

          {/* Bottom Footnote Summary */}
          <div className="mt-3 pt-2 border-t border-[#F0FAFB] flex items-center justify-between text-[11px] text-[#64748B] gap-2 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
              <span>
                <strong className="text-[#0D3843]">Rata-Rata Tertinggi:</strong>{' '}
                {highestMonth?.label} ({highestMonth?.avgIspu.toFixed(1)} ISPU)
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] flex-shrink-0" />
              <span>
                <strong className="text-[#0D3843]">Rata-Rata Terendah:</strong>{' '}
                {lowestMonth?.label} ({lowestMonth?.avgIspu.toFixed(1)} ISPU • Kategori Baik)
              </span>
            </span>
          </div>
        </div>
      )}

      {/* PILIHAN B: Absolute Anomaly Line Chart (Puncak Absolut Harian) */}
      {activeTab === 'anomaly' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="relative w-full overflow-hidden bg-[#F8FDFF] rounded-2xl p-2 border border-[#D5F0F5]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[190px]"
            >
              <defs>
                <linearGradient id="anomalyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid Labels */}
              {[50, 100, 150, 200].map((v) => (
                <text
                  key={v}
                  x={padLeft - 6}
                  y={getDailyY(v) + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fontWeight="600"
                  fill="#94A3B8"
                >
                  {v}
                </text>
              ))}

              {/* Threshold 100: Batas Tidak Sehat */}
              <line
                x1={padLeft}
                y1={yDaily100}
                x2={svgWidth - padRight}
                y2={yDaily100}
                stroke="#F59E0B"
                strokeWidth="1.1"
                strokeDasharray="3 3"
              />
              <text
                x={svgWidth - padRight}
                y={yDaily100 - 3}
                textAnchor="end"
                fontSize="8"
                fontWeight="700"
                fill="#D97706"
              >
                Tidak Sehat (100)
              </text>

              {/* Threshold 200: Batas Sangat Tidak Sehat */}
              <line
                x1={padLeft}
                y1={yDaily200}
                x2={svgWidth - padRight}
                y2={yDaily200}
                stroke="#EF4444"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <text
                x={svgWidth - padRight}
                y={yDaily200 + 10}
                textAnchor="end"
                fontSize="8"
                fontWeight="700"
                fill="#EF4444"
              >
                Sangat Tidak Sehat (200)
              </text>

              {/* Daily Raw Max Area & Line */}
              <path d={dailyAreaPath} fill="url(#anomalyAreaGrad)" />
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.25"
                points={dailyPolylinePoints}
              />

              {/* X-Axis Timeline Labels */}
              {[
                { idx: 0, label: "Jan '24" },
                { idx: 180, label: "Jul '24" },
                { idx: 365, label: "Jan '25" },
                { idx: 545, label: "Jul '25" },
                { idx: DAILY_PEAK_SERIES.length - 1, label: "Nov '25" }
              ].map((tick) => (
                <text
                  key={tick.label}
                  x={getDailyX(Math.min(DAILY_PEAK_SERIES.length - 1, tick.idx))}
                  y={svgHeight - 8}
                  fontSize="8.5"
                  fill="#64748B"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {tick.label}
                </text>
              ))}

              {/* Interactive Highlight Dots on Top Extreme Anomalies */}
              {topMarkers.map(({ rec, x, y }) => {
                const isSelected = selectedAnomaly?.dateStr === rec.dateStr;
                const cat = getIspuCategory(rec.maxIspu);
                return (
                  <g
                    key={rec.dateStr}
                    className="cursor-pointer"
                    onMouseEnter={() => setSelectedAnomaly(rec)}
                    onClick={() => setSelectedAnomaly(rec)}
                  >
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={8}
                        fill={cat.color}
                        fillOpacity={0.25}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 5 : 3.8}
                      fill={cat.color}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Active Anomaly Callout Bar */}
            {selectedAnomaly && (
              <div className="mt-1 px-3 py-1.5 rounded-xl bg-[#0D3843] text-white text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                  <span className="font-bold">{selectedAnomaly.displayDate}</span>
                  <span className="text-[#94A3B8]">•</span>
                  <span className="text-[#38BDF8] font-semibold">
                    {selectedAnomaly.station}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#FDE68A]">
                    Max: {selectedAnomaly.maxIspu} ISPU ({selectedAnomaly.pollutant})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white">
                    {selectedAnomaly.category}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Top 4 Anomaly Chips below Line Chart */}
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {TOP_ANOMALY_RECORDS.slice(0, 4).map((rec) => {
              const isSelected = selectedAnomaly?.dateStr === rec.dateStr;
              return (
                <button
                  key={rec.dateStr}
                  type="button"
                  onClick={() => setSelectedAnomaly(rec)}
                  className={`p-1.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#FFFBEB] border-[#F59E0B] shadow-2xs'
                      : 'bg-[#F8FDFF] border-[#D5F0F5] hover:border-[#0284C7]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#0D3843]">
                    <span>{rec.displayDate}</span>
                    <span
                      className={
                        rec.maxIspu > 200 ? 'text-[#EF4444]' : 'text-[#D97706]'
                      }
                    >
                      {rec.maxIspu}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">
                    {rec.station} • {rec.pollutant}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-1.5 border-t border-[#F0FAFB] text-[11px] text-[#64748B] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
            <span>
              Rekor tertinggi CSV: <strong>14 Feb 2024 (202 ISPU - Sangat Tidak Sehat)</strong> di DKI3 Jagakarsa & <strong>29 Agu 2024 (187 ISPU)</strong> di DKI4.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};


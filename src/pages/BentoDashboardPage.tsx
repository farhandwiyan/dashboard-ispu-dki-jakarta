import React, { useState } from 'react';
import { ExecutiveScorecards } from '../components/bento/ExecutiveScorecards';
import { TemporalTrendPanel } from '../components/bento/TemporalTrendPanel';
import { SpatialMapPanel } from '../components/bento/SpatialMapPanel';
import { RankingBarPanel } from '../components/bento/RankingBarPanel';
import { YoYStackedBarPanel } from '../components/bento/YoYStackedBarPanel';
import { HexaMetricGridPanel } from '../components/bento/HexaMetricGridPanel';
import { SearchBarWidget } from '../components/bento/SearchBarWidget';
import { LayoutGrid } from '../components/ui/LayoutGrid';
import { StationData, EXECUTIVE_SUMMARY } from '../utils/dataParser';
import { getIspuCategory } from '../utils/colorMapping';
import { Wind, X } from 'lucide-react';

export const BentoDashboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);

  const avgCat = selectedStation ? getIspuCategory(selectedStation.avgIspu) : null;
  const maxCat = selectedStation ? getIspuCategory(selectedStation.maxIspu) : null;

  return (
    <LayoutGrid
      header={
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/75 backdrop-blur-md rounded-[24px] p-4 sm:p-5 border border-white/70 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Wind className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-[#0D3843] tracking-tight">
                  Dashboard ISPU DKI Jakarta (2024 – 2025)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  {EXECUTIVE_SUMMARY.totalRows.toLocaleString('id-ID')} Baris `data_bersih.csv`
                </span>
              </div>
              <p className="text-xs text-[#4E7682] mt-0.5">
                Arsitektur 3 Zona Hierarki Visual (Permen LHK 14/2020 & PP 22/2021) • 23 Periode Data Kontinu
              </p>
            </div>
          </div>

          {/* Header Right: Search Bar */}
          <div className="w-full md:w-80 flex-shrink-0">
            <SearchBarWidget
              placeholder="Cari stasiun, wilayah, atau kecamatan..."
              onSearch={(q) => setSearchQuery(q)}
            />
          </div>
        </header>
      }
      zone1={<ExecutiveScorecards />}
      zone2Left={<TemporalTrendPanel />}
      zone2Right={
        <SpatialMapPanel
          searchQuery={searchQuery}
          onSelectStation={(s) => setSelectedStation(s)}
        />
      }
      zone3Left={
        <RankingBarPanel onSelectStation={(s) => setSelectedStation(s)} />
      }
      zone3Right={<YoYStackedBarPanel />}
      zone3Bottom={<HexaMetricGridPanel />}
      footer={
        <footer className="bg-white/75 backdrop-blur-md rounded-[20px] px-4 sm:px-5 py-3.5 border border-white/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#4E7682]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-center sm:text-left">
            <span className="font-semibold text-[#0D3843]">Sumber Data:</span>
            <span>Dinas Lingkungan Hidup DKI Jakarta</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="px-2 py-0.5 rounded-md bg-[#F0F9FF] text-[#0284C7] font-semibold border border-[#BAE6FD]">
              data_bersih.csv ({EXECUTIVE_SUMMARY.totalRows.toLocaleString('id-ID')} observasi • 5 SPKU)
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-semibold flex-shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]" />
            <span>42 Poligon Kecamatan Terhubung (jakarta_kecamatan.geojson)</span>
          </div>
        </footer>
      }
      modal={
        selectedStation && avgCat && maxCat ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D3843]/40 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-[#CDEAEF] relative animate-in fade-in zoom-in duration-200">
              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-[#88A2AA] hover:text-[#0D3843] hover:bg-[#F0FAFB] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] mb-3">
                {selectedStation.id} • {selectedStation.city} ({selectedStation.observationCount} Hari)
              </span>
              <h3 className="text-lg font-bold text-[#0D3843] mb-1">
                {selectedStation.name}
              </h3>
              <p className="text-xs text-[#4E7682] mb-4">
                {selectedStation.address}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5 text-center">
                <div className="p-3 rounded-2xl bg-[#F8FDFF] border border-[#BAE6FD]">
                  <div className="text-[11px] text-[#64748B]">Rata-rata ISPU (`max`)</div>
                  <div className="text-2xl font-bold text-[#0D3843] mt-0.5">
                    {selectedStation.avgIspu.toFixed(1)}
                  </div>
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold text-white rounded-full"
                    style={{ backgroundColor: avgCat.color }}
                  >
                    {avgCat.label}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
                  <div className="text-[11px] text-[#64748B]">Puncak Absolut (`max`)</div>
                  <div
                    className="text-2xl font-bold mt-0.5"
                    style={{ color: maxCat.color }}
                  >
                    {selectedStation.maxIspu}
                  </div>
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold text-white rounded-full"
                    style={{ backgroundColor: maxCat.color }}
                  >
                    {maxCat.label}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs mb-5">
                <div className="flex justify-between py-1.5 border-b border-[#F0FAFB]">
                  <span className="text-[#64748B]">Polutan Kritis Dominan:</span>
                  <span className="font-bold text-[#0D3843]">
                    {selectedStation.criticalPollutant} ({selectedStation.criticalRatioPercent}%)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0FAFB]">
                  <span className="text-[#64748B]">Mean PM2.5 / PM10:</span>
                  <span className="font-bold text-[#0D3843]">
                    {selectedStation.pm25} / {selectedStation.pm10} ISPU
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0FAFB]">
                  <span className="text-[#64748B]">Mean SO2 / CO / O3 / NO2:</span>
                  <span className="font-bold text-[#0D3843]">
                    {selectedStation.so2} / {selectedStation.co} / {selectedStation.o3} / {selectedStation.no2}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0FAFB]">
                  <span className="text-[#64748B]">Tipologi Wilayah:</span>
                  <span className="font-semibold text-[#0D3843]">
                    {selectedStation.typology}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="w-full py-2.5 rounded-full bg-[#0284C7] text-white font-semibold text-xs hover:bg-[#0369A1] transition-colors"
              >
                Tutup Rincian Stasiun
              </button>
            </div>
          </div>
        ) : null
      }
    />
  );
};

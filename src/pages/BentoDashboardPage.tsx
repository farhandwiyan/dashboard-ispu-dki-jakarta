import React, { useState } from 'react';
import { ExecutiveScorecards } from '../components/bento/ExecutiveScorecards';
import { TemporalTrendPanel } from '../components/bento/TemporalTrendPanel';
import { SpatialMapPanel, EnlargedSpatialMap } from '../components/bento/SpatialMapPanel';
import { RankingBarPanel } from '../components/bento/RankingBarPanel';
import { YoYStackedBarPanel } from '../components/bento/YoYStackedBarPanel';
import { HexaMetricGridPanel } from '../components/bento/HexaMetricGridPanel';
import { LayoutGrid } from '../components/ui/LayoutGrid';
import { StationData } from '../utils/dataParser';
import { getIspuCategory } from '../utils/colorMapping';
import { X } from 'lucide-react';

export const BentoDashboardPage: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);

  const handleSelectStation = (st: StationData, kecName?: string) => {
    setSelectedStation(st);
    setSelectedKecamatan(kecName || null);
  };

  const handleCloseModal = () => {
    setSelectedStation(null);
    setSelectedKecamatan(null);
  };

  const avgCat = selectedStation ? getIspuCategory(selectedStation.avgIspu) : null;
  const maxCat = selectedStation ? getIspuCategory(selectedStation.maxIspu) : null;

  return (
    <LayoutGrid
      zone1={<ExecutiveScorecards />}
      zone2Left={<TemporalTrendPanel />}
      zone2Right={
        <SpatialMapPanel
          onSelectStation={handleSelectStation}
        />
      }
      zone3Left={
        <RankingBarPanel onSelectStation={(s) => handleSelectStation(s)} />
      }
      zone3Right={<YoYStackedBarPanel />}
      zone3Bottom={<HexaMetricGridPanel />}
      modal={
        selectedStation && avgCat && maxCat ? (
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-[#0D3843]/45 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseModal();
            }}
          >
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto animate-in fade-in zoom-in duration-200">
              <div className="lg:col-span-5 bg-white rounded-[28px] w-full p-6 shadow-2xl border border-[#CDEAEF] relative flex flex-col justify-between">
                <div>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="lg:hidden absolute top-5 right-5 p-2 rounded-full text-[#88A2AA] hover:text-[#0D3843] hover:bg-[#F0FAFB] transition-colors cursor-pointer"
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-lg font-bold text-[#0D3843] mb-4">
                    {selectedStation.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-5 text-center">
                    <div className="p-3 rounded-2xl bg-[#F8FDFF] border border-[#BAE6FD]">
                      <div className="text-2xl font-bold text-[#0D3843]">
                        {selectedStation.avgIspu.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: maxCat.color }}
                      >
                        {selectedStation.maxIspu}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs mb-5">
                    <div className="flex justify-between gap-2 py-1.5 border-b border-[#F0FAFB]">
                      <span className="text-[#64748B]">PM2.5 / PM10</span>
                      <span className="font-bold text-[#0D3843] text-right">
                        {selectedStation.pm25} / {selectedStation.pm10}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 py-1.5 border-b border-[#F0FAFB]">
                      <span className="text-[#64748B]">SO2 / CO / O3 / NO2</span>
                      <span className="font-bold text-[#0D3843] text-right">
                        {selectedStation.so2} / {selectedStation.co} / {selectedStation.o3} / {selectedStation.no2}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 rounded-full bg-[#0284C7] text-white font-semibold text-xs hover:bg-[#0369A1] transition-colors cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="lg:col-span-7">
                <EnlargedSpatialMap
                  selectedStation={selectedStation}
                  selectedKecamatan={selectedKecamatan}
                  onSelectStation={handleSelectStation}
                  onClose={handleCloseModal}
                />
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
};

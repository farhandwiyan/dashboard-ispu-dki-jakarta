import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { STATIONS, StationData, KECAMATAN_STATION_MAP } from '../../utils/dataParser';
import { getChoroplethColor } from '../../utils/colorMapping';
import jakartaGeoJson from '../../data/jakarta_kecamatan.json';
import { MapPin, RotateCcw, X } from 'lucide-react';

export interface SpatialMapProps {
  onSelectStation?: (st: StationData, kecamatanName?: string) => void;
  searchQuery?: string;
}

export interface EnlargedSpatialMapProps {
  selectedStation: StationData;
  selectedKecamatan?: string | null;
  onSelectStation: (st: StationData, kecamatanName?: string) => void;
  onClose: () => void;
}

export const SpatialMap: React.FC<SpatialMapProps> = ({
  onSelectStation,
  searchQuery = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const onSelectStationRef = useRef(onSelectStation);
  onSelectStationRef.current = onSelectStation;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-6.2088, 106.8456],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: '&copy; Esri &copy; OpenStreetMap'
      }
    ).addTo(map);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    esriLayer.on('tileerror', () => {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);
    });

    try {
      const layerGroup = L.geoJSON(jakartaGeoJson as any, {
        style: (feature) => {
          const props = feature?.properties || {};
          const kecName = (
            props.name ||
            props.WADMKC ||
            props.KECAMATAN ||
            ''
          )
            .toUpperCase()
            .trim();
          const mapping = KECAMATAN_STATION_MAP[kecName];
          const stId = mapping ? mapping.stationId : 'DKI1';
          const st = STATIONS.find((s) => s.id === stId) || STATIONS[0];
          const choro = getChoroplethColor(st.avgIspu);

          return {
            fillColor: choro.fillColor,
            fillOpacity: 0.68,
            weight: 1.5,
            color: '#FFFFFF',
            opacity: 0.95
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature?.properties || {};
          const kecName = (
            props.name ||
            props.WADMKC ||
            props.KECAMATAN ||
            'Kecamatan'
          )
            .toUpperCase()
            .trim();
          const mapping = KECAMATAN_STATION_MAP[kecName];
          const stId = mapping ? mapping.stationId : 'DKI1';
          const cityName = mapping ? mapping.city : 'DKI Jakarta';
          const st = STATIONS.find((s) => s.id === stId) || STATIONS[0];
          const choro = getChoroplethColor(st.avgIspu);

          layer.bindTooltip(
            `<div style="font-family: Poppins, sans-serif; font-size: 11px;">
              <strong style="color: #0D3843; font-size: 12px;">Kecamatan ${kecName}</strong><br/>
              <span style="color:#64778A;">${cityName} • ${st.name}</span><br/>
              <span style="font-weight:700; color:${choro.fillColor};">Mean ISPU: ${st.avgIspu.toFixed(
                1
              )} (Max: ${st.maxIspu})</span><br/>
              <span style="font-size:10px; color:#475569;">Kepekatan: ${
                choro.intensityLabel
              }</span>
            </div>`,
            { sticky: true }
          );

          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                fillOpacity: 0.88,
                weight: 2.5,
                color: '#0D3843'
              });
              target.bringToFront();
            },
            mouseout: (e) => {
              if (geoJsonLayerRef.current) {
                geoJsonLayerRef.current.resetStyle(e.target);
              }
            },
            click: () => {
              if (st && onSelectStationRef.current) {
                onSelectStationRef.current(st, kecName);
              }
            }
          });
        }
      }).addTo(map);
      geoJsonLayerRef.current = layerGroup;
    } catch (e) {
      console.error('Bento Map error:', e);
    }

    // Add 5 SPKU Station Markers sorted by avgIspu
    STATIONS.forEach((st) => {
      const choro = getChoroplethColor(st.avgIspu);

      const customIcon = L.divIcon({
        className: 'bento-station-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              background-color: ${choro.pinColor};
              color: white;
              font-family: 'Poppins', sans-serif;
              font-size: 11px;
              font-weight: 800;
              border-radius: 9999px;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              white-space: nowrap;
            ">
              <span style="width: 6px; height: 6px; border-radius: 50%; background-color: white;"></span>
              <span>${st.id}: ${st.avgIspu.toFixed(1)}</span>
            </div>
            <div style="width: 2px; height: 12px; background-color: ${choro.pinColor};"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${
              choro.pinColor
            }; border: 2px solid white;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        if (onSelectStationRef.current) onSelectStationRef.current(st);
      });
    });

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      geoJsonLayerRef.current = null;
    };
  }, []);

  // React to searchQuery changes by highlighting matching polygons
  useEffect(() => {
    if (!geoJsonLayerRef.current) return;
    const q = searchQuery.trim().toUpperCase();

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const props = layer.feature?.properties || {};
      const kecName = (
        props.name ||
        props.WADMKC ||
        props.KECAMATAN ||
        ''
      )
        .toUpperCase()
        .trim();
      const mapping = KECAMATAN_STATION_MAP[kecName];
      const stId = mapping ? mapping.stationId : 'DKI1';
      const cityName = (mapping ? mapping.city : '').toUpperCase();
      const st = STATIONS.find((s) => s.id === stId) || STATIONS[0];
      const choro = getChoroplethColor(st.avgIspu);

      if (!q) {
        layer.setStyle({
          fillColor: choro.fillColor,
          fillOpacity: 0.68,
          weight: 1.5,
          color: '#FFFFFF'
        });
        return;
      }

      const isMatch =
        kecName.includes(q) ||
        cityName.includes(q) ||
        st.name.toUpperCase().includes(q) ||
        st.id.toUpperCase().includes(q);

      layer.setStyle({
        fillColor: choro.fillColor,
        fillOpacity: isMatch ? 0.9 : 0.2,
        weight: isMatch ? 2.5 : 1,
        color: isMatch ? '#F59E0B' : '#FFFFFF'
      });
    });
  }, [searchQuery]);

  const sortedStations = [...STATIONS].sort((a, b) => a.avgIspu - b.avgIspu);

  return (
    <div className="bento-card p-5 flex flex-col justify-between h-full bg-white rounded-[20px] shadow-sm border border-[#CDEAEF]">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0D3843]">
              Peta Koroplet Beban ISPU 5 Wilayah DKI Jakarta
            </h3>
            <p className="text-xs text-[#4E7682] mt-0.5">
              Join `location` & `mean(max)` CSV pada 42 Poligon Kecamatan (Kepekatan Warna)
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
          CHOROPLETH GIS
        </span>
      </div>

      {/* Map Container */}
      <div className="relative isolate z-0 w-full h-[220px] sm:h-[245px] rounded-2xl overflow-hidden border border-[#D5F0F5] bg-[#F1F4F8]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Legenda Kepekatan Nilai Max (Rendah -> Tinggi) */}
      <div className="mt-3 pt-2 border-t border-[#F0FAFB] flex flex-wrap items-center justify-between text-xs text-[#64748B] gap-2">
        <div className="flex items-center gap-2.5 text-[11px] font-semibold flex-wrap">
          <span className="text-[#88A2AA] font-bold">Kepekatan `max`:</span>
          {sortedStations.map((st) => {
            const choro = getChoroplethColor(st.avgIspu);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectStation && onSelectStation(st)}
                className="flex items-center gap-1 hover:text-[#0D3843] transition-colors cursor-pointer"
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs border border-white shadow-2xs"
                  style={{ backgroundColor: choro.fillColor }}
                />
                <span>
                  {st.id} ({st.avgIspu.toFixed(1)})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const EnlargedSpatialMap: React.FC<EnlargedSpatialMapProps> = ({
  selectedStation,
  selectedKecamatan,
  onSelectStation,
  onClose
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const onSelectStationRef = useRef(onSelectStation);
  onSelectStationRef.current = onSelectStation;
  const selectedStationRef = useRef(selectedStation);
  selectedStationRef.current = selectedStation;
  const selectedKecamatanRef = useRef(selectedKecamatan);
  selectedKecamatanRef.current = selectedKecamatan;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedStation.lat, selectedStation.lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: '&copy; Esri &copy; OpenStreetMap'
      }
    ).addTo(map);

    esriLayer.on('tileerror', () => {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);
    });

    try {
      const layerGroup = L.geoJSON(jakartaGeoJson as any, {
        style: (feature) => {
          const props = feature?.properties || {};
          const kecName = (
            props.name ||
            props.WADMKC ||
            props.KECAMATAN ||
            ''
          )
            .toUpperCase()
            .trim();
          const mapping = KECAMATAN_STATION_MAP[kecName];
          const stId = mapping ? mapping.stationId : 'DKI1';
          const st = STATIONS.find((s) => s.id === stId) || STATIONS[0];
          const choro = getChoroplethColor(st.avgIspu);

          return {
            fillColor: choro.fillColor,
            fillOpacity: 0.68,
            weight: 1.5,
            color: '#FFFFFF',
            opacity: 0.95
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature?.properties || {};
          const kecName = (
            props.name ||
            props.WADMKC ||
            props.KECAMATAN ||
            'Kecamatan'
          )
            .toUpperCase()
            .trim();
          const mapping = KECAMATAN_STATION_MAP[kecName];
          const stId = mapping ? mapping.stationId : 'DKI1';
          const cityName = mapping ? mapping.city : 'DKI Jakarta';
          const st = STATIONS.find((s) => s.id === stId) || STATIONS[0];
          const choro = getChoroplethColor(st.avgIspu);

          layer.bindTooltip(
            `<div style="font-family: Poppins, sans-serif; font-size: 11px;">
              <strong style="color: #0D3843; font-size: 12px;">Kecamatan ${kecName}</strong><br/>
              <span style="color:#64778A;">${cityName} • ${st.name}</span><br/>
              <span style="font-weight:700; color:${choro.fillColor};">Mean ISPU: ${st.avgIspu.toFixed(
                1
              )} (Max: ${st.maxIspu})</span><br/>
              <span style="font-size:10px; color:#475569;">Kepekatan: ${
                choro.intensityLabel
              }</span>
            </div>`,
            { sticky: true }
          );

          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                fillOpacity: 0.92,
                weight: 3,
                color: '#0D3843'
              });
              target.bringToFront();
            },
            mouseout: () => {
              updateLayerStyles();
            },
            click: () => {
              if (st && onSelectStationRef.current) {
                onSelectStationRef.current(st, kecName);
              }
            }
          });
        }
      }).addTo(map);
      geoJsonLayerRef.current = layerGroup;
    } catch (e) {
      console.error('Enlarged Map error:', e);
    }

    STATIONS.forEach((st) => {
      const choro = getChoroplethColor(st.avgIspu);
      const customIcon = L.divIcon({
        className: 'bento-station-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              background-color: ${choro.pinColor};
              color: white;
              font-family: 'Poppins', sans-serif;
              font-size: 11px;
              font-weight: 800;
              border-radius: 9999px;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              white-space: nowrap;
            ">
              <span style="width: 6px; height: 6px; border-radius: 50%; background-color: white;"></span>
              <span>${st.id}: ${st.avgIspu.toFixed(1)}</span>
            </div>
            <div style="width: 2px; height: 12px; background-color: ${choro.pinColor};"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${
              choro.pinColor
            }; border: 2px solid white;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        if (onSelectStationRef.current) onSelectStationRef.current(st);
      });
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
      focusSelectedRegion();
    }, 180);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      geoJsonLayerRef.current = null;
    };
  }, []);

  const updateLayerStyles = () => {
    if (!geoJsonLayerRef.current) return;
    const activeKec = (selectedKecamatanRef.current || '').trim().toUpperCase();
    const activeStationId = selectedStationRef.current.id;

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const props = layer.feature?.properties || {};
      const kecName = (
        props.name ||
        props.WADMKC ||
        props.KECAMATAN ||
        ''
      )
        .toUpperCase()
        .trim();
      const mapping = KECAMATAN_STATION_MAP[kecName];
      const stId = mapping ? mapping.stationId : 'DKI1';
      const st = STATIONS.find((s) => s.id === stId) || STATIONS[0];
      const choro = getChoroplethColor(st.avgIspu);

      const isSelectedKec = activeKec && kecName === activeKec;
      const isSelectedStation = stId === activeStationId;

      if (isSelectedKec) {
        layer.setStyle({
          fillColor: choro.fillColor,
          fillOpacity: 0.92,
          weight: 3.5,
          color: '#F59E0B'
        });
        if (layer.bringToFront) layer.bringToFront();
      } else if (isSelectedStation) {
        layer.setStyle({
          fillColor: choro.fillColor,
          fillOpacity: 0.82,
          weight: 2.2,
          color: '#0D3843'
        });
        if (layer.bringToFront) layer.bringToFront();
      } else {
        layer.setStyle({
          fillColor: choro.fillColor,
          fillOpacity: 0.35,
          weight: 1,
          color: '#FFFFFF'
        });
      }
    });
  };

  const focusSelectedRegion = () => {
    const map = mapInstanceRef.current;
    const geoLayer = geoJsonLayerRef.current;
    if (!map || !geoLayer) return;

    updateLayerStyles();

    const activeKec = (selectedKecamatan || '').trim().toUpperCase();
    let targetBounds: L.LatLngBounds | null = null;

    if (activeKec) {
      geoLayer.eachLayer((layer: any) => {
        const props = layer.feature?.properties || {};
        const kecName = (
          props.name ||
          props.WADMKC ||
          props.KECAMATAN ||
          ''
        )
          .toUpperCase()
          .trim();
        if (kecName === activeKec && layer.getBounds) {
          targetBounds = layer.getBounds();
        }
      });
    }

    if (!targetBounds) {
      geoLayer.eachLayer((layer: any) => {
        const props = layer.feature?.properties || {};
        const kecName = (
          props.name ||
          props.WADMKC ||
          props.KECAMATAN ||
          ''
        )
          .toUpperCase()
          .trim();
        const mapping = KECAMATAN_STATION_MAP[kecName];
        const stId = mapping ? mapping.stationId : 'DKI1';
        if (stId === selectedStation.id && layer.getBounds) {
          const b = layer.getBounds();
          if (!targetBounds) {
            targetBounds = L.latLngBounds(b.getSouthWest(), b.getNorthEast());
          } else {
            targetBounds.extend(b);
          }
        }
      });
    }

    if (targetBounds && (targetBounds as L.LatLngBounds).isValid()) {
      map.flyToBounds(targetBounds, {
        padding: activeKec ? [45, 45] : [28, 28],
        maxZoom: activeKec ? 13 : 12,
        duration: 0.6
      });
    } else {
      map.flyTo([selectedStation.lat, selectedStation.lng], 12, {
        duration: 0.6
      });
    }
  };

  useEffect(() => {
    focusSelectedRegion();
  }, [selectedStation, selectedKecamatan]);

  const handleResetFullJakarta = () => {
    const map = mapInstanceRef.current;
    const geoLayer = geoJsonLayerRef.current;
    if (!map) return;
    if (geoLayer && geoLayer.getBounds().isValid()) {
      map.flyToBounds(geoLayer.getBounds(), {
        padding: [20, 20],
        maxZoom: 11,
        duration: 0.6
      });
    } else {
      map.flyTo([-6.2088, 106.8456], 11, { duration: 0.6 });
    }
  };

  const sortedStations = [...STATIONS].sort((a, b) => a.avgIspu - b.avgIspu);

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-2xl border border-[#CDEAEF] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-[#0D3843]">
                Peta Fokus Wilayah: {selectedStation.city}
              </h3>
              {selectedKecamatan && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                  Kec. {selectedKecamatan}
                </span>
              )}
            </div>
            <p className="text-xs text-[#4E7682] mt-0.5">
              Klik kecamatan atau pin SPKU lain di peta untuk memperbesar & mengganti rincian di kiri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetFullJakarta}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] hover:bg-[#E0F2FE] transition-colors cursor-pointer"
            title="Lihat Seluruh Wilayah DKI Jakarta"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seluruh DKI</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#88A2AA] hover:text-[#0D3843] hover:bg-[#F0FAFB] transition-colors cursor-pointer"
            aria-label="Tutup Peta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Enlarged Map Container */}
      <div className="relative isolate z-0 w-full h-[320px] sm:h-[380px] lg:h-[410px] rounded-2xl overflow-hidden border border-[#D5F0F5] bg-[#F1F4F8]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Quick Switch Station Pills */}
      <div className="mt-3.5 pt-2.5 border-t border-[#F0FAFB] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold flex-wrap">
          <span className="text-[#88A2AA] font-bold mr-1">Pilih Wilayah SPKU:</span>
          {sortedStations.map((st) => {
            const choro = getChoroplethColor(st.avgIspu);
            const isActive = st.id === selectedStation.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectStation(st)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#0D3843] text-white border-[#0D3843] shadow-xs font-bold'
                    : 'bg-[#F8FDFF] text-[#4E7682] border-[#D5F0F5] hover:border-[#0284C7] hover:text-[#0D3843]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white"
                  style={{ backgroundColor: choro.fillColor }}
                />
                <span>
                  {st.id} ({st.avgIspu.toFixed(1)})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


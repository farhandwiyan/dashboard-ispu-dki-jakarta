import React from 'react';

export interface LayoutGridProps {
  header?: React.ReactNode;
  zone1: React.ReactNode;
  zone2Left: React.ReactNode;
  zone2Right: React.ReactNode;
  zone3Left: React.ReactNode;
  zone3Right: React.ReactNode;
  zone3Bottom: React.ReactNode;
  footer?: React.ReactNode;
  modal?: React.ReactNode;
}

/**
 * Pembungkus pembagian 3 Zona Hierarki Visual Dashboard ISPU DKI Jakarta
 * sesuai spesifikasi `planning.md`.
 */
export const LayoutGrid: React.FC<LayoutGridProps> = ({
  header,
  zone1,
  zone2Left,
  zone2Right,
  zone3Left,
  zone3Right,
  zone3Bottom,
  footer,
  modal
}) => {
  return (
    <div className="aqua-bento-bg min-h-screen py-6 sm:py-8 px-3 sm:px-6 lg:px-8 font-poppins flex items-center justify-center">
      <div className="aqua-frame w-full max-w-[1440px] flex flex-col gap-5 relative">
        {header}

        {/* ZONA 1: ZONA ATAS (Top Banner / Executive Summary < 3 Detik) */}
        <section aria-label="Zona 1: Executive Summary">
          {zone1}
        </section>

        {/* ZONA 2: ZONA TENGAH (Kanvas Utama: Kiri Line Chart & Kanan Peta Koroplet) */}
        <section
          aria-label="Zona 2: Eksplorasi Temporal dan Spasial"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
        >
          {zone2Left}
          {zone2Right}
        </section>

        {/* ZONA 3: ZONA BAWAH (Breakdown / Details on Demand) */}
        <section
          aria-label="Zona 3: Komparasi Stasiun, YoY, dan 6 Parameter Ambien"
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {zone3Left}
            {zone3Right}
          </div>
          {zone3Bottom}
        </section>

        {footer}
      </div>

      {modal}
    </div>
  );
};


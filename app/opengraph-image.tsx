import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
export const alt = 'Solution Habitation — Tous les savoir-faire pour votre habitat.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/images/solution-habitation-logo.png'));
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        background: '#102b3c',
        color: '#f3f6f8',
        padding: 70,
      }}
    >
      <div style={{ fontSize: 30, display: 'flex', alignItems: 'center', gap: 22 }}>
        {/* ImageResponse renders an image buffer, not a browser next/image element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${logo.toString('base64')}`}
          alt=""
          width={90}
          height={90}
        />
        solution habitation.
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 78,
          lineHeight: 1.1,
          fontFamily: 'serif',
          maxWidth: 950,
        }}
      >
        Tous les savoir-faire pour votre habitat.
      </div>
      <div style={{ display: 'flex', fontSize: 19, color: '#8acbea', letterSpacing: 4 }}>
        RÉNOVER · PROTÉGER · ENTRETENIR · CONFORT
      </div>
    </div>,
    size,
  );
}

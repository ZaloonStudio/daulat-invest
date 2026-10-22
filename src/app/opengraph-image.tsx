import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const alt = 'Daulat Invest — Pakistan markets, a clearer view';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(<div style={{ background: '#0B1120', color: '#EFF3FA', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', borderBottom: '12px solid #B69249' }}>
    <div style={{ color: '#B69249', fontSize: 30, marginBottom: 45 }}>DAULAT INVEST</div>
    <div style={{ fontSize: 76, fontWeight: 700 }}>Pakistan markets.</div>
    <div style={{ fontSize: 76, color: '#B69249' }}>A clearer view.</div>
    <div style={{ fontSize: 25, color: '#A4AEC1', marginTop: 40 }}>PSX stocks · Market charts · Investment tools</div>
  </div>, size);
}

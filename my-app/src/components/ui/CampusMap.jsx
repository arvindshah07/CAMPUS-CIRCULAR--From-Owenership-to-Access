import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Navigation2, Clock, Footprints, MapPin, Plus, Minus, Locate } from 'lucide-react';
import { CAMPUS_CENTER } from '../../data/mockDb';

// ─── Projection constants ─────────────────────────────────────────
const W = 800, H = 500;
const LNG_RANGE_MIN = 72.8740, LNG_RANGE_MAX = 72.8820;
const LAT_RANGE_MIN = 19.0725, LAT_RANGE_MAX = 19.0805;

function toXY({ lat, lng }) {
  return {
    x: ((lng - LNG_RANGE_MIN) / (LNG_RANGE_MAX - LNG_RANGE_MIN)) * W,
    y: H - ((lat - LAT_RANGE_MIN) / (LAT_RANGE_MAX - LAT_RANGE_MIN)) * H,
  };
}

function haversine(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// ─── Campus road network ──────────────────────────────────────────
const ROADS_PRIMARY = [
  [{ lat: 19.0760, lng: 72.8742 }, { lat: 19.0760, lng: 72.8818 }],
  [{ lat: 19.0728, lng: 72.8780 }, { lat: 19.0802, lng: 72.8780 }],
];
const ROADS_SECONDARY = [
  [{ lat: 19.0745, lng: 72.8745 }, { lat: 19.0745, lng: 72.8815 }],
  [{ lat: 19.0775, lng: 72.8748 }, { lat: 19.0775, lng: 72.8816 }],
  [{ lat: 19.0728, lng: 72.8762 }, { lat: 19.0802, lng: 72.8762 }],
  [{ lat: 19.0728, lng: 72.8798 }, { lat: 19.0802, lng: 72.8798 }],
];
const ROADS_PATH = [
  [{ lat: 19.0738, lng: 72.8748 }, { lat: 19.0760, lng: 72.8780 }],
  [{ lat: 19.0760, lng: 72.8780 }, { lat: 19.0790, lng: 72.8812 }],
  [{ lat: 19.0775, lng: 72.8762 }, { lat: 19.0760, lng: 72.8780 }],
];

const BLOCKS = [
  { lat: 19.0766, lng: 72.8768, w: 0.0010, h: 0.0007, label: 'Library',      color: '#bbf7d0', stroke: '#86efac' },
  { lat: 19.0753, lng: 72.8776, w: 0.0012, h: 0.0008, label: 'Main Block',   color: '#bfdbfe', stroke: '#93c5fd' },
  { lat: 19.0779, lng: 72.8761, w: 0.0011, h: 0.0006, label: 'North Campus', color: '#bfdbfe', stroke: '#93c5fd' },
  { lat: 19.0740, lng: 72.8786, w: 0.0010, h: 0.0007, label: 'South Hostel', color: '#fde68a', stroke: '#fcd34d' },
  { lat: 19.0758, lng: 72.8756, w: 0.0009, h: 0.0006, label: 'Arts Block',   color: '#e9d5ff', stroke: '#c4b5fd' },
  { lat: 19.0748, lng: 72.8791, w: 0.0010, h: 0.0006, label: 'Hostel B',     color: '#fde68a', stroke: '#fcd34d' },
  { lat: 19.0736, lng: 72.8797, w: 0.0010, h: 0.0006, label: 'Hostel C',     color: '#fde68a', stroke: '#fcd34d' },
  { lat: 19.0771, lng: 72.8786, w: 0.0013, h: 0.0009, label: 'Sports Ground',color: '#bbf7d0', stroke: '#6ee7b7' },
  { lat: 19.0767, lng: 72.8779, w: 0.0007, h: 0.0005, label: 'Indoor Court', color: '#bbf7d0', stroke: '#86efac' },
  { lat: 19.0744, lng: 72.8754, w: 0.0011, h: 0.0007, label: 'Design Block', color: '#bfdbfe', stroke: '#93c5fd' },
  { lat: 19.0755, lng: 72.8765, w: 0.0009, h: 0.0006, label: 'Music Room',   color: '#e9d5ff', stroke: '#c4b5fd' },
];

function blockToRect({ lat, lng, w, h }) {
  const tl = toXY({ lat: lat + h, lng });
  const br = toXY({ lat, lng: lng + w });
  return { x: tl.x, y: tl.y, width: Math.max(br.x - tl.x, 4), height: Math.max(br.y - tl.y, 4) };
}

function routeD(from, to) {
  const f = toXY(from);
  const t = toXY(to);
  // L-shaped route: go horizontal first, then vertical
  return `M ${f.x} ${f.y} L ${t.x} ${f.y} L ${t.x} ${t.y}`;
}

// ─── Pin marker ───────────────────────────────────────────────────
function Pin({ x, y, color, label, sublabel, isYou, active, scale = 1 }) {
  const s = 1 / scale; // counter-scale so pins stay same visual size when zoomed
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} style={{ transformOrigin: `${x}px ${y}px` }}>
      <ellipse cx={0} cy={20} rx={7} ry={3} fill="rgba(0,0,0,0.15)" />
      {isYou ? (
        <>
          <circle cx={0} cy={0} r={14} fill={color} opacity={0.2} />
          <circle cx={0} cy={0} r={8} fill={color} />
          <circle cx={0} cy={0} r={3.5} fill="white" />
        </>
      ) : (
        <>
          <path d="M0,-24 C-12,-24 -12,-10 0,0 C12,-10 12,-24 0,-24 Z"
            fill={color} stroke="white" strokeWidth="2" />
          <circle cx={0} cy={-16} r={5} fill="white" opacity={0.9} />
        </>
      )}
      {(active || isYou) && (
        <g transform="translate(0,-40)">
          <rect x={-44} y={-16} width={88} height={sublabel ? 30 : 18}
            rx={5} fill="white"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.22))' }} />
          <text x={0} y={-3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#111">{label}</text>
          {sublabel && <text x={0} y={9} textAnchor="middle" fontSize="8" fill="#555">{sublabel}</text>}
        </g>
      )}
    </g>
  );
}

// ─── Animated travel dot along route ─────────────────────────────
function TravelDot({ from, to }) {
  const d = routeD(from, to);
  return (
    <>
      <path d={d} fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <path d={d} fill="none" stroke="#4285f4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle r="7" fill="#4285f4" stroke="white" strokeWidth="2">
        <animateMotion dur="3s" repeatCount="indefinite" path={d} rotate="auto" />
      </circle>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────
export function CampusMap({ mode = 'single', resource, resources = [] }) {
  const svgRef = useRef(null);

  // viewBox state: [x, y, w, h]
  const [vb, setVb] = useState([0, 0, W, H]);
  const [selected, setSelected] = useState(null);
  const drag = useRef(null);
  const lastPinch = useRef(null);

  const zoom = W / vb[2]; // current zoom level

  const clampVb = useCallback(([x, y, w, h]) => {
    const minW = W / 8, maxW = W * 1.5;
    w = Math.max(minW, Math.min(maxW, w));
    h = w * (H / W);
    x = Math.max(-(W * 0.2), Math.min(W - w + W * 0.2, x));
    y = Math.max(-(H * 0.2), Math.min(H - h + H * 0.2, y));
    return [x, y, w, h];
  }, []);

  // ── Zoom in/out centred on SVG centre ──
  const zoomBy = useCallback((factor) => {
    setVb(prev => {
      const [x, y, w, h] = prev;
      const cx = x + w / 2, cy = y + h / 2;
      const nw = w * factor, nh = h * factor;
      return clampVb([cx - nw / 2, cy - nh / 2, nw, nh]);
    });
  }, [clampVb]);

  // ── Reset to home ──
  const resetView = useCallback(() => setVb([0, 0, W, H]), []);

  // ── SVG coordinate from client event ──
  const svgPoint = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const [vx, vy, vw, vh] = vb;
    return {
      x: vx + ((clientX - rect.left) / rect.width) * vw,
      y: vy + ((clientY - rect.top) / rect.height) * vh,
    };
  }, [vb]);

  // ── Mouse drag ──
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    drag.current = { startX: e.clientX, startY: e.clientY, vb0: vb };
    e.preventDefault();
  }, [vb]);

  const onMouseMove = useCallback((e) => {
    if (!drag.current) return;
    const { startX, startY, vb0 } = drag.current;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = vb0[2] / rect.width;
    const scaleY = vb0[3] / rect.height;
    const dx = (e.clientX - startX) * scaleX;
    const dy = (e.clientY - startY) * scaleY;
    setVb(clampVb([vb0[0] - dx, vb0[1] - dy, vb0[2], vb0[3]]));
  }, [clampVb]);

  const onMouseUp = useCallback(() => { drag.current = null; }, []);

  // ── Scroll wheel zoom ──
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    const pt = svgPoint(e.clientX, e.clientY);
    setVb(prev => {
      const [, , w, h] = prev;
      const nw = w * factor, nh = h * factor;
      return clampVb([pt.x - (pt.x - prev[0]) * (nw / w), pt.y - (pt.y - prev[1]) * (nh / h), nw, nh]);
    });
  }, [svgPoint, clampVb]);

  // ── Touch pan ──
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      drag.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, vb0: vb };
    } else if (e.touches.length === 2) {
      drag.current = null;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinch.current = { dist: Math.hypot(dx, dy), vb0: vb };
    }
  }, [vb]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && drag.current) {
      const { startX, startY, vb0 } = drag.current;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx = (e.touches[0].clientX - startX) * (vb0[2] / rect.width);
      const dy = (e.touches[0].clientY - startY) * (vb0[3] / rect.height);
      setVb(clampVb([vb0[0] - dx, vb0[1] - dy, vb0[2], vb0[3]]));
    } else if (e.touches.length === 2 && lastPinch.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = lastPinch.current.dist / dist;
      const { vb0 } = lastPinch.current;
      const nw = vb0[2] * factor, nh = vb0[3] * factor;
      setVb(clampVb([vb0[0], vb0[1], nw, nh]));
    }
  }, [clampVb]);

  const onTouchEnd = useCallback(() => {
    drag.current = null;
    lastPinch.current = null;
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('touchmove', onTouchMove);
    };
  }, [onWheel, onTouchMove]);

  // ── Pins ──
  const pins = useMemo(() => {
    if (mode === 'single') return resource?.coords ? [resource] : [];
    const seen = new Set();
    return resources.filter(r => r.coords).filter(r => {
      if (seen.has(r.landmark)) return false;
      seen.add(r.landmark);
      return true;
    });
  }, [mode, resource, resources]);

  const activePin = mode === 'single'
    ? pins[0]
    : pins.find(p => p.landmark === selected) ?? null;

  const distInfo = useMemo(() => {
    if (!activePin?.coords) return null;
    const metres = haversine(CAMPUS_CENTER, activePin.coords);
    return {
      metres: Math.round(metres),
      km: (metres / 1000).toFixed(2),
      walkMins: activePin.distanceMins ?? Math.round(metres / 80),
    };
  }, [activePin]);

  const center = toXY(CAMPUS_CENTER);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg select-none" style={{ background: '#e8f5e9', fontFamily: 'sans-serif' }}>

      {/* ── SVG Map ── */}
      <div className="relative" style={{ paddingBottom: `${(H / W) * 100}%` }}>
        <svg
          ref={svgRef}
          viewBox={vb.join(' ')}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-label="Interactive campus map"
        >
          {/* Terrain */}
          <rect width={W} height={H} fill="#e8f5e9" />
          <rect x={0} y={0} width={W * 0.28} height={H * 0.38} rx={6} fill="#c8e6c9" opacity={0.6} />
          <rect x={W * 0.62} y={H * 0.52} width={W * 0.38} height={H * 0.48} rx={6} fill="#c8e6c9" opacity={0.6} />
          <rect x={W * 0.3} y={H * 0.05} width={W * 0.15} height={H * 0.2} rx={4} fill="#c8e6c9" opacity={0.4} />

          {/* Building blocks */}
          {BLOCKS.map((b, i) => {
            const r = blockToRect(b);
            return (
              <g key={i}>
                <rect {...r} fill={b.color} rx={4} stroke={b.stroke} strokeWidth={1} />
                {zoom > 2 && (
                  <text
                    x={r.x + r.width / 2} y={r.y + r.height / 2 + 3}
                    textAnchor="middle" fontSize={9 / zoom * 2}
                    fill="#374151" fontWeight="500" pointerEvents="none"
                  >
                    {b.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tertiary paths */}
          {ROADS_PATH.map((road, i) => (
            <g key={i}>
              <polyline points={road.map(p => { const { x, y } = toXY(p); return `${x},${y}`; }).join(' ')}
                fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <polyline points={road.map(p => { const { x, y } = toXY(p); return `${x},${y}`; }).join(' ')}
                fill="none" stroke="#f3f4f6" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}

          {/* Secondary roads */}
          {ROADS_SECONDARY.map((road, i) => (
            <g key={i}>
              <polyline points={road.map(p => { const { x, y } = toXY(p); return `${x},${y}`; }).join(' ')}
                fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" />
              <polyline points={road.map(p => { const { x, y } = toXY(p); return `${x},${y}`; }).join(' ')}
                fill="none" stroke="#f9fafb" strokeWidth="5" strokeLinecap="round" />
            </g>
          ))}

          {/* Primary roads */}
          {ROADS_PRIMARY.map((road, i) => (
            <g key={i}>
              <polyline points={road.map(p => { const { x, y } = toXY(p); return `${x},${y}`; }).join(' ')}
                fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
              <polyline points={road.map(p => { const { x, y } = toXY(p); return `${x},${y}`; }).join(' ')}
                fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
            </g>
          ))}

          {/* Animated route to active pin */}
          {activePin?.coords && <TravelDot from={CAMPUS_CENTER} to={activePin.coords} />}

          {/* Resource pins */}
          {pins.map(r => {
            const p = toXY(r.coords);
            const isAvail = !r.availability.includes('Unavailable');
            const isActive = mode === 'single' || selected === r.landmark;
            const dist = haversine(CAMPUS_CENTER, r.coords);
            const mins = r.distanceMins ?? Math.round(dist / 80);
            return (
              <Pin
                key={r.id}
                x={p.x} y={p.y}
                color={isAvail ? '#16a34a' : '#dc2626'}
                label={r.landmark}
                sublabel={isActive ? `${Math.round(dist)}m · ${mins} min` : null}
                active={isActive}
                scale={zoom}
                onClick={mode === 'multi' ? () => setSelected(s => s === r.landmark ? null : r.landmark) : undefined}
              />
            );
          })}

          {/* You pin */}
          <Pin x={center.x} y={center.y} color="#4285f4" label="You" isYou active scale={zoom} />
        </svg>

        {/* ── Controls overlay ── */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => zoomBy(0.7)}
            className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Zoom in"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => zoomBy(1.43)}
            className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Zoom out"
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={resetView}
            className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors border border-gray-200 mt-1"
            aria-label="Reset view"
          >
            <Locate size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Scale bar */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded px-2 py-1 border border-gray-200 shadow-sm">
          <div className="flex flex-col items-start gap-0.5">
            <div className="text-[9px] text-gray-500 font-medium">
              {zoom < 1.5 ? '200 m' : zoom < 3 ? '100 m' : zoom < 5 ? '50 m' : '20 m'}
            </div>
            <div className="h-[3px] w-10 border-b-2 border-l-2 border-r-2 border-gray-500 rounded-sm" />
          </div>
        </div>

        {/* Zoom level badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-gray-200 shadow-sm">
          <span className="text-[9px] text-gray-500 font-mono">{zoom.toFixed(1)}×</span>
        </div>
      </div>

      {/* ── Distance info bar ── */}
      {distInfo && activePin ? (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Navigation2 size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{activePin.landmark ?? activePin.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{activePin.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-center">
            <div>
              <div className="flex items-center gap-1 text-blue-600 font-bold text-sm justify-center">
                <Footprints size={13} />
                {distInfo.metres < 1000 ? `${distInfo.metres} m` : `${distInfo.km} km`}
              </div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wide">Distance</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <div className="flex items-center gap-1 text-green-600 font-bold text-sm justify-center">
                <Clock size={13} />
                {distInfo.walkMins} min
              </div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wide">Walk</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              activePin.availability?.includes('Unavailable')
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-600'
            }`}>
              {activePin.availability?.includes('Unavailable') ? 'Unavailable' : 'Available'}
            </div>
          </div>
        </div>
      ) : mode === 'multi' ? (
        <div className="bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500">Tap a pin to see distance & walking time</span>
        </div>
      ) : null}
    </div>
  );
}

import { motion } from 'framer-motion';

const NODE_RADIUS = 6;
const CX = 160;
const CY = 160;
const OUTER_R = 110;
const INNER_R = 60;

function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function Node({ x, y, label, delay, highlight }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.3 }}>
      <circle cx={x} cy={y} r={NODE_RADIUS + (highlight ? 2 : 0)} fill={highlight ? 'var(--accent)' : 'var(--surface)'} stroke="var(--accent)" strokeWidth={highlight ? 0 : 1.5} />
      {label && (
        <text x={x} y={y + NODE_RADIUS + 14} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontFamily="var(--font-sans)">
          {label.length > 12 ? label.slice(0, 11) + '…' : label}
        </text>
      )}
    </motion.g>
  );
}

function Arc({ x1, y1, x2, y2, delay }) {
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.15;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  return (
    <motion.path
      d={d} fill="none" stroke="var(--accent)" strokeWidth={1} strokeOpacity={0.4}
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    />
  );
}

export const CircularRoute = ({ needLabel, capabilityNodes = [], resourceName, ownerName, className }) => {
  const isDecorative = !needLabel;

  if (isDecorative) {
    // Decorative loading spinner version
    return (
      <div className={`relative flex justify-center items-center ${className ?? 'w-40 h-40'}`}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <motion.circle cx="80" cy="80" r="60" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 8" />
          <motion.circle cx="80" cy="80" r="60" fill="none" stroke="var(--accent)" strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
          />
          {[0, 120, 240].map((angle, i) => {
            const { x, y } = polarToXY(80, 80, 60, angle);
            return (
              <motion.circle key={i} cx={x} cy={y} r={5} fill="var(--accent)"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.4 }}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // Semantic version
  const caps = capabilityNodes.slice(0, 5);
  const capAngles = caps.length === 1 ? [0] : caps.map((_, i) => (i / caps.length) * 360);
  const capPositions = capAngles.map(a => polarToXY(CX, CY, INNER_R, a));

  const needPos   = { x: CX, y: CY - OUTER_R };
  const resPos    = { x: CX, y: CY + OUTER_R * 0.6 };
  const ownerPos  = { x: CX, y: CY + OUTER_R };

  return (
    <div className={`flex justify-center items-center ${className ?? ''}`}>
      <svg width={CX * 2} height={CY * 2} viewBox={`0 0 ${CX * 2} ${CY * 2}`} aria-hidden="true">
        {/* Outer dashed ring */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 8" />

        {/* Arcs: need → each capability */}
        {capPositions.map((cp, i) => (
          <Arc key={`nc-${i}`} x1={needPos.x} y1={needPos.y} x2={cp.x} y2={cp.y} delay={0.3 + i * 0.1} />
        ))}

        {/* Arcs: each capability → resource */}
        {capPositions.map((cp, i) => (
          <Arc key={`cr-${i}`} x1={cp.x} y1={cp.y} x2={resPos.x} y2={resPos.y} delay={0.6 + i * 0.1} />
        ))}

        {/* Arc: resource → owner */}
        <Arc x1={resPos.x} y1={resPos.y} x2={ownerPos.x} y2={ownerPos.y} delay={1.0} />

        {/* Capability nodes */}
        {caps.map((cap, i) => (
          <Node key={cap} x={capPositions[i].x} y={capPositions[i].y} label={cap} delay={0.2 + i * 0.1} highlight={false} />
        ))}

        {/* Need node */}
        <Node x={needPos.x} y={needPos.y} label={needLabel} delay={0} highlight />

        {/* Resource node */}
        <Node x={resPos.x} y={resPos.y} label={resourceName ?? 'Best Match'} delay={0.9} highlight />

        {/* Owner node */}
        <Node x={ownerPos.x} y={ownerPos.y} label={ownerName ?? 'Owner'} delay={1.1} highlight={false} />
      </svg>
    </div>
  );
};

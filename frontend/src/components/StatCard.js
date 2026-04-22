import { useEffect, useRef, useState } from "react";

/**
 * Animated stat card. Counter animation ported from HMS DApp design (components.jsx).
 * Slash-format values ("6/18") and non-numeric skip animation.
 * Props:
 *   label  - caption
 *   value  - number | string
 *   icon   - emoji / node
 *   color  - border-left accent (default blue)
 */
const StatCard = ({ label, value, icon, color = "#3b82f6" }) => {
  const strVal = String(value ?? "");
  const isComplex = /\//.test(strVal);
  const prefix = strVal.match(/^[£$€]/) ? strVal[0] : "";
  const suffix = strVal.match(/[%+k]$/) ? strVal.slice(-1) : "";
  const numVal = isComplex ? NaN : parseFloat(strVal.replace(/[^0-9.]/g, ""));
  const canAnimate = !isComplex && !Number.isNaN(numVal);

  const [display, setDisplay] = useState(canAnimate ? `${prefix}0${suffix}` : strVal);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!canAnimate) {
      setDisplay(strVal);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const isInt = Number.isInteger(numVal);
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numVal * eased;
      const rendered = isInt ? Math.round(current).toLocaleString() : current.toFixed(2);
      setDisplay(`${prefix}${rendered}${suffix}`);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strVal]);

  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      {icon && <span className="stat-icon" style={{ color }}>{icon}</span>}
      <div className="stat-info">
        <h3>{display}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;

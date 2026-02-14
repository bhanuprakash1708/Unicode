import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const RatingGraph = ({ stats }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const contestHistory = stats?.contestHistory || [];

  const currentRating = stats?.rating || contestHistory.at(-1)?.rating || 'N/A';
  const minRating = Math.min(...contestHistory.map(c => c.rating)) - 10;
  const maxRating = Math.max(...contestHistory.map(c => c.rating)) + 10;
  const ratingRange = maxRating - minRating;

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = 100 * contestHistory.length;
  const graphHeight = 300;

  const handlePointClick = (contest, i, e) => {
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
      setSelectedPoint(contest);
      setTooltipPosition({ x, y });
    }
  };

  const handleTouch = (contest, i, e) => {
    if (svgRef.current) {
      const touch = e.touches[0];
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = touch.clientX - svgRect.left;
      const y = touch.clientY - svgRect.top;
      setSelectedPoint(contest);
      setTooltipPosition({ x, y });
    }
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel - e.deltaY * 0.001));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  }, [isDragging, startPan.x, startPan.y]);

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isDragging, startPan, handleMouseMove, handleWheel]);

  if (!contestHistory.length) {
    return (
      <motion.div className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 text-center shadow-lg backdrop-blur-sm">
        <p className="text-[var(--text-muted)]">No contest history found</p>
      </motion.div>
    );
  }

  const createLinePath = () => {
    const pointWidth = graphWidth / (contestHistory.length - 1);
    return contestHistory.map((c, i) => {
      const x = i * pointWidth;
      const y = graphHeight - ((c.rating - minRating) / ratingRange) * graphHeight;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };

  const createAreaPath = () => {
    const pointWidth = graphWidth / (contestHistory.length - 1);
    const path = contestHistory.map((c, i) => {
      const x = i * pointWidth;
      const y = graphHeight - ((c.rating - minRating) / ratingRange) * graphHeight;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
    return `${path} L${(contestHistory.length - 1) * pointWidth},${graphHeight} L0,${graphHeight} Z`;
  };

  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const rating = minRating + (ratingRange / 5) * i;
    const y = graphHeight - ((rating - minRating) / ratingRange) * graphHeight;
    yTicks.push({ rating: Math.round(rating), y });
  }

  return (
    <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-xl">
      <div className="mb-4">
        <h2 className="text-3xl font-semibold text-[var(--text-primary)]">{currentRating}</h2>
        <p className="text-sm text-[var(--text-muted)]">
          {contestHistory.at(-1)?.date} | {contestHistory.at(-1)?.contest?.title} | Rank: {contestHistory.at(-1)?.ranking}
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative h-80 w-full overflow-hidden rounded-md border border-[var(--border-muted)] bg-[var(--surface-strong)]"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${graphWidth} ${graphHeight + padding.top + padding.bottom}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center',
            transition: 'transform 0.1s ease'
          }}
        >
          <defs>
            <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--brand-color) 88%, #facc15)" stopOpacity="0.78" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--brand-color) 88%, #facc15)" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {yTicks.map((tick, i) => (
            <g key={i} transform={`translate(0, ${padding.top + tick.y})`}>
              <line x1="0" y1="0" x2={graphWidth} y2="0" stroke="var(--border-muted)" strokeDasharray="4" />
              <text x="-5" y="3" textAnchor="end" fill="var(--text-muted)" fontSize="10">{tick.rating}</text>
            </g>
          ))}

          <g transform={`translate(0, ${padding.top})`}>
            <path d={createAreaPath()} fill="url(#ratingGradient)" />
            <path d={createLinePath()} fill="none" stroke="var(--brand-color)" strokeWidth="3" strokeLinecap="round" />

            {contestHistory.map((c, i) => {
              const pointWidth = graphWidth / (contestHistory.length - 1);
              const x = i * pointWidth;
              const y = graphHeight - ((c.rating - minRating) / ratingRange) * graphHeight;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={selectedPoint === c ? 6 : 4}
                  fill={selectedPoint === c ? "var(--surface-strong)" : "var(--brand-color)"}
                  stroke="var(--text-primary)"
                  strokeWidth="1"
                  onClick={(e) => handlePointClick(c, i, e)}
                  onTouchStart={(e) => handleTouch(c, i, e)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </g>
        </svg>

        {selectedPoint && (
          <div
            className="absolute z-50 rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-3 text-xs text-[var(--text-primary)] shadow-md backdrop-blur-sm"
            style={{ left: tooltipPosition.x, top: tooltipPosition.y - 80, pointerEvents: 'none' }}
          >
            <p className="font-semibold">{selectedPoint.contest?.title}</p>
            <p>Date: {selectedPoint.date}</p>
            <p>Rating: {selectedPoint.rating}</p>
            <p>Rank: {selectedPoint.ranking}</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Best Rating</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{Math.max(...contestHistory.map(c => c.rating))}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--text-muted)]">Best Rank</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{Math.min(...contestHistory.map(c => c.ranking))}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--text-muted)]">Contests</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{contestHistory.length}</p>
        </div>
      </div>
    </div>
  );
};

export default RatingGraph;

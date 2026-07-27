import React, { useRef, useEffect, useState } from 'react';
import { TelemetryPoint } from '../types';
import { Play, Pause, RotateCcw, FastForward, ZoomIn, ZoomOut, Target, Compass } from 'lucide-react';
import { ATMOSPHERIC_LAYERS } from '../physics/constants';

interface TrajectoryCanvasProps {
  telemetry: TelemetryPoint[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  selectedRocketName: string;
  comparisonTelemetry?: TelemetryPoint[] | null;
  comparisonRocketName?: string;
}

export const TrajectoryCanvas: React.FC<TrajectoryCanvasProps> = ({
  telemetry,
  currentIndex,
  onIndexChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange,
  selectedRocketName,
  comparisonTelemetry,
  comparisonRocketName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showAtmosphere, setShowAtmosphere] = useState<boolean>(true);
  const [viewFocus, setViewFocus] = useState<'booster' | 'orbital'>('orbital');

  const currentPoint = telemetry[currentIndex] || telemetry[0];

  // Keyboard shortcuts event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        onIndexChange(Math.max(0, currentIndex - step));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        onIndexChange(Math.min(telemetry.length - 1, currentIndex + step));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isPlaying, telemetry.length, onPlayPause, onIndexChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp canvas rendering
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear Background
    ctx.fillStyle = '#0F1115';
    ctx.fillRect(0, 0, width, height);

    // Stars Background
    ctx.fillStyle = 'rgba(240, 246, 252, 0.3)';
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137.5) % width;
      const sy = (i * 91.3) % (height * 0.6);
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }

    // Touchdown location from telemetry
    const touchdownPoint =
      telemetry.find((pt) => pt.phase === 'TOUCHDOWN') ||
      telemetry.slice().reverse().find((pt) => pt.altitude <= 5) ||
      telemetry[telemetry.length - 1];

    const landingDownrange = touchdownPoint ? touchdownPoint.downrange : 280000;

    // Dynamic World Bounds Calculation
    let peakAlt = 100000;
    let peakRange = 280000;
    let minRange = 0;

    if (telemetry.length > 0) {
      telemetry.forEach((pt) => {
        if (pt.altitude > peakAlt) peakAlt = pt.altitude;
        if (pt.downrange > peakRange) peakRange = pt.downrange;
        if (pt.downrange < minRange) minRange = pt.downrange;

        // Stage 2 trajectory bounds
        if (viewFocus === 'orbital' || pt.secondStageAltitude !== undefined) {
          if (pt.secondStageAltitude && pt.secondStageAltitude > peakAlt) peakAlt = pt.secondStageAltitude;
          if (pt.secondStageDownrange && pt.secondStageDownrange > peakRange) peakRange = pt.secondStageDownrange;
          if (pt.secondStageDownrange && pt.secondStageDownrange < minRange) minRange = pt.secondStageDownrange;
        }
      });
    }

    if (landingDownrange > peakRange) {
      peakRange = landingDownrange;
    }

    // Minimum left downrange bound so SLC-40 (0 km) is inset from left edge
    const minRangeMeters = Math.min(-20000, minRange - 15000);

    // Apply 35% top headroom and 18% right margin scaling to ensure purple line and all paths fit smoothly:
    const maxAlt = (peakAlt * 1.35) / zoomLevel;
    const maxRange = (peakRange * 1.18) / zoomLevel;
    const minAlt = -6000;

    const rangeSpan = maxRange - minRangeMeters;
    const altSpan = maxAlt - minAlt;

    const paddingBottom = 32;
    const paddingLeft = 45;

    const plotWidth = width - paddingLeft - 15;
    const plotHeight = height - paddingBottom - 15;

    // Mapping Functions: Physics meters -> Screen Pixels (clamped to prevent clipping above graph)
    const toScreenX = (rangeM: number) => paddingLeft + ((rangeM - minRangeMeters) / rangeSpan) * plotWidth;
    const toScreenY = (altM: number) => {
      const y = height - paddingBottom - ((altM - minAlt) / altSpan) * plotHeight;
      return Math.max(12, y); // Safe padding from top canvas edge
    };

    // 1. Draw Atmospheric Layers
    if (showAtmosphere) {
      ATMOSPHERIC_LAYERS.forEach((layer) => {
        const yTop = toScreenY(layer.maxAlt);
        const yBottom = layer.name === 'Troposphere' ? toScreenY(0) : toScreenY(ATMOSPHERIC_LAYERS[ATMOSPHERIC_LAYERS.indexOf(layer) - 1]?.maxAlt || 0);
        
        if (yBottom > 0 && yTop < height) {
          const layerH = Math.max(0, yBottom - yTop);
          ctx.fillStyle = layer.color;
          ctx.fillRect(paddingLeft, yTop, plotWidth, layerH);

          // Layer Label
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(layer.name.toUpperCase(), paddingLeft + 10, yTop + 14);
        }
      });
    }

    // 2. Grid & Scale Lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)'; // slate-700
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Altitude lines (0km, 50km, 100km Kármán Line, 150km, 200km, 250km, 300km)
    [0, 50000, 100000, 150000, 200000, 250000, 300000].forEach((altM) => {
      const sy = toScreenY(altM);
      if (sy >= 20 && sy <= height - paddingBottom) {
        ctx.beginPath();
        ctx.moveTo(paddingLeft, sy);
        ctx.lineTo(width - 20, sy);
        ctx.stroke();

        ctx.fillStyle = altM === 100000 ? '#e2e8f0' : 'rgba(148, 163, 184, 0.7)';
        ctx.font = altM === 100000 ? 'bold 11px JetBrains Mono' : '10px JetBrains Mono';
        ctx.fillText(altM === 100000 ? '100 km (KÁRMÁN LINE)' : `${altM / 1000} km`, 5, sy + 4);
      }
    });

    // Downrange Distance grid lines (0km, 100km, 200km, 300km)
    [0, 100000, 200000, 300000].forEach((rangeM) => {
      const sx = toScreenX(rangeM);
      if (sx >= paddingLeft && sx <= width - 20) {
        ctx.beginPath();
        ctx.moveTo(sx, 20);
        ctx.lineTo(sx, height - paddingBottom);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`${rangeM / 1000} km`, sx - 15, height - 10);
      }
    });

    ctx.setLineDash([]); // Reset dashed lines

    // 3. Draw Earth Ocean Surface & Drone Ship ASDS Landing Target
    const oceanY = toScreenY(0);
    const gradOcean = ctx.createLinearGradient(0, oceanY, 0, height);
    gradOcean.addColorStop(0, '#0f172a');
    gradOcean.addColorStop(1, '#020617');
    ctx.fillStyle = gradOcean;
    ctx.fillRect(paddingLeft, oceanY, plotWidth, height - oceanY);

    // Earth Ocean Line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, oceanY);
    ctx.lineTo(width - 20, oceanY);
    ctx.stroke();

    // ASDS Drone Ship Target ("Of Course I Still Love You") at exact landing downrange
    const asdsX = toScreenX(landingDownrange);
    if (asdsX >= paddingLeft - 20 && asdsX <= width - 10) {
      // Barge hull
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(asdsX - 25, oceanY - 5, 50, 7);
      
      // Landing target rings on barge deck
      ctx.strokeStyle = '#f59e0b'; // Amber ring
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(asdsX, oceanY - 5, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Pink center landing bullseye crosshair
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(asdsX - 5, oceanY - 5);
      ctx.lineTo(asdsX + 5, oceanY - 5);
      ctx.moveTo(asdsX, oceanY - 10);
      ctx.lineTo(asdsX, oceanY - 0);
      ctx.stroke();

      // Target Label showing exact landing distance
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(`ASDS DRONE SHIP (${(landingDownrange / 1000).toFixed(1)} km)`, asdsX - 55, oceanY + 16);
    }

    // Launch Pad LZ-1
    const lzX = toScreenX(0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(lzX - 10, oceanY - 3, 20, 5);
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText('SLC-40 / LZ-1', lzX - 20, oceanY + 16);

    // 4. Draw Trajectory Line (Full Predicted Path & Active Flight Path)
    if (telemetry.length > 1) {
      // Draw Overlay Comparison Trajectory if available
      if (comparisonTelemetry && comparisonTelemetry.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#F59E0B'; // Dashed Amber
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);

        for (let i = 0; i < comparisonTelemetry.length; i++) {
          const pt = comparisonTelemetry[i];
          const sx = toScreenX(pt.downrange);
          const sy = toScreenY(pt.altitude);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw active position on comparison run
        const compPt = comparisonTelemetry[Math.min(currentIndex, comparisonTelemetry.length - 1)];
        if (compPt) {
          const csx = toScreenX(compPt.downrange);
          const csy = toScreenY(compPt.altitude);

          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(csx, csy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText(`Compare: ${comparisonRocketName || 'Baseline'} (${(compPt.altitude / 1000).toFixed(0)}km)`, csx + 8, csy - 4);
        }
      }

      // Full Predicted Stage 1 Booster Trajectory Line in Pink (#f43f5e)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)'; // Ghosted Pink predicted landing arc
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);

      for (let i = 0; i < telemetry.length; i++) {
        const pt = telemetry[i];
        const sx = toScreenX(pt.downrange);
        const sy = toScreenY(pt.altitude);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Active Booster Stage 1 Ascent & Pink Landing Path
      ctx.lineWidth = 2.5;

      for (let i = 0; i < currentIndex; i++) {
        const pt1 = telemetry[i];
        const pt2 = telemetry[i + 1];
        if (!pt2) break;

        const sx1 = toScreenX(pt1.downrange);
        const sy1 = toScreenY(pt1.altitude);
        const sx2 = toScreenX(pt2.downrange);
        const sy2 = toScreenY(pt2.altitude);

        // Highlight return/landing path in bright Pink (#f43f5e), launch in Cyan (#38bdf8)
        const isLandingPhase =
          pt1.phase === 'BOOSTBACK_BURN' ||
          pt1.phase === 'GRID_FIN_REENTRY' ||
          pt1.phase === 'ENTRY_BURN' ||
          pt1.phase === 'TRANSONIC_DESCENT' ||
          pt1.phase === 'SUICIDE_BURN' ||
          pt1.phase === 'TOUCHDOWN';

        ctx.beginPath();
        ctx.strokeStyle = isLandingPhase ? '#f43f5e' : '#38bdf8';
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }

      // Second Stage Path (if active)
      ctx.beginPath();
      ctx.strokeStyle = '#c084fc'; // Purple second stage path
      ctx.lineWidth = 2;
      let s2Started = false;

      for (let i = 0; i <= currentIndex; i++) {
        const pt = telemetry[i];
        if (pt.secondStageAltitude !== undefined && pt.secondStageDownrange !== undefined) {
          const sx = toScreenX(pt.secondStageDownrange);
          const sy = toScreenY(pt.secondStageAltitude);
          if (!s2Started) {
            ctx.moveTo(sx, sy);
            s2Started = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
      }
      if (s2Started) ctx.stroke();
    }

    // 5. Draw Rocket Vehicle & Exhaust Flames at Current Frame
    if (currentPoint) {
      const rx = toScreenX(currentPoint.downrange);
      const ry = toScreenY(currentPoint.altitude);

      // Rocket Icon & Orientation
      ctx.save();
      ctx.translate(rx, ry);
      
      // Pitch Rotation (0deg = straight up)
      const pitchRad = (currentPoint.pitchAngle * Math.PI) / 180;
      ctx.rotate(pitchRad);

      // Rocket Hull
      ctx.fillStyle = '#f8fafc'; // White body
      ctx.fillRect(-3, -15, 6, 30);
      
      // Black interstage / nose cone
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-3, -15);
      ctx.lineTo(0, -22);
      ctx.lineTo(3, -15);
      ctx.closePath();
      ctx.fill();

      // Titanium Grid Fins (if in descent / grid fin phase)
      if (currentPoint.phase === 'GRID_FIN_REENTRY' || currentPoint.phase === 'TRANSONIC_DESCENT' || currentPoint.phase === 'SUICIDE_BURN') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-8, -10, 5, 2);
        ctx.fillRect(3, -10, 5, 2);
      }

      // Exhaust Plume Particle Flame (if thrust > 0)
      if (currentPoint.thrustFirstStage > 0) {
        const thrustRatio = Math.min(1, currentPoint.thrustFirstStage / 8000);
        const plumeLength = 20 * thrustRatio + Math.random() * 8;

        const flameGrad = ctx.createLinearGradient(0, 15, 0, 15 + plumeLength);
        flameGrad.addColorStop(0, '#38bdf8'); // Plasma core
        flameGrad.addColorStop(0.3, '#f59e0b'); // Amber flame
        flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-3, 15);
        ctx.lineTo(0, 15 + plumeLength);
        ctx.lineTo(3, 15);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Second Stage Vehicle (if active)
      if (currentPoint.secondStageAltitude !== undefined && currentPoint.secondStageDownrange !== undefined) {
        const s2x = toScreenX(currentPoint.secondStageDownrange);
        const s2y = toScreenY(currentPoint.secondStageAltitude);

        ctx.save();
        ctx.translate(s2x, s2y);
        ctx.rotate((85 * Math.PI) / 180); // Nearly horizontal
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(-2, -8, 4, 16);
        
        if (currentPoint.thrustSecondStage > 0) {
          ctx.fillStyle = '#e879f9';
          ctx.beginPath();
          ctx.moveTo(-2, 8);
          ctx.lineTo(0, 20);
          ctx.lineTo(2, 8);
          ctx.fill();
        }
        ctx.restore();
      }

      // 6. Draw Vector Overlays (Velocity, Thrust, Drag)
      if (showVectors && currentPoint.velocity > 0) {
        // Velocity Vector (Green)
        const vScale = 0.015;
        const vxPx = currentPoint.vx * vScale;
        const vyPx = -currentPoint.vy * vScale;

        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + vxPx, ry + vyPx);
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(`v=${Math.round(currentPoint.velocity)}m/s`, rx + vxPx + 4, ry + vyPx);

        // Drag Vector (Red)
        if (currentPoint.dragForce > 5) {
          const dScale = 0.05;
          const dragX = -(currentPoint.vx / currentPoint.velocity) * currentPoint.dragForce * dScale;
          const dragY = (currentPoint.vy / currentPoint.velocity) * currentPoint.dragForce * dScale;

          ctx.strokeStyle = '#f87171';
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + dragX, ry + dragY);
          ctx.stroke();
        }
      }

      // Callout Label Card on Vehicle (Clamped inside Canvas Viewport)
      const cardW = 175;
      const cardH = 50;

      let cardX = rx + 12;
      let cardY = ry - 32;

      // Horizontal clamping
      if (cardX + cardW > width - 10) {
        cardX = rx - cardW - 12;
      }
      if (cardX < paddingLeft) {
        cardX = paddingLeft + 5;
      }

      // Vertical clamping
      if (cardY < 10) {
        cardY = ry + 15;
      }
      if (cardY + cardH > height - paddingBottom) {
        cardY = height - paddingBottom - cardH - 5;
      }

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(`T+${currentPoint.time.toFixed(1)}s: ${currentPoint.phase}`, cardX + 8, cardY + 14);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`Alt: ${(currentPoint.altitude / 1000).toFixed(1)} km | Speed: Mach ${currentPoint.mach}`, cardX + 8, cardY + 28);
      ctx.fillText(`q: ${currentPoint.dynamicPressure.toFixed(1)} kPa | Acc: ${currentPoint.gForce.toFixed(1)} G`, cardX + 8, cardY + 40);
    }
  }, [telemetry, currentIndex, zoomLevel, showVectors, showAtmosphere, viewFocus]);

  return (
    <div className="flex flex-col bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#0D1117] border-b border-[#30363D] text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-[#38BDF8] font-bold font-mono text-[11px] sm:text-xs">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>2D TRAJECTORY ENGINE</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#C9D1D9] font-mono border border-[#30363D] text-[10px]">
            {selectedRocketName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {/* View Focus Mode Selector */}
          <div className="flex items-center bg-[#21262D] border border-[#30363D] rounded-lg p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setViewFocus('booster')}
              className={`px-2 py-0.5 rounded transition ${
                viewFocus === 'booster'
                  ? 'bg-[#f43f5e] text-white font-bold'
                  : 'text-[#8B949E] hover:text-white'
              }`}
            >
              Booster Focus
            </button>
            <button
              onClick={() => setViewFocus('orbital')}
              className={`px-2 py-0.5 rounded transition ${
                viewFocus === 'orbital'
                  ? 'bg-[#3B82F6] text-white font-bold'
                  : 'text-[#8B949E] hover:text-white'
              }`}
            >
              Full Orbit Focus
            </button>
          </div>

          <label className="flex items-center space-x-1 cursor-pointer text-[#C9D1D9] hover:text-white">
            <input
              type="checkbox"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="accent-[#38BDF8] rounded w-3 h-3"
            />
            <span>Vectors</span>
          </label>

          <label className="flex items-center space-x-1 cursor-pointer text-[#C9D1D9] hover:text-white">
            <input
              type="checkbox"
              checked={showAtmosphere}
              onChange={(e) => setShowAtmosphere(e.target.checked)}
              className="accent-[#38BDF8] rounded w-3 h-3"
            />
            <span>Atmosphere</span>
          </label>

          <div className="flex items-center space-x-1 bg-[#21262D] border border-[#30363D] rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1 hover:bg-[#30363D] rounded text-[#C9D1D9] hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <span className="px-1 text-[10px] font-mono text-[#38BDF8]">{zoomLevel.toFixed(2)}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:bg-[#30363D] rounded text-[#C9D1D9] hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport - Height expanded for high resolution viewing */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-[#0F1115]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Interactive Controls & Timeline Scrubber */}
      <div className="p-4 bg-[#0D1117] border-t border-[#30363D] space-y-3">
        {/* Timeline Progress Slider */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-[#38BDF8] w-16">
            T+{(currentPoint?.time || 0).toFixed(1)}s
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, telemetry.length - 1)}
            value={currentIndex}
            onChange={(e) => onIndexChange(Number(e.target.value))}
            className="flex-1 accent-[#38BDF8] h-2 bg-[#21262D] rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-[#8B949E] w-16 text-right">
            T+{(telemetry[telemetry.length - 1]?.time || 0).toFixed(0)}s
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onPlayPause}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs transition shadow-lg shadow-blue-500/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'PAUSE SIMULATION' : 'RUN TRAJECTORY'}</span>
            </button>

            <button
              onClick={() => onIndexChange(0)}
              className="p-2 rounded-xl bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#C9D1D9] transition"
              title="Reset to Liftoff T-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden lg:flex items-center space-x-1.5 text-[10px] font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded-xl">
              <kbd className="bg-[#21262D] text-[#38BDF8] px-1.5 py-0.5 rounded border border-[#30363D] font-bold">Space</kbd>
              <span>Play/Pause</span>
              <span className="text-[#30363D] mx-0.5">|</span>
              <kbd className="bg-[#21262D] text-[#38BDF8] px-1.5 py-0.5 rounded border border-[#30363D] font-bold">← / →</kbd>
              <span>Seek</span>
            </div>
          </div>

          {/* Phase Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#38BDF8]/30">
            <Target className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
            <span className="text-xs font-mono text-[#F0F6FC]">
              {currentPoint?.phaseLabel || 'Initializing Flight Computer...'}
            </span>
          </div>

          {/* Playback Speed Switcher */}
          <div className="flex items-center space-x-1 bg-[#21262D] border border-[#30363D] rounded-xl p-1">
            {[1, 2, 5, 10].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition ${
                  playbackSpeed === speed
                    ? 'bg-[#3B82F6] text-white font-bold'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { TelemetryPoint } from '../types';
import { Activity, Gauge, Flame, Navigation, Weight, Wind, ArrowUpRight } from 'lucide-react';

interface TelemetryPanelProps {
  currentPoint: TelemetryPoint;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ currentPoint }) => {
  if (!currentPoint) return null;

  const kmh = Math.round(currentPoint.velocity * 3.6);
  const isMaxQActive = currentPoint.phase === 'MAX_Q';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Altitude */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/50 transition">
        <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Altitude (h)</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#38BDF8]" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold font-mono text-[#F0F6FC]">
            {(currentPoint.altitude / 1000).toFixed(1)}
          </span>
          <span className="text-xs text-[#38BDF8] font-mono font-semibold">km</span>
        </div>
        <div className="text-[10px] text-[#8B949E] font-mono mt-1">
          {currentPoint.altitude.toLocaleString()} m MSL
        </div>
      </div>

      {/* 2. Velocity & Mach */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/50 transition">
        <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Speed (v)</span>
          <Gauge className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold font-mono text-emerald-400">
            {currentPoint.velocity.toFixed(0)}
          </span>
          <span className="text-xs text-emerald-300 font-mono font-semibold">m/s</span>
        </div>
        <div className="text-[10px] text-[#8B949E] font-mono mt-1 flex justify-between">
          <span>{kmh.toLocaleString()} km/h</span>
          <span className="text-[#38BDF8] font-bold">Mach {currentPoint.mach}</span>
        </div>
      </div>

      {/* 3. Dynamic Pressure q (Max Q) */}
      <div className={`bg-[#161B22] border rounded-xl p-3 shadow-lg relative overflow-hidden transition ${
        isMaxQActive ? 'border-amber-500 bg-amber-500/10 animate-pulse' : 'border-[#30363D] hover:border-[#38BDF8]/50'
      }`}>
        <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Dynamic Pressure (q)</span>
          <Wind className={`w-3.5 h-3.5 ${isMaxQActive ? 'text-amber-400' : 'text-[#38BDF8]'}`} />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className={`text-2xl font-extrabold font-mono ${isMaxQActive ? 'text-amber-400' : 'text-[#F0F6FC]'}`}>
            {currentPoint.dynamicPressure.toFixed(1)}
          </span>
          <span className="text-xs text-[#38BDF8] font-mono font-semibold">kPa</span>
        </div>
        <div className="text-[10px] text-[#8B949E] font-mono mt-1">
          {isMaxQActive ? '⚠️ MAX Q STRUCTURAL PEAK' : `Drag: ${currentPoint.dragForce} kN`}
        </div>
      </div>

      {/* 4. Acceleration & G-Force */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/50 transition">
        <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">G-Force</span>
          <Activity className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold font-mono text-purple-300">
            {currentPoint.gForce.toFixed(1)}
          </span>
          <span className="text-xs text-purple-400 font-mono font-semibold">Gs</span>
        </div>
        <div className="text-[10px] text-[#8B949E] font-mono mt-1">
          Acc: {currentPoint.acceleration.toFixed(1)} m/s²
        </div>
      </div>

      {/* 5. First Stage Mass & Thrust */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/50 transition">
        <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Booster Mass & Thrust</span>
          <Flame className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold font-mono text-[#F0F6FC]">
            {(currentPoint.massFirstStage / 1000).toFixed(0)}
          </span>
          <span className="text-xs text-amber-400 font-mono font-semibold">Tons</span>
        </div>
        <div className="text-[10px] text-[#8B949E] font-mono mt-1">
          Thrust: {currentPoint.thrustFirstStage.toLocaleString()} kN
        </div>
      </div>

      {/* 6. Pitch Angle & Downrange */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/50 transition">
        <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Pitch & Range</span>
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold font-mono text-[#F0F6FC]">
            {currentPoint.pitchAngle.toFixed(0)}°
          </span>
          <span className="text-xs text-blue-400 font-mono font-semibold">pitch</span>
        </div>
        <div className="text-[10px] text-[#8B949E] font-mono mt-1">
          Downrange: {(currentPoint.downrange / 1000).toFixed(1)} km
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TelemetryPoint } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { LineChart as ChartIcon, Zap, Gauge, Wind, Activity } from 'lucide-react';

interface TelemetryChartsProps {
  telemetry: TelemetryPoint[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

type ChartTab = 'alt_vel' | 'max_q' | 'g_force' | 'trajectory_profile';

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  telemetry,
  currentIndex,
  onIndexChange,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('alt_vel');

  const currentPoint = telemetry[currentIndex] || telemetry[0];

  // Downsample data points for smooth chart performance (1 point every 2 seconds)
  const chartData = telemetry.filter((_, idx) => idx % 2 === 0).map((pt) => ({
    time: pt.time,
    altitudeKm: Number((pt.altitude / 1000).toFixed(1)),
    velocityMs: Math.round(pt.velocity),
    mach: Number(pt.mach.toFixed(1)),
    dynamicPressurekPa: Number(pt.dynamicPressure.toFixed(1)),
    gForce: Number(pt.gForce.toFixed(1)),
    downrangeKm: Number((pt.downrange / 1000).toFixed(1)),
    phase: pt.phase,
  }));

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 shadow-2xl space-y-3">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#30363D] pb-2.5">
        <div className="flex items-center space-x-2 text-[#38BDF8] font-bold font-mono text-xs sm:text-sm">
          <ChartIcon className="w-4 h-4" />
          <span>TELEMETRY ANALYTICS & CURVE INTEGRATION</span>
        </div>

        <div className="flex flex-wrap gap-1 bg-[#0D1117] p-1 rounded-xl border border-[#30363D] text-[11px]">
          <button
            onClick={() => setActiveTab('alt_vel')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-mono transition ${
              activeTab === 'alt_vel'
                ? 'bg-[#3B82F6] text-white font-bold'
                : 'text-[#8B949E] hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Alt & Velocity</span>
          </button>

          <button
            onClick={() => setActiveTab('max_q')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-mono transition ${
              activeTab === 'max_q'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-[#8B949E] hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Max Q</span>
          </button>

          <button
            onClick={() => setActiveTab('g_force')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-mono transition ${
              activeTab === 'g_force'
                ? 'bg-purple-500 text-slate-950 font-bold'
                : 'text-[#8B949E] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>G-Forces</span>
          </button>

          <button
            onClick={() => setActiveTab('trajectory_profile')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-mono transition ${
              activeTab === 'trajectory_profile'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-[#8B949E] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2D Arc</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Viewports - Dense Aspect Ratio */}
      <div className="h-[220px] sm:h-[240px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'alt_vel' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="time" stroke="#8B949E" tick={{ fontSize: 11 }} label={{ value: 'Flight Time (seconds)', position: 'insideBottom', offset: -5, fill: '#8B949E', fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#38BDF8" tick={{ fontSize: 11 }} label={{ value: 'Altitude (km)', angle: -90, position: 'insideLeft', fill: '#38BDF8', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#4ade80" tick={{ fontSize: 11 }} label={{ value: 'Velocity (m/s)', angle: 90, position: 'insideRight', fill: '#4ade80', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '12px', color: '#F0F6FC' }} />
              <ReferenceLine x={currentPoint?.time} stroke="#f43f5e" strokeWidth={2} label={{ value: 'T-NOW', fill: '#f43f5e', fontSize: 10 }} />
              <Line yAxisId="left" type="monotone" dataKey="altitudeKm" name="Altitude (km)" stroke="#38BDF8" strokeWidth={2.5} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="velocityMs" name="Velocity (m/s)" stroke="#4ade80" strokeWidth={2.5} dot={false} />
            </LineChart>
          ) : activeTab === 'max_q' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="time" stroke="#8B949E" tick={{ fontSize: 11 }} label={{ value: 'Flight Time (seconds)', position: 'insideBottom', offset: -5, fill: '#8B949E', fontSize: 11 }} />
              <YAxis stroke="#f59e0b" tick={{ fontSize: 11 }} label={{ value: 'Dynamic Pressure q (kPa)', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '12px', color: '#F0F6FC' }} />
              <ReferenceLine x={currentPoint?.time} stroke="#f43f5e" strokeWidth={2} />
              <ReferenceLine y={32} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Max Q Structural Limit (~32 kPa)', fill: '#ef4444', fontSize: 10 }} />
              <Line type="monotone" dataKey="dynamicPressurekPa" name="Dynamic Pressure q (kPa)" stroke="#f59e0b" strokeWidth={3} dot={false} />
            </LineChart>
          ) : activeTab === 'g_force' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="time" stroke="#8B949E" tick={{ fontSize: 11 }} label={{ value: 'Flight Time (seconds)', position: 'insideBottom', offset: -5, fill: '#8B949E', fontSize: 11 }} />
              <YAxis stroke="#c084fc" tick={{ fontSize: 11 }} label={{ value: 'Acceleration G-Force (Gs)', angle: -90, position: 'insideLeft', fill: '#c084fc', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '12px', color: '#F0F6FC' }} />
              <ReferenceLine x={currentPoint?.time} stroke="#f43f5e" strokeWidth={2} />
              <ReferenceLine y={4} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Human / Payload Max G Cap (4 Gs)', fill: '#f43f5e', fontSize: 10 }} />
              <Line type="monotone" dataKey="gForce" name="G-Force (Gs)" stroke="#c084fc" strokeWidth={2.5} dot={false} />
            </LineChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="downrangeKm" stroke="#8B949E" tick={{ fontSize: 11 }} label={{ value: 'Downrange Distance (km)', position: 'insideBottom', offset: -5, fill: '#8B949E', fontSize: 11 }} />
              <YAxis stroke="#f43f5e" tick={{ fontSize: 11 }} label={{ value: 'Altitude (km)', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '12px', color: '#F0F6FC' }} />
              <Line type="monotone" dataKey="altitudeKm" name="Booster Trajectory Arc" stroke="#f43f5e" strokeWidth={3} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

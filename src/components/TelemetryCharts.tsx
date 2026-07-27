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
import { LineChart as ChartIcon, Zap, Gauge, Wind, Activity, Download } from 'lucide-react';

interface TelemetryChartsProps {
  telemetry: TelemetryPoint[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  comparisonTelemetry?: TelemetryPoint[] | null;
  comparisonRocketName?: string;
}

type ChartTab = 'alt_vel' | 'max_q' | 'g_force' | 'trajectory_profile';

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  telemetry,
  currentIndex,
  onIndexChange,
  comparisonTelemetry,
  comparisonRocketName,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('alt_vel');

  const currentPoint = telemetry[currentIndex] || telemetry[0];

  const handleDownloadCSV = () => {
    if (!telemetry || telemetry.length === 0) return;

    const headers = [
      'Time (s)',
      'Altitude (m)',
      'Downrange (m)',
      'Horizontal Velocity (m/s)',
      'Vertical Velocity (m/s)',
      'Total Velocity (m/s)',
      'Mach',
      'Acceleration (m/s2)',
      'G-Force',
      'Dynamic Pressure (kPa)',
      'Booster Mass (kg)',
      'Upper Stage Mass (kg)',
      'Pitch Angle (deg)',
      'Angle of Attack (deg)',
      'Thrust Stage 1 (kN)',
      'Thrust Stage 2 (kN)',
      'Drag Force (kN)',
      'Atmospheric Density (kg/m3)',
      'Flight Phase',
    ];

    const csvRows = [headers.join(',')];

    telemetry.forEach((pt) => {
      const row = [
        pt.time,
        pt.altitude,
        pt.downrange,
        pt.vx,
        pt.vy,
        pt.velocity,
        pt.mach,
        pt.acceleration,
        pt.gForce,
        pt.dynamicPressure,
        pt.massFirstStage,
        pt.massSecondStage,
        pt.pitchAngle,
        pt.angleOfAttack,
        pt.thrustFirstStage,
        pt.thrustSecondStage,
        pt.dragForce,
        pt.atmosphericDensity,
        `"${pt.phaseLabel.replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SpaceX_Trajectory_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Downsample data points for smooth chart performance (1 point every 2 seconds)
  const chartData = telemetry.filter((_, idx) => idx % 2 === 0).map((pt, idx) => {
    const compPt = comparisonTelemetry && comparisonTelemetry[idx * 2];
    return {
      time: pt.time,
      altitudeKm: Number((pt.altitude / 1000).toFixed(1)),
      velocityMs: Math.round(pt.velocity),
      mach: Number(pt.mach.toFixed(1)),
      dynamicPressurekPa: Number(pt.dynamicPressure.toFixed(1)),
      gForce: Number(pt.gForce.toFixed(1)),
      downrangeKm: Number((pt.downrange / 1000).toFixed(1)),
      phase: pt.phase,
      // Comparison metrics
      compAltitudeKm: compPt ? Number((compPt.altitude / 1000).toFixed(1)) : undefined,
      compVelocityMs: compPt ? Math.round(compPt.velocity) : undefined,
      compDynamicPressurekPa: compPt ? Number(compPt.dynamicPressure.toFixed(1)) : undefined,
      compGForce: compPt ? Number(compPt.gForce.toFixed(1)) : undefined,
    };
  });

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 shadow-2xl space-y-3">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#30363D] pb-2.5">
        <div className="flex items-center space-x-2 text-[#38BDF8] font-bold font-mono text-xs sm:text-sm">
          <ChartIcon className="w-4 h-4" />
          <span>TELEMETRY ANALYTICS & CURVE INTEGRATION</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#38BDF8] border border-[#30363D] text-[11px] font-mono font-bold transition shadow-sm"
            title="Export full trajectory telemetry dataset as CSV file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Telemetry CSV</span>
          </button>

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
              {comparisonTelemetry && (
                <>
                  <Line yAxisId="left" type="monotone" dataKey="compAltitudeKm" name={`Compare: ${comparisonRocketName || 'Baseline'} Alt (km)`} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="compVelocityMs" name={`Compare: ${comparisonRocketName || 'Baseline'} Vel (m/s)`} stroke="#ec4899" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                </>
              )}
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
              {comparisonTelemetry && (
                <Line type="monotone" dataKey="compDynamicPressurekPa" name={`Compare: ${comparisonRocketName || 'Baseline'} Max Q (kPa)`} stroke="#38bdf8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              )}
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
              {comparisonTelemetry && (
                <Line type="monotone" dataKey="compGForce" name={`Compare: ${comparisonRocketName || 'Baseline'} Gs`} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              )}
            </LineChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="downrangeKm" stroke="#8B949E" tick={{ fontSize: 11 }} label={{ value: 'Downrange Distance (km)', position: 'insideBottom', offset: -5, fill: '#8B949E', fontSize: 11 }} />
              <YAxis stroke="#f43f5e" tick={{ fontSize: 11 }} label={{ value: 'Altitude (km)', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '12px', color: '#F0F6FC' }} />
              <Line type="monotone" dataKey="altitudeKm" name="Booster Trajectory Arc" stroke="#f43f5e" strokeWidth={3} dot={false} />
              {comparisonTelemetry && (
                <Line type="monotone" dataKey="compAltitudeKm" name={`Compare: ${comparisonRocketName || 'Baseline'} Arc`} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

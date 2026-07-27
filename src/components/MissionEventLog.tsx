import React, { useMemo } from 'react';
import { TelemetryPoint } from '../types';
import {
  Rocket,
  CheckCircle2,
  Clock,
  Zap,
  Radio,
  Flame,
  ShieldCheck,
  ChevronRight,
  Target,
  Wind,
  Gauge,
} from 'lucide-react';

interface MissionEventLogProps {
  telemetry: TelemetryPoint[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export interface MissionEvent {
  id: string;
  time: number;
  index: number;
  title: string;
  badgeText: string;
  description: string;
  altitudeKm: number;
  velocityMs: number;
  iconName: 'liftoff' | 'pitch' | 'maxq' | 'mach1' | 'meco' | 'sep' | 'burn' | 'entry' | 'landing' | 'orbit';
}

export const MissionEventLog: React.FC<MissionEventLogProps> = ({
  telemetry,
  currentIndex,
  onSelectIndex,
}) => {
  const currentPoint = telemetry[currentIndex] || telemetry[0] || { time: 0 };

  // Generate key milestone events from telemetry sequence
  const events = useMemo<MissionEvent[]>(() => {
    if (!telemetry || telemetry.length === 0) return [];

    const list: MissionEvent[] = [];
    const addedIds = new Set<string>();

    let foundPitch = false;
    let foundMach1 = false;
    let maxQPoint: { point: TelemetryPoint; idx: number } | null = null;
    let foundMECO = false;
    let foundSep = false;
    let foundBoostback = false;
    let foundEntry = false;
    let foundLandingBurn = false;
    let foundTouchdown = false;
    let foundOrbit = false;

    // First event: Liftoff at T+0
    list.push({
      id: 'liftoff',
      time: telemetry[0].time,
      index: 0,
      title: 'Stage 1 Ignition & Liftoff',
      badgeText: 'LIFTOFF',
      description: 'First stage engines reach full sea-level thrust (7,607 kN). Vehicle clears launch tower.',
      altitudeKm: telemetry[0].altitude / 1000,
      velocityMs: telemetry[0].velocity,
      iconName: 'liftoff',
    });
    addedIds.add('liftoff');

    let maxQVal = 0;

    telemetry.forEach((pt, idx) => {
      // Mach 1 milestone
      if (!foundMach1 && pt.mach >= 1.0) {
        foundMach1 = true;
        list.push({
          id: 'mach1',
          time: pt.time,
          index: idx,
          title: 'Transonic Crossing (Mach 1.0)',
          badgeText: 'MACH 1.0',
          description: 'Vehicle breaches speed of sound. Transonic wave drag peak encountered.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'mach1',
        });
      }

      // Pitch Kick
      if (!foundPitch && pt.phase === 'PITCH_KICK') {
        foundPitch = true;
        list.push({
          id: 'pitch_kick',
          time: pt.time,
          index: idx,
          title: 'Pitch Kick Gravity Turn Initiate',
          badgeText: 'PITCH KICK',
          description: 'RCS & gimbal initiate programmatic pitch angle toward orbital flight azimuth.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'pitch',
        });
      }

      // Track Max Q peak
      if (pt.dynamicPressure > maxQVal) {
        maxQVal = pt.dynamicPressure;
        maxQPoint = { point: pt, idx };
      }

      // MECO
      if (!foundMECO && pt.phase === 'MECO') {
        foundMECO = true;
        list.push({
          id: 'meco',
          time: pt.time,
          index: idx,
          title: 'MECO (Main Engine Cut-Off)',
          badgeText: 'MECO',
          description: 'Booster 1st stage Merlin/Raptor engines shutdown prior to stage separation.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'meco',
        });
      }

      // Stage Sep
      if (!foundSep && pt.phase === 'STAGE_SEP') {
        foundSep = true;
        list.push({
          id: 'stage_sep',
          time: pt.time,
          index: idx,
          title: 'Stage Separation & MVac Ignition',
          badgeText: 'STAGE SEP',
          description: 'Pneumatic pushers separate stages. Vacuum engine ignites to push payload to orbit.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'sep',
        });
      }

      // Boostback Burn
      if (!foundBoostback && pt.phase === 'BOOSTBACK_BURN') {
        foundBoostback = true;
        list.push({
          id: 'boostback',
          time: pt.time,
          index: idx,
          title: 'Booster Boostback Burn',
          badgeText: 'BOOSTBACK',
          description: '3 engines reignite to reverse horizontal velocity vector back toward ASDS landing zone.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'burn',
        });
      }

      // Entry Burn
      if (!foundEntry && pt.phase === 'ENTRY_BURN') {
        foundEntry = true;
        list.push({
          id: 'entry_burn',
          time: pt.time,
          index: idx,
          title: 'Re-entry Burn Ignition',
          badgeText: 'ENTRY BURN',
          description: 'Engine restart decelerates booster through dense upper atmosphere to prevent heat damage.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'entry',
        });
      }

      // Landing Burn
      if (!foundLandingBurn && pt.phase === 'SUICIDE_BURN') {
        foundLandingBurn = true;
        list.push({
          id: 'landing_burn',
          time: pt.time,
          index: idx,
          title: 'Final Landing Burn & Legs Deploy',
          badgeText: 'LANDING BURN',
          description: 'Center engine throttles up for terminal landing burn. Carbon-fiber landing legs extend.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'landing',
        });
      }

      // Touchdown
      if (!foundTouchdown && pt.phase === 'TOUCHDOWN') {
        foundTouchdown = true;
        list.push({
          id: 'touchdown',
          time: pt.time,
          index: idx,
          title: 'Booster Touchdown (ASDS / LZ-1)',
          badgeText: 'TOUCHDOWN',
          description: 'Autonomous booster precision landing complete. Zero relative velocity at surface.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'landing',
        });
      }

      // Orbital Insertion
      if (!foundOrbit && pt.phase === 'ORBITAL_INSERTION') {
        foundOrbit = true;
        list.push({
          id: 'orbital_insertion',
          time: pt.time,
          index: idx,
          title: 'SECO-1 / Orbital Insertion',
          badgeText: 'ORBIT INSERTION',
          description: 'Second stage engine shutdown. Payload achieves target circular low Earth orbit.',
          altitudeKm: pt.altitude / 1000,
          velocityMs: pt.velocity,
          iconName: 'orbit',
        });
      }
    });

    // Insert Max Q in correct chronological position
    if (maxQPoint && !addedIds.has('max_q')) {
      const qEvent: MissionEvent = {
        id: 'max_q',
        time: maxQPoint.point.time,
        index: maxQPoint.idx,
        title: `Max Q (Max Aerodynamic Pressure ${maxQPoint.point.dynamicPressure.toFixed(1)} kPa)`,
        badgeText: 'MAX Q',
        description: 'Point of maximum mechanical stress on rocket airframe. Engines throttle down.',
        altitudeKm: maxQPoint.point.altitude / 1000,
        velocityMs: maxQPoint.point.velocity,
        iconName: 'maxq',
      };
      list.push(qEvent);
    }

    // Sort chronologically by time
    list.sort((a, b) => a.time - b.time);
    return list;
  }, [telemetry]);

  const renderIcon = (iconName: MissionEvent['iconName']) => {
    switch (iconName) {
      case 'liftoff':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'pitch':
        return <Zap className="w-4 h-4 text-[#38BDF8]" />;
      case 'maxq':
        return <Wind className="w-4 h-4 text-amber-300" />;
      case 'mach1':
        return <Gauge className="w-4 h-4 text-emerald-400" />;
      case 'meco':
        return <Radio className="w-4 h-4 text-red-400" />;
      case 'sep':
        return <Rocket className="w-4 h-4 text-purple-400" />;
      case 'burn':
        return <Flame className="w-4 h-4 text-[#38BDF8]" />;
      case 'entry':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'landing':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'orbit':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      default:
        return <Clock className="w-4 h-4 text-[#8B949E]" />;
    }
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-2.5">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold font-mono text-[#F0F6FC] uppercase tracking-wider">
            MISSION EVENT LOG & MILESTONES
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#8B949E]">
          {events.length} Major Telemetry Events
        </span>
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {events.map((evt) => {
          const isPassed = currentPoint.time >= evt.time;
          const isActive = Math.abs(currentPoint.time - evt.time) <= 2.5;

          return (
            <button
              key={evt.id}
              onClick={() => onSelectIndex(evt.index)}
              className={`w-full text-left p-2.5 rounded-xl border transition flex items-start space-x-3 group relative ${
                isActive
                  ? 'bg-[#38BDF8]/10 border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : isPassed
                  ? 'bg-[#0D1117] border-[#30363D] hover:border-[#8B949E]'
                  : 'bg-[#0D1117]/60 border-[#21262D] opacity-75 hover:opacity-100'
              }`}
            >
              {/* Event Time Badge */}
              <div className="flex flex-col items-center justify-center pt-0.5">
                <span
                  className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-[#38BDF8] text-slate-950 shadow-sm animate-pulse'
                      : isPassed
                      ? 'bg-[#21262D] text-emerald-400'
                      : 'bg-[#161B22] text-[#8B949E]'
                  }`}
                >
                  T+{Math.floor(evt.time / 60) > 0 ? `${Math.floor(evt.time / 60)}m` : ''}
                  {(evt.time % 60).toFixed(0)}s
                </span>
              </div>

              {/* Icon & Details */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-[#F0F6FC] group-hover:text-[#38BDF8] transition">
                    {renderIcon(evt.iconName)}
                    <span className="truncate">{evt.title}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-black animate-bounce'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#21262D] text-[#8B949E]'
                    }`}
                  >
                    {isActive ? 'CURRENT' : isPassed ? 'PASSED' : 'UPCOMING'}
                  </span>
                </div>

                <p className="text-[11px] text-[#8B949E] line-clamp-1 leading-tight font-sans">
                  {evt.description}
                </p>

                <div className="flex items-center space-x-3 text-[10px] font-mono text-[#8B949E] pt-0.5">
                  <span>Alt: <strong className="text-[#38BDF8]">{evt.altitudeKm.toFixed(1)} km</strong></span>
                  <span>Vel: <strong className="text-emerald-400">{evt.velocityMs.toFixed(0)} m/s</strong></span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#38BDF8] transition self-center" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

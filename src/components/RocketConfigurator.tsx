import React, { useState } from 'react';
import { RocketSpec, RocketModelId } from '../types';
import { ROCKET_SPECS, EARTH_CONSTANTS } from '../physics/constants';
import { Sliders, Rocket, Weight, Navigation, CheckCircle2, ChevronDown, ChevronUp, Layers, Flame, Zap, Info } from 'lucide-react';

interface RocketConfiguratorProps {
  selectedRocket: RocketSpec;
  onSelectRocket: (rocket: RocketSpec) => void;
  payloadMass: number;
  onPayloadMassChange: (mass: number) => void;
  pitchKickTime: number;
  onPitchKickTimeChange: (time: number) => void;
  pitchKickAngle: number;
  onPitchKickAngleChange: (angle: number) => void;
}

export const RocketConfigurator: React.FC<RocketConfiguratorProps> = ({
  selectedRocket,
  onSelectRocket,
  payloadMass,
  onPayloadMassChange,
  pitchKickTime,
  onPitchKickTimeChange,
  pitchKickAngle,
  onPitchKickAngleChange,
}) => {
  const [showAllSpecs, setShowAllSpecs] = useState<boolean>(false);

  // Compute live GLOW and T/W ratio
  const glowKg =
    selectedRocket.firstStage.dryMass +
    selectedRocket.firstStage.propellantMass +
    selectedRocket.secondStage.dryMass +
    selectedRocket.secondStage.propellantMass +
    payloadMass;
  
  const liftoffThrustN = selectedRocket.firstStage.engine.thrustSeaLevel * 1000;
  const liftoffTW = liftoffThrustN / (glowKg * EARTH_CONSTANTS.G0);

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-3.5 sm:p-5 shadow-2xl space-y-3.5">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-2.5">
        <div className="flex items-center space-x-2 text-[#38BDF8] font-bold font-mono text-xs sm:text-sm">
          <Sliders className="w-4 h-4" />
          <span>VEHICLE CONFIGURATOR & PARAMETERS</span>
        </div>
        <button
          onClick={() => setShowAllSpecs(!showAllSpecs)}
          className="flex items-center space-x-1 text-[11px] font-mono text-[#38BDF8] hover:underline"
        >
          <span>{showAllSpecs ? 'Hide Full Specs' : 'Show All Fleet Specs'}</span>
          {showAllSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Vehicle Switcher Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {(Object.keys(ROCKET_SPECS) as RocketModelId[]).map((key) => {
          const spec = ROCKET_SPECS[key];
          const isSelected = spec.id === selectedRocket.id;
          return (
            <button
              key={spec.id}
              onClick={() => {
                onSelectRocket(spec);
                onPayloadMassChange(spec.defaultPayloadMass);
              }}
              className={`text-left p-3 rounded-xl border transition relative flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#F0F6FC] shadow-lg shadow-blue-500/10'
                  : 'bg-[#0D1117] border-[#30363D] hover:border-[#8B949E] text-[#8B949E]'
              }`}
            >
              {isSelected && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] absolute top-2.5 right-2.5" />
              )}
              <div>
                <div className="flex items-center space-x-1.5">
                  <Rocket className={`w-3.5 h-3.5 ${isSelected ? 'text-[#38BDF8]' : 'text-[#8B949E]'}`} />
                  <span className="font-bold text-xs sm:text-sm text-[#F0F6FC]">{spec.name}</span>
                </div>
                <p className="text-[11px] text-[#8B949E] mt-0.5 line-clamp-1">{spec.tagline}</p>
              </div>

              <div className="text-[10px] font-mono text-[#8B949E] pt-1.5 border-t border-[#30363D]/80 flex justify-between">
                <span>H: {spec.height}m</span>
                <span>Thrust: {(spec.firstStage.engine.thrustSeaLevel / 1000).toFixed(1)} MN</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Adjustable Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0D1117] p-3.5 rounded-xl border border-[#30363D] text-xs">
        {/* Slider 1: Payload Mass */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[#C9D1D9]">
            <span className="flex items-center space-x-1 font-mono">
              <Weight className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Payload Mass:</span>
            </span>
            <span className="font-mono text-[#38BDF8] font-bold">{payloadMass.toLocaleString()} kg</span>
          </div>
          <input
            type="range"
            min={1000}
            max={selectedRocket.id === 'starship' ? 150000 : selectedRocket.id === 'falconHeavy' ? 60000 : 22800}
            step={500}
            value={payloadMass}
            onChange={(e) => onPayloadMassChange(Number(e.target.value))}
            className="w-full accent-[#38BDF8] h-2 bg-[#21262D] rounded-lg cursor-pointer"
          />
          <div className="text-[10px] text-[#8B949E] font-mono flex justify-between">
            <span>1,000 kg</span>
            <span>GLOW: {(glowKg / 1000).toFixed(1)} t</span>
          </div>
        </div>

        {/* Slider 2: Pitch Kick Time */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[#C9D1D9]">
            <span className="flex items-center space-x-1 font-mono">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pitch Kick Time:</span>
            </span>
            <span className="font-mono text-emerald-300 font-bold">T+{pitchKickTime}s</span>
          </div>
          <input
            type="range"
            min={8}
            max={30}
            step={1}
            value={pitchKickTime}
            onChange={(e) => onPitchKickTimeChange(Number(e.target.value))}
            className="w-full accent-emerald-500 h-2 bg-[#21262D] rounded-lg cursor-pointer"
          />
          <div className="text-[10px] text-[#8B949E] font-mono flex justify-between">
            <span>T+8s</span>
            <span>T+30s</span>
          </div>
        </div>

        {/* Slider 3: Pitch Kick Angle */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[#C9D1D9]">
            <span className="flex items-center space-x-1 font-mono">
              <Navigation className="w-3.5 h-3.5 text-purple-400" />
              <span>Pitch Kick Angle:</span>
            </span>
            <span className="font-mono text-purple-300 font-bold">{pitchKickAngle.toFixed(1)}° East</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5.0}
            step={0.1}
            value={pitchKickAngle}
            onChange={(e) => onPitchKickAngleChange(Number(e.target.value))}
            className="w-full accent-purple-500 h-2 bg-[#21262D] rounded-lg cursor-pointer"
          />
          <div className="text-[10px] text-[#8B949E] font-mono flex justify-between">
            <span>0.5°</span>
            <span>T/W: {liftoffTW.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Expandable Comprehensive Fleet Specifications Matrix ("Show Everything") */}
      {showAllSpecs && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 space-y-4 animate-fade-in text-xs">
          <div className="flex items-center space-x-2 text-[#F0F6FC] font-bold border-b border-[#30363D] pb-2">
            <Layers className="w-4 h-4 text-[#38BDF8]" />
            <span>Detailed SpaceX Fleet Engineering Specifications & Mass Breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(ROCKET_SPECS) as RocketModelId[]).map((key) => {
              const spec = ROCKET_SPECS[key];
              const isSelected = spec.id === selectedRocket.id;

              const totalSpecGLOW =
                spec.firstStage.dryMass +
                spec.firstStage.propellantMass +
                spec.secondStage.dryMass +
                spec.secondStage.propellantMass +
                spec.defaultPayloadMass;

              const specTW = (spec.firstStage.engine.thrustSeaLevel * 1000) / (totalSpecGLOW * EARTH_CONSTANTS.G0);

              return (
                <div
                  key={spec.id}
                  className={`p-3 rounded-xl border space-y-2.5 ${
                    isSelected ? 'bg-[#161B22] border-[#38BDF8]/60 shadow-md' : 'bg-[#161B22]/50 border-[#30363D]'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-[#30363D] pb-1.5">
                    <span className="font-bold text-sm text-[#F0F6FC]">{spec.name}</span>
                    {isSelected && <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded">ACTIVE</span>}
                  </div>

                  {/* General Vehicle Specs */}
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Height / Dia:</span>
                      <span className="text-[#C9D1D9]">{spec.height}m / {spec.diameter}m</span>
                    </div>
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Cross Area:</span>
                      <span className="text-[#C9D1D9]">{spec.crossSectionArea.toFixed(1)} m²</span>
                    </div>
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Drag Coeff (Cd):</span>
                      <span className="text-[#C9D1D9]">{spec.dragCoefficient}</span>
                    </div>
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Nominal GLOW:</span>
                      <span className="text-[#38BDF8] font-bold">{(totalSpecGLOW / 1000).toLocaleString()} t</span>
                    </div>
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Liftoff T/W:</span>
                      <span className="text-emerald-400 font-bold">{specTW.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Stage 1 Specs */}
                  <div className="pt-1.5 border-t border-[#30363D]/80 space-y-1">
                    <span className="font-bold text-[10px] text-[#38BDF8] uppercase tracking-wider block">Stage 1 (Booster):</span>
                    <div className="font-mono text-[10px] space-y-0.5 text-[#8B949E]">
                      <div>Engines: <span className="text-[#C9D1D9]">{spec.firstStage.engine.name}</span></div>
                      <div>Dry Mass: <span className="text-[#C9D1D9]">{spec.firstStage.dryMass.toLocaleString()} kg</span></div>
                      <div>Propellant: <span className="text-[#C9D1D9]">{spec.firstStage.propellantMass.toLocaleString()} kg</span></div>
                      <div>Thrust (SL/Vac): <span className="text-[#C9D1D9]">{(spec.firstStage.engine.thrustSeaLevel / 1000).toFixed(1)} / {(spec.firstStage.engine.thrustVacuum / 1000).toFixed(1)} MN</span></div>
                      <div>Isp (SL/Vac): <span className="text-[#C9D1D9]">{spec.firstStage.engine.ispSeaLevel}s / {spec.firstStage.engine.ispVacuum}s</span></div>
                    </div>
                  </div>

                  {/* Stage 2 Specs */}
                  <div className="pt-1.5 border-t border-[#30363D]/80 space-y-1">
                    <span className="font-bold text-[10px] text-purple-400 uppercase tracking-wider block">Stage 2 (Upper):</span>
                    <div className="font-mono text-[10px] space-y-0.5 text-[#8B949E]">
                      <div>Engines: <span className="text-[#C9D1D9]">{spec.secondStage.engine.name}</span></div>
                      <div>Dry Mass: <span className="text-[#C9D1D9]">{spec.secondStage.dryMass.toLocaleString()} kg</span></div>
                      <div>Propellant: <span className="text-[#C9D1D9]">{spec.secondStage.propellantMass.toLocaleString()} kg</span></div>
                      <div>Thrust (Vac): <span className="text-[#C9D1D9]">{(spec.secondStage.engine.thrustVacuum / 1000).toFixed(1)} MN</span></div>
                      <div>Isp (Vac): <span className="text-[#C9D1D9]">{spec.secondStage.engine.ispVacuum}s</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


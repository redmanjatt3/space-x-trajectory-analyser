import React, { useState } from 'react';
import { RocketSpec, RocketModelId } from '../types';
import { ROCKET_SPECS, EARTH_CONSTANTS } from '../physics/constants';
import { Sliders, Rocket, Weight, Navigation, CheckCircle2, ChevronDown, ChevronUp, Layers, Wind, Globe, ShieldAlert, Sparkles } from 'lucide-react';

interface RocketConfiguratorProps {
  selectedRocket: RocketSpec;
  onSelectRocket: (rocket: RocketSpec) => void;
  payloadMass: number;
  onPayloadMassChange: (mass: number) => void;
  pitchKickTime: number;
  onPitchKickTimeChange: (time: number) => void;
  pitchKickAngle: number;
  onPitchKickAngleChange: (angle: number) => void;
  enableDrag: boolean;
  onEnableDragChange: (enable: boolean) => void;
  launchLatitude: number;
  onLaunchLatitudeChange: (lat: number) => void;
  windSpeed: number;
  onWindSpeedChange: (speed: number) => void;
  windDirection: number;
  onWindDirectionChange: (dir: number) => void;
}

const LAUNCH_SITES = [
  { name: 'Cape Canaveral, FL (SLC-40 / LC-39A)', latitude: 28.5, code: 'KSC/CCSFS' },
  { name: 'Starbase Boca Chica, TX (Orbital Pad A)', latitude: 26.0, code: 'STARBASE' },
  { name: 'Vandenberg SFB, CA (SLC-4E - Polar Orbit)', latitude: 34.7, code: 'VSFB' },
  { name: 'Guiana Space Centre / Equator (Max Rotational Boost)', latitude: 0.0, code: 'EQUATOR' },
  { name: 'Baikonur Cosmodrome (51.6° N Inclination)', latitude: 51.6, code: 'BAIKONUR' },
];

export const RocketConfigurator: React.FC<RocketConfiguratorProps> = ({
  selectedRocket,
  onSelectRocket,
  payloadMass,
  onPayloadMassChange,
  pitchKickTime,
  onPitchKickTimeChange,
  pitchKickAngle,
  onPitchKickAngleChange,
  enableDrag,
  onEnableDragChange,
  launchLatitude,
  onLaunchLatitudeChange,
  windSpeed,
  onWindSpeedChange,
  windDirection,
  onWindDirectionChange,
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

  // Earth rotational speed bonus at latitude
  const latRad = (launchLatitude * Math.PI) / 180;
  const earthRotBoost = EARTH_CONSTANTS.EARTH_ROTATION_SPEED_EQUATOR * Math.cos(latRad);

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

      {/* Advanced Environmental Controls: Aerodynamic Drag & Launch Latitude */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0D1117] p-3.5 rounded-xl border border-[#30363D] text-xs">
        {/* Toggle: Aerodynamic Drag Calculation */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 font-mono text-[#C9D1D9] font-semibold">
              <Wind className={`w-3.5 h-3.5 ${enableDrag ? 'text-amber-400' : 'text-[#8B949E]'}`} />
              <span>Aerodynamic Drag:</span>
            </span>
            <button
              onClick={() => onEnableDragChange(!enableDrag)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                enableDrag ? 'bg-amber-500' : 'bg-[#21262D]'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  enableDrag ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-[#8B949E] font-mono leading-tight">
            {enableDrag ? (
              <span className="text-amber-300/90 font-medium">Atmospheric Drag active ($F_D = \frac{1}{2}\rho v^2 C_d A$)</span>
            ) : (
              <span className="text-blue-300/90 font-medium">Vacuum Trajectory (Frictionless drag = 0)</span>
            )}
          </p>
        </div>

        {/* Dropdown: Initial Launch Latitude (Coriolis Effect) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[#C9D1D9]">
            <span className="flex items-center space-x-1.5 font-mono font-semibold">
              <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Launch Site Latitude:</span>
            </span>
            <span className="font-mono text-[#38BDF8] font-bold text-[11px]">{launchLatitude.toFixed(1)}° N</span>
          </div>

          <select
            value={launchLatitude}
            onChange={(e) => onLaunchLatitudeChange(Number(e.target.value))}
            className="w-full bg-[#161B22] border border-[#30363D] text-[#F0F6FC] rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-[#38BDF8]"
          >
            {LAUNCH_SITES.map((site) => (
              <option key={site.code} value={site.latitude}>
                {site.name}
              </option>
            ))}
          </select>

          <div className="text-[10px] text-[#8B949E] font-mono flex justify-between items-center pt-0.5">
            <span>Earth Assist: <strong className="text-emerald-400">+{earthRotBoost.toFixed(1)} m/s</strong></span>
            <span>Coriolis: <strong className="text-purple-300">{(2 * 7.2921e-5 * Math.sin(latRad) * 1000000).toFixed(2)} µm/s²</strong></span>
          </div>
        </div>

        {/* Slider 4: Surface Wind Speed */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[#C9D1D9]">
            <span className="flex items-center space-x-1 font-mono font-semibold">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Surface Wind Speed:</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">{windSpeed.toFixed(0)} m/s ({(windSpeed * 1.94384).toFixed(0)} kts)</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={windSpeed}
            onChange={(e) => onWindSpeedChange(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-[#21262D] rounded-lg cursor-pointer"
          />
          <div className="text-[10px] text-[#8B949E] font-mono flex justify-between">
            <span>0 m/s (Calm)</span>
            <span>30 m/s (Gale Force)</span>
          </div>
        </div>

        {/* Slider 5: Wind Direction / Vector */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[#C9D1D9]">
            <span className="flex items-center space-x-1 font-mono font-semibold">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Wind Direction Vector:</span>
            </span>
            <span className="font-mono text-amber-300 font-bold">
              {windDirection === 0
                ? '0° (Tailwind)'
                : windDirection === 180
                ? '180° (Headwind)'
                : windDirection === 90
                ? '90° (Crosswind R)'
                : windDirection === 270
                ? '270° (Crosswind L)'
                : `${windDirection}°`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={15}
            value={windDirection}
            onChange={(e) => onWindDirectionChange(Number(e.target.value))}
            className="w-full accent-amber-500 h-2 bg-[#21262D] rounded-lg cursor-pointer"
          />
          <div className="text-[10px] text-[#8B949E] font-mono flex justify-between">
            <span>0° (Downrange)</span>
            <span>180° (Headwind)</span>
            <span>360°</span>
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


import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ROCKET_SPECS } from './physics/constants';
import { runTrajectorySimulation } from './physics/engine';
import { RocketSpec, TelemetryPoint } from './types';
import { TrajectoryCanvas } from './components/TrajectoryCanvas';
import { TelemetryPanel } from './components/TelemetryPanel';
import { TelemetryCharts } from './components/TelemetryCharts';
import { DerivationViewer } from './components/DerivationViewer';
import { RocketConfigurator } from './components/RocketConfigurator';
import {
  Rocket,
  Compass,
  BookOpen,
  Sliders,
  Sparkles,
  Info,
  Flame,
  Wind,
  Shield,
  Target,
  ArrowRight,
  ChevronRight,
  Layers,
  HelpCircle,
  Orbit,
} from 'lucide-react';

type NavigationTab = 'SIMULATOR' | 'DERIVATIONS' | 'TIMELINE_GUIDE';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('SIMULATOR');

  // Simulation Parameters State
  const [selectedRocket, setSelectedRocket] = useState<RocketSpec>(ROCKET_SPECS.falcon9);
  const [payloadMass, setPayloadMass] = useState<number>(ROCKET_SPECS.falcon9.defaultPayloadMass);
  const [pitchKickTime, setPitchKickTime] = useState<number>(15);
  const [pitchKickAngle, setPitchKickAngle] = useState<number>(1.8);

  // Simulation Telemetry
  const telemetry: TelemetryPoint[] = useMemo(() => {
    return runTrajectorySimulation({
      rocketSpec: selectedRocket,
      payloadMass,
      pitchKickTime,
      pitchKickAngle,
      targetLandingDistance: 300000,
      suicideBurnSafetyMargin: 1.05,
    });
  }, [selectedRocket, payloadMass, pitchKickTime, pitchKickAngle]);

  // Playback Control State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const step = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;

      // Advance telemetry frame based on speed
      if (delta > 100 / playbackSpeed) {
        setCurrentIndex((prev) => {
          if (prev >= telemetry.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
        lastTimeRef.current = time;
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, telemetry.length]);

  const currentPoint = telemetry[currentIndex] || telemetry[0];

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#C9D1D9] flex flex-col font-sans selection:bg-[#38BDF8] selection:text-[#0F1115]">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#161B22]/95 backdrop-blur-md border-b border-[#30363D] px-3 sm:px-6 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#F0F6FC] flex items-center space-x-1.5">
              <span>SpaceX Trajectory Mechanics</span>
              <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                NUMERICAL 2D PHYSICS
              </span>
            </h1>
            <p className="text-[10px] text-[#8B949E] font-mono hidden md:block">
              Rigorous Physics Derivations & Orbital Trajectory Engine
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex items-center space-x-1 bg-[#0D1117] border border-[#30363D] p-1 rounded-xl text-xs font-mono font-bold w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition ${
              activeTab === 'SIMULATOR'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('DERIVATIONS')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition ${
              activeTab === 'DERIVATIONS'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Physics Proofs</span>
          </button>

          <button
            onClick={() => setActiveTab('TIMELINE_GUIDE')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition ${
              activeTab === 'TIMELINE_GUIDE'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Timeline</span>
          </button>
        </nav>
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {activeTab === 'SIMULATOR' && (
          <div className="space-y-4">
            {/* Real-Time Telemetry Bar */}
            <TelemetryPanel currentPoint={currentPoint} />

            {/* Interactive 2D Simulation Canvas */}
            <TrajectoryCanvas
              telemetry={telemetry}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              selectedRocketName={selectedRocket.name}
            />

            {/* Dense 2-Column Grid: Configurator & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-5">
                <RocketConfigurator
                  selectedRocket={selectedRocket}
                  onSelectRocket={setSelectedRocket}
                  payloadMass={payloadMass}
                  onPayloadMassChange={setPayloadMass}
                  pitchKickTime={pitchKickTime}
                  onPitchKickTimeChange={setPitchKickTime}
                  pitchKickAngle={pitchKickAngle}
                  onPitchKickAngleChange={setPitchKickAngle}
                />
              </div>

              <div className="lg:col-span-7">
                <TelemetryCharts
                  telemetry={telemetry}
                  currentIndex={currentIndex}
                  onIndexChange={setCurrentIndex}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DERIVATIONS' && <DerivationViewer />}

        {activeTab === 'TIMELINE_GUIDE' && (
          <div className="space-y-6">
            {/* Complete SpaceX Ascent & Landing Trajectory Walkthrough */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-[#30363D] pb-4">
                <h2 className="text-xl font-bold text-[#F0F6FC] flex items-center space-x-2">
                  <Orbit className="w-5 h-5 text-[#38BDF8]" />
                  <span>The Complete SpaceX Trajectory Roadmap: Ascent to Touchdown</span>
                </h2>
                <p className="text-xs text-[#8B949E] mt-1">
                  Step-by-step physical walkthrough of every milestone in a SpaceX orbital launch and booster recovery mission.
                </p>
              </div>

              {/* Timeline Cards */}
              <div className="space-y-4">
                {/* 1. Liftoff */}
                <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-2 hover:border-[#38BDF8]/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#38BDF8]">T+00:00 to T+00:15 • LIFTOFF</span>
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400"><Flame className="w-4 h-4" /></span>
                  </div>
                  <h3 className="text-base font-bold text-[#F0F6FC]">1. Vertical Ascent & Max Thrust Breakthrough</h3>
                  <p className="text-xs text-[#C9D1D9] leading-relaxed">
                    At T-0, 9 Merlin 1D engines ignite generating 7.6 MN of thrust. The rocket accelerates vertically to clear launch pad towers before initiating any steering. Mass decreases rapidly at 2,500 kg/s as propellant burns.
                  </p>
                </div>

                {/* 2. Pitch Kick & Gravity Turn */}
                <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-2 hover:border-[#38BDF8]/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">T+00:15 to T+01:10 • PITCH KICK</span>
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400"><Compass className="w-4 h-4" /></span>
                  </div>
                  <h3 className="text-base font-bold text-[#F0F6FC]">2. Pitch Kick & Natural Gravity Turn</h3>
                  <p className="text-xs text-[#C9D1D9] leading-relaxed">
                    Engine gimbals tilt the rocket ~1.8 degrees east. Gravity then pulls the velocity vector downward continuously. Because the pitch matches the flight path angle (Zero Angle of Attack $\alpha = 0$), aerodynamic bending stress is zero!
                  </p>
                </div>

                {/* 3. Max Q */}
                <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-2 hover:border-amber-500/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">T+01:12 • MAX Q</span>
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400"><Wind className="w-4 h-4" /></span>
                  </div>
                  <h3 className="text-base font-bold text-[#F0F6FC]">3. Max Q (Maximum Dynamic Pressure)</h3>
                  <p className="text-xs text-[#C9D1D9] leading-relaxed">
                    At ~12 km altitude and Mach 1.3, dynamic pressure $q = \frac{1}{2} \rho v^2$ peaks at ~32 kPa. Flight computers throttle back engines to 80% thrust to prevent structural collapse.
                  </p>
                </div>

                {/* 4. MECO & Stage Separation */}
                <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-2 hover:border-[#38BDF8]/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-400">T+02:20 to T+02:25 • STAGE SEP</span>
                    <span className="p-1 rounded bg-purple-500/10 text-purple-400"><Layers className="w-4 h-4" /></span>
                  </div>
                  <h3 className="text-base font-bold text-[#F0F6FC]">4. MECO & Pneumatic Stage Separation</h3>
                  <p className="text-xs text-[#C9D1D9] leading-relaxed">
                    At T+2m20s, Stage 1 engines shut down (MECO). Four pneumatic pushers separate Stage 1 and Stage 2 cleanly without explosive pyrotechnics. Stage 2 ignites its vacuum Merlin engine (MVac) to accelerate payload to orbital speed (27,000 km/h).
                  </p>
                </div>

                {/* 5. Boostback Burn */}
                <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-2 hover:border-[#38BDF8]/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">T+02:35 to T+03:05 • BOOSTBACK</span>
                    <span className="p-1 rounded bg-blue-500/10 text-blue-400"><Flame className="w-4 h-4" /></span>
                  </div>
                  <h3 className="text-base font-bold text-[#F0F6FC]">5. Cold Gas RCS Flip & Boostback Burn</h3>
                  <p className="text-xs text-[#C9D1D9] leading-relaxed">
                    Nitrogen RCS thrusters flip the empty 30-ton booster 180 degrees. Three Merlin engines ignite to reverse the horizontal velocity $v_x$, aiming the booster towards the autonomous drone ship coordinates downrange.
                  </p>
                </div>

                {/* 6. Grid Fin Unfold & Entry Burn */}
                <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-2 hover:border-[#38BDF8]/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-400">T+06:30 • ENTRY BURN & GRID FINS</span>
                    <span className="p-1 rounded bg-rose-500/10 text-rose-400"><Shield className="w-4 h-4" /></span>
                  </div>
                  <h3 className="text-base font-bold text-[#F0F6FC]">6. Titanium Grid Fins & Supersonic Entry Burn</h3>
                  <p className="text-xs text-[#C9D1D9] leading-relaxed">
                    At 45 km altitude and Mach 4+, 3 Merlin engines re-ignite for the entry burn. Exhaust gas creates a protective bow shockwave shielding the engines from extreme friction heat. Four titanium grid fins unfold to vector aerodynamic lift.
                  </p>
                </div>

                {/* 7. The Suicide Burn (Hoverslam) */}
                <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 space-y-2 hover:border-emerald-500/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">T+08:15 • HOVERSLAM</span>
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400"><Target className="w-4 h-4" /></span>
                  </div>
                  <h3 className="text-base font-bold text-[#F0F6FC]">7. The "Suicide Burn" (Hoverslam) & Drone Ship Touchdown</h3>
                  <p className="text-xs text-[#C9D1D9] leading-relaxed">
                    At 1,000m altitude falling at 250 m/s, a single center Merlin engine ignites at full throttle. Because minimum engine thrust exceeds booster dry weight (T/W &gt; 1), hover is impossible. The landing computer solves the ignition height continuously so downward speed reaches exactly 0 m/s at the instant carbon-fiber legs touch the drone ship deck.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363D] bg-[#161B22] px-6 py-4 text-center text-xs text-[#8B949E] font-mono">
        SpaceX Rocket Trajectory & Physics Simulator • Built with React, TypeScript, Tailwind CSS, KaTeX & Recharts
      </footer>
    </div>
  );
}

import { TelemetryPoint, RocketSpec, FlightPhase } from '../types';
import { EARTH_CONSTANTS, ROCKET_SPECS } from './constants';

export interface SimulationParams {
  rocketSpec: RocketSpec;
  payloadMass: number;
  pitchKickTime: number; // seconds (default ~15s)
  pitchKickAngle: number; // degrees (default ~1.8deg)
  targetLandingDistance: number; // meters downrange (e.g., 300,000m for ASDS)
  suicideBurnSafetyMargin: number; // multiplier e.g. 1.05
  enableDrag?: boolean; // Enable / disable aerodynamic drag
  launchLatitude?: number; // Launch site latitude in degrees (e.g. 28.5 for Cape Canaveral)
  windSpeed?: number; // m/s surface wind speed
  windDirection?: number; // degrees (0° = tailwind downrange, 180° = headwind, 90° = crosswind)
}

/**
 * Calculates atmospheric density (kg/m^3) using US Standard Atmosphere 1976 model
 * with altitude-dependent multi-layer temperature lapse rates and hydrostatic pressure balances.
 */
export function calculateAtmosphericDensity(altitude: number): number {
  if (altitude <= 0) return EARTH_CONSTANTS.SEA_LEVEL_DENSITY;
  if (altitude >= 100000) return 0; // Exosphere / vacuum above Kármán line (100 km)

  const g0 = EARTH_CONSTANTS.G0;
  const R = 287.053; // Specific gas constant for air (J/(kg K))

  // Layer 0: Troposphere (0 - 11,000 m) - Standard lapse rate L0 = -0.0065 K/m
  if (altitude < 11000) {
    const T0 = 288.15;
    const L0 = -0.0065;
    const T = T0 + L0 * altitude;
    const P0 = 101325;
    const P = P0 * Math.pow(T / T0, -g0 / (L0 * R));
    return P / (R * T);
  }
  // Layer 1: Tropopause / Lower Stratosphere (11,000 - 20,000 m) - Isothermal T1 = 216.65 K
  else if (altitude < 20000) {
    const T1 = 216.65;
    const P11 = 22632.1;
    const P = P11 * Math.exp((-g0 * (altitude - 11000)) / (R * T1));
    return P / (R * T1);
  }
  // Layer 2: Middle Stratosphere (20,000 - 32,000 m) - L2 = +0.001 K/m
  else if (altitude < 32000) {
    const T2 = 216.65;
    const L2 = 0.001;
    const P20 = 5474.89;
    const T = T2 + L2 * (altitude - 20000);
    const P = P20 * Math.pow(T / T2, -g0 / (L2 * R));
    return P / (R * T);
  }
  // Layer 3: Upper Stratosphere (32,000 - 47,000 m) - L3 = +0.0028 K/m
  else if (altitude < 47000) {
    const T3 = 228.65;
    const L3 = 0.0028;
    const P32 = 868.02;
    const T = T3 + L3 * (altitude - 32000);
    const P = P32 * Math.pow(T / T3, -g0 / (L3 * R));
    return P / (R * T);
  }
  // Layer 4: Mesosphere (47,000 - 100,000 m) - Upper atmospheric decay
  else {
    const T4 = 270.65;
    const P47 = 110.9;
    const scaleH = 7200;
    const P = P47 * Math.exp(-(altitude - 47000) / scaleH);
    return P / (R * T4);
  }
}

/**
 * Speed of sound in air as function of altitude (m)
 */
export function calculateSpeedOfSound(altitude: number): number {
  if (altitude < 11000) {
    // Troposphere temperature lapse rate
    const T = 288.15 - 0.0065 * altitude;
    return Math.sqrt(1.4 * 287.05 * T);
  } else if (altitude < 20000) {
    return 295.0; // Stratosphere isothermal
  } else {
    return 300.0;
  }
}

/**
 * Mach-dependent drag coefficient Cd(M) showing the transonic drag wave drag spike at Mach 1
 */
export function calculateDragCoefficient(mach: number, baseCd: number): number {
  if (mach < 0.8) {
    return baseCd;
  } else if (mach >= 0.8 && mach <= 1.2) {
    // Transonic shock wave buildup peak
    const peakFactor = 1.0 + 1.2 * Math.sin(Math.PI * (mach - 0.8) / 0.4);
    return baseCd * peakFactor;
  } else if (mach > 1.2 && mach <= 5.0) {
    // Hypersonic shock cone stabilization
    return baseCd * (1.2 - 0.08 * (mach - 1.2));
  } else {
    return baseCd * 0.85;
  }
}

/**
 * Specific impulse Isp transitioning from sea level to vacuum based on atmospheric pressure
 */
export function calculateEffectiveIsp(altitude: number, ispSL: number, ispVac: number): number {
  const pressureRatio = Math.exp(-altitude / EARTH_CONSTANTS.SCALE_HEIGHT);
  return ispVac - (ispVac - ispSL) * pressureRatio;
}

/**
 * Full Trajectory Simulation Integrator
 */
export function runTrajectorySimulation(params: SimulationParams): TelemetryPoint[] {
  const {
    rocketSpec,
    payloadMass,
    pitchKickTime,
    pitchKickAngle,
    enableDrag = true,
    launchLatitude = 28.5,
    windSpeed = 0,
    windDirection = 0,
  } = params;
  
  const points: TelemetryPoint[] = [];
  
  // Timestep dt for numerical integration
  const dt = 0.5; // 0.5 sec resolution
  const maxTime = 600; // 10 minutes total window
  
  // Earth rotational speed assist at launch latitude (m/s)
  const omegaE = 7.292115e-5; // rad/s Earth rotation
  const latRad = (launchLatitude * Math.PI) / 180;
  const tangentialEarthVel = EARTH_CONSTANTS.EARTH_ROTATION_SPEED_EQUATOR * Math.cos(latRad);

  // Mass initialization
  const fst = rocketSpec.firstStage;
  const snd = rocketSpec.secondStage;
  
  let m1 = fst.dryMass + fst.propellantMass; // Stage 1 total mass
  let m2 = snd.dryMass + snd.propellantMass + payloadMass; // Stage 2 + payload total mass
  
  // State variables First Stage (Booster)
  let t = 0;
  let h = 0; // Altitude (m)
  let x = 0; // Downrange distance (m)
  let vx = 0; // Horizontal velocity relative to launchpad (m/s)
  let vy = 0; // Vertical velocity (m/s)
  let pitch = 0; // Angle from vertical (degrees)
  let phase: FlightPhase = 'PRELAUNCH';
  let phaseLabel = 'T-00:00 Liftoff Sequence';

  // Second Stage state variables (active after stage separation)
  let s2_h = 0;
  let s2_x = 0;
  let s2_vx = 0;
  let s2_vy = 0;
  let s2_m = m2;
  let s2_active = false;

  let maxQPeakRecorded = false;
  let maxQValue = 0;

  // Primary Integration Loop
  for (t = 0; t <= maxTime; t += dt) {
    // Current total mass being accelerated by stage 1 engines
    const currentAscentMass = s2_active ? m1 : (m1 + s2_m);
    const localG = EARTH_CONSTANTS.G0 * Math.pow(EARTH_CONSTANTS.RADIUS / (EARTH_CONSTANTS.RADIUS + Math.max(0, h)), 2);
    const rho = calculateAtmosphericDensity(h);
    const soundSpeed = calculateSpeedOfSound(h);

    // Wind speed profile with altitude (jet stream amplification between 8km-12km)
    const altWindMult = h < 30000 ? (1.0 + 1.2 * Math.exp(-Math.pow((h - 10000) / 4500, 2))) : 0;
    const currentWindSpeed = windSpeed * altWindMult;
    const windRad = (windDirection * Math.PI) / 180;
    const windX = currentWindSpeed * Math.cos(windRad); // downrange component
    const windY = currentWindSpeed * Math.sin(windRad); // cross/vertical wind component

    // Airspeed relative to wind
    const v_rel_x = vx - windX;
    const v_rel_y = vy - windY;
    const v_rel = Math.sqrt(v_rel_x * v_rel_x + v_rel_y * v_rel_y);
    const velocity = Math.sqrt(vx * vx + vy * vy);
    const mach = v_rel / Math.max(1, soundSpeed);

    // Dynamic Angle of Attack (AoA) in degrees
    const flightPathRad = Math.atan2(v_rel_x, v_rel_y);
    const pitchRad = (pitch * Math.PI) / 180;
    const angleOfAttackDeg = Math.abs((pitchRad - flightPathRad) * (180 / Math.PI));
    
    // Dynamic Pressure q = 0.5 * rho * v_rel^2 in Pascals -> convert to kPa
    const dynamicPressurekPa = (0.5 * rho * v_rel * v_rel) / 1000;
    if (dynamicPressurekPa > maxQValue) {
      maxQValue = dynamicPressurekPa;
    }

    // Aerodynamic Drag Force = 0.5 * rho * v_rel^2 * Cd * Area (0 if drag toggle disabled)
    const cd = calculateDragCoefficient(mach, rocketSpec.dragCoefficient);
    // Grid fins deployed on entry increase Cd significantly
    const effectiveCd = (phase === 'GRID_FIN_REENTRY' || phase === 'TRANSONIC_DESCENT') ? cd * 2.5 : cd;
    const dragForceN = enableDrag
      ? 0.5 * rho * v_rel * v_rel * effectiveCd * rocketSpec.crossSectionArea
      : 0;
    const dragForcekN = dragForceN / 1000;

    // Coriolis acceleration components in rotating frame at given launch latitude
    const coriolisAx = 2 * omegaE * Math.sin(latRad) * vy;
    const coriolisAy = -2 * omegaE * Math.sin(latRad) * vx;

    // Determine Thrust & Throttle for First Stage
    let thrustkN = 0;
    let engineIsp = calculateEffectiveIsp(h, fst.engine.ispSeaLevel, fst.engine.ispVacuum);

    // Phase State Machine Logic
    if (t < 2) {
      phase = 'LIFTOFF';
      phaseLabel = 'Stage 1 Ignition & Liftoff';
      pitch = 0;
      thrustkN = fst.engine.thrustSeaLevel;
    } else if (t >= 2 && t < pitchKickTime) {
      phase = 'LIFTOFF';
      phaseLabel = 'Vertical Ascent Phase';
      pitch = 0;
      thrustkN = fst.engine.thrustSeaLevel;
    } else if (t >= pitchKickTime && t < pitchKickTime + 10) {
      phase = 'PITCH_KICK';
      phaseLabel = `Pitch Kick Maneuver (${pitchKickAngle.toFixed(1)}° East)`;
      // Linear ramp of pitch angle
      pitch = ((t - pitchKickTime) / 10) * pitchKickAngle;
      thrustkN = fst.engine.thrustSeaLevel;
    } else if (t >= pitchKickTime + 10 && t < 135) {
      // Check if around Max Q
      if (t >= 65 && t <= 85) {
        phase = 'MAX_Q';
        phaseLabel = `Max Q Peak (${maxQValue.toFixed(1)} kPa) - Engines Throttled`;
        // Throttle back to manage aerodynamic loads
        thrustkN = fst.engine.thrustVacuum * 0.82;
      } else {
        phase = 'GRAVITY_TURN';
        phaseLabel = 'Gravity Turn Trajectory Execution';
        thrustkN = fst.engine.thrustVacuum;
      }
      
      // Natural Gravity Turn pitch progression: pitch matches flight path angle plus kick angle bias
      if (velocity > 10) {
        const flightPathAngleDeg = Math.atan2(vx, vy) * (180 / Math.PI);
        pitch = Math.max(pitchKickAngle, flightPathAngleDeg);
      }
    } else if (t >= 135 && t < 142) {
      phase = 'MECO';
      phaseLabel = 'MECO (Main Engine Cut-Off)';
      thrustkN = 0; // Engines shut down for separation
    } else if (t >= 142 && t < 150) {
      phase = 'STAGE_SEP';
      phaseLabel = 'Stage Separation & RCS Flip';
      thrustkN = 0;
      s2_active = true;
      if (s2_h === 0) {
        // Initialize second stage at separation point
        s2_h = h;
        s2_x = x;
        s2_vx = vx;
        s2_vy = vy;
      }
    } else if (t >= 150 && t < 185) {
      // First Stage Boostback Burn (using 3 Merlin engines to reverse horizontal velocity back toward drone ship / LZ)
      phase = 'BOOSTBACK_BURN';
      phaseLabel = 'Stage 1 Boostback Burn (3 Merlin Engines)';
      // 3 engines thrust ~ 1/3 of total first stage thrust
      thrustkN = fst.engine.thrustVacuum * (3 / 9);
      // Flip pitch backward to cancel horizontal momentum vx
      pitch = -115; // Pointing back toward launch site / drone ship
    } else if (t >= 185 && t < 380) {
      phase = 'GRID_FIN_REENTRY';
      phaseLabel = 'Unpowered Coast & Titanium Grid Fin Control';
      thrustkN = 0;
      // Reorienting booster for entry
      if (vy < 0) {
        pitch = 180; // Engines pointing downward into oncoming airflow
      }
    } else if (t >= 380 && t < 410) {
      phase = 'ENTRY_BURN';
      phaseLabel = 'Supersonic Entry Burn (Aerodynamic Retropropulsion)';
      // 3 engines burning to shield booster from hypersonic reentry friction
      thrustkN = fst.engine.thrustSeaLevel * (3 / 9);
      pitch = 180;
    } else if (t >= 410 && t < 480) {
      phase = 'TRANSONIC_DESCENT';
      phaseLabel = 'Transonic Aerodynamic Braking (Grid Fins)';
      thrustkN = 0;
      pitch = 180;
    } else if (t >= 480 && h > 10) {
      phase = 'SUICIDE_BURN';
      phaseLabel = 'Landing Burn ("Hoverslam" Single Engine Throttle)';
      // Single engine throttleable (1 / 9 thrust)
      const singleEngineMaxThrust = fst.engine.thrustSeaLevel / 9;
      // Throttle dynamically calculated to reach v=0 right at h=0
      const requiredDecel = (vy * vy) / (2 * Math.max(1, h)) + localG;
      const requiredThrustN = m1 * requiredDecel;
      const requiredThrustkN = requiredThrustN / 1000;
      
      thrustkN = Math.min(singleEngineMaxThrust * 1.1, Math.max(singleEngineMaxThrust * 0.4, requiredThrustkN));
      pitch = 180;
    } else if (h <= 10) {
      phase = 'TOUCHDOWN';
      phaseLabel = 'Touchdown on ASDS Drone Ship / Landing Pad!';
      thrustkN = 0;
      h = 0;
      vy = 0;
      vx = 0;
    }

    // Propellant Consumption First Stage
    if (thrustkN > 0 && m1 > fst.dryMass) {
      const massFlowRate = (thrustkN * 1000) / (engineIsp * EARTH_CONSTANTS.G0); // kg/s
      m1 = Math.max(fst.dryMass, m1 - massFlowRate * dt);
    }

    // Kinematic Equations Integration for First Stage (Booster)
    if (phase !== 'TOUCHDOWN') {
      const pitchRad = (pitch * Math.PI) / 180;
      
      // Forces in kN -> convert to N
      const thrustX_N = thrustkN * 1000 * Math.sin(pitchRad);
      const thrustY_N = thrustkN * 1000 * Math.cos(pitchRad);
      
      // Drag opposes velocity vector
      const dragX_N = velocity > 0 ? (dragForceN * (vx / velocity)) : 0;
      const dragY_N = velocity > 0 ? (dragForceN * (vy / velocity)) : 0;
      
      // Net Accelerations (m/s^2) using current total vehicle mass + Coriolis terms
      const ax = (thrustX_N - dragX_N) / currentAscentMass + coriolisAx;
      const ay = (thrustY_N - dragY_N) / currentAscentMass - localG + coriolisAy;
      
      // Update velocities
      vx += ax * dt;
      vy += ay * dt;
      
      // Update positions
      x += vx * dt;
      h += vy * dt;
      if (h < 0) h = 0;
    }

    // Second Stage Integration (if active)
    if (s2_active) {
      const s2_rho = calculateAtmosphericDensity(s2_h);
      const s2_sound = calculateSpeedOfSound(s2_h);
      const s2_v = Math.sqrt(s2_vx * s2_vx + s2_vy * s2_vy);
      const s2_mach = s2_v / Math.max(1, s2_sound);
      const s2_cd = calculateDragCoefficient(s2_mach, rocketSpec.dragCoefficient);
      const s2_dragN = enableDrag
        ? 0.5 * s2_rho * s2_v * s2_v * s2_cd * rocketSpec.crossSectionArea
        : 0;

      // Second Stage MVac Thrust
      let s2_thrustkN = 0;
      if (s2_m > snd.dryMass + payloadMass) {
        s2_thrustkN = snd.engine.thrustVacuum;
        const s2_mdot = (s2_thrustkN * 1000) / (snd.engine.ispVacuum * EARTH_CONSTANTS.G0);
        s2_m = Math.max(snd.dryMass + payloadMass, s2_m - s2_mdot * dt);
      }

      // Orbital Pitch Angle (gradually pitching horizontal for orbital insertion)
      const s2_pitchDeg = 80 + Math.min(10, (t - 142) * 0.05);
      const s2_pitchRad = (s2_pitchDeg * Math.PI) / 180;

      const s2_coriolisAx = 2 * omegaE * Math.sin(latRad) * s2_vy;
      const s2_coriolisAy = -2 * omegaE * Math.sin(latRad) * s2_vx;

      const s2_ax = (s2_thrustkN * 1000 * Math.sin(s2_pitchRad) - (s2_v > 0 ? s2_dragN * (s2_vx / s2_v) : 0)) / s2_m + s2_coriolisAx;
      const s2_ay = (s2_thrustkN * 1000 * Math.cos(s2_pitchRad) - (s2_v > 0 ? s2_dragN * (s2_vy / s2_v) : 0)) / s2_m - localG + s2_coriolisAy;

      s2_vx += s2_ax * dt;
      s2_vy += s2_ay * dt;
      s2_x += s2_vx * dt;
      s2_h += s2_vy * dt;
    }

    // Calculate total G-Force
    const totalAcc = Math.sqrt(
      Math.pow((thrustkN * 1000 * Math.sin((pitch * Math.PI) / 180) - (velocity > 0 ? dragForceN * (vx / velocity) : 0)) / currentAscentMass, 2) +
      Math.pow((thrustkN * 1000 * Math.cos((pitch * Math.PI) / 180) - (velocity > 0 ? dragForceN * (vy / velocity) : 0)) / currentAscentMass, 2)
    );
    const gForce = totalAcc / EARTH_CONSTANTS.G0;

    // Angle of Attack (AoA) = difference between vehicle pitch and velocity vector angle
    const flightAngle = velocity > 0.1 ? Math.atan2(vx, vy) * (180 / Math.PI) : 0;
    const angleOfAttack = Math.abs(pitch - flightAngle);

    points.push({
      time: Math.round(t * 10) / 10,
      altitude: Math.round(h),
      downrange: Math.round(x),
      vx: Math.round(vx * 10) / 10,
      vy: Math.round(vy * 10) / 10,
      velocity: Math.round(velocity * 10) / 10,
      mach: Math.round(mach * 100) / 100,
      acceleration: Math.round(totalAcc * 10) / 10,
      gForce: Math.round(gForce * 10) / 10,
      dynamicPressure: Math.round(dynamicPressurekPa * 10) / 10,
      massFirstStage: Math.round(m1),
      massSecondStage: Math.round(s2_m),
      pitchAngle: Math.round(pitch * 10) / 10,
      angleOfAttack: Math.round(angleOfAttack * 10) / 10,
      thrustFirstStage: Math.round(thrustkN),
      thrustSecondStage: s2_active ? snd.engine.thrustVacuum : 0,
      dragForce: Math.round(dragForcekN),
      atmosphericDensity: rho,
      phase,
      phaseLabel,
      secondStageAltitude: s2_active ? Math.round(s2_h) : undefined,
      secondStageDownrange: s2_active ? Math.round(s2_x) : undefined,
      secondStageVelocity: s2_active ? Math.round(Math.sqrt(s2_vx * s2_vx + s2_vy * s2_vy)) : undefined,
    });

    if (phase === 'TOUCHDOWN' && t > 510) {
      break;
    }
  }

  return points;
}

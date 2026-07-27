import { TopicDerivation } from '../types';

export const TOPIC_DERIVATIONS: TopicDerivation[] = [
  {
    id: 'tsiolkovsky-rocket-equation',
    category: 'PROPULSION',
    title: 'The Tsiolkovsky Rocket Equation & Mass Flow',
    subtitle: 'Conservation of Momentum in Variable-Mass Systems',
    summary: 'Derivation of the fundamental rocket equation powering all spaceflight, demonstrating why propellant mass scales exponentially with target velocity.',
    iconName: 'Flame',
    practicalSpaceXContext: 'Falcon 9 relies on 9 Merlin 1D engines burning RP-1 and LOX at a rate of 2,500 kg/s. Stage 1 mass drops from 441,000 kg down to 22,200 kg dry mass in just 140 seconds.',
    steps: [
      {
        stepNumber: 1,
        title: 'Conservation of Linear Momentum',
        latexFormula: 'P(t) = m v, \\quad P(t+dt) = (m + dm)(v + dv) + (-dm)(v - v_{e})',
        explanation: 'In a tiny time interval dt, the rocket expels a small mass element (-dm) at effective exhaust velocity v_e relative to the rocket.',
        variableDefinitions: [
          { symbol: 'm', meaning: 'Instantaneous mass of rocket', unit: 'kg' },
          { symbol: 'v', meaning: 'Rocket velocity relative to ground frame', unit: 'm/s' },
          { symbol: 'v_e', meaning: 'Effective exhaust velocity', unit: 'm/s' },
          { symbol: 'dm', meaning: 'Differential change in rocket mass (negative)', unit: 'kg' }
        ],
        physicalInsight: 'Because momentum is conserved in the absence of external forces, the backward momentum imparted to high-speed exhaust gas pushes the rocket forward.'
      },
      {
        stepNumber: 2,
        title: 'Expanding and Simplifying Momentum Equivalence',
        latexFormula: 'm v = m v + m dv + v dm + dm dv - v dm + v_e dm',
        explanation: 'Cancel duplicate terms (m v) and discard second-order differential product (dm dv -> 0):',
        variableDefinitions: [
          { symbol: 'm dv', meaning: 'Incremental momentum gained by rocket', unit: 'N·s' },
          { symbol: 'v_e dm', meaning: 'Momentum carried away by exhaust gas', unit: 'N·s' }
        ],
        physicalInsight: 'Setting total change in momentum to zero yields the differential relation: m dv = -v_e dm.'
      },
      {
        stepNumber: 3,
        title: 'Separation of Variables & Integration',
        latexFormula: '\\int_{v_0}^{v_f} dv = -v_e \\int_{m_0}^{m_f} \\frac{dm}{m}',
        explanation: 'Integrate both sides from initial state (m_0, v_0) at liftoff to final state (m_f, v_f) at engine burnout.',
        variableDefinitions: [
          { symbol: 'm_0', meaning: 'Initial wet mass (Dry + Fuel)', unit: 'kg' },
          { symbol: 'm_f', meaning: 'Final dry mass after burnout', unit: 'kg' }
        ],
        physicalInsight: 'Integrating 1/m yields the natural logarithm ln(m), bringing the non-linear exponential relation into space propulsion.'
      },
      {
        stepNumber: 4,
        title: 'The Tsiolkovsky Formula & Specific Impulse (Isp)',
        latexFormula: '\\Delta v = v_e \\ln\\left(\\frac{m_0}{m_f}\\right) = I_{sp} g_0 \\ln\\left(\\frac{m_0}{m_f}\\right)',
        explanation: 'Effective exhaust velocity is defined as v_e = I_sp * g_0, where I_sp is Specific Impulse in seconds (thrust per unit weight flow rate).',
        variableDefinitions: [
          { symbol: 'I_{sp}', meaning: 'Specific Impulse of engine', unit: 'seconds' },
          { symbol: 'g_0', meaning: 'Standard sea-level gravity (9.80665)', unit: 'm/s²' },
          { symbol: '\\Delta v', meaning: 'Total velocity capability budget', unit: 'm/s' }
        ],
        physicalInsight: 'To double the Delta-V, you must square the mass ratio (m_0 / m_f). This logarithmic barrier is why multi-stage rockets (Falcon 9 stage 1 + stage 2) are mandatory for reaching orbital speeds (~7.8 km/s).'
      }
    ]
  },
  {
    id: 'atmospheric-drag-maxq',
    category: 'AERODYNAMICS',
    title: 'Atmospheric Aerodynamics & Max Q Calculus',
    subtitle: 'Derivation of Maximum Dynamic Pressure',
    summary: 'Mathematical calculation of Max Q—the point in flight where the structural stress on the rocket structure reaches its absolute maximum.',
    iconName: 'Wind',
    practicalSpaceXContext: 'Around T+72 seconds at 12-14 km altitude, Falcon 9 experiences Max Q (~30-35 kPa). SpaceX throttles back the Merlin 1D engines by ~20% to prevent structural collapse.',
    steps: [
      {
        stepNumber: 1,
        title: 'Exponential Barometric Atmosphere Model',
        latexFormula: '\\rho(h) = \\rho_0 e^{-\\frac{h}{H_0}}',
        explanation: 'Atmospheric air density decreases exponentially with altitude h. Scale height H_0 approx 8,500 meters.',
        variableDefinitions: [
          { symbol: '\\rho_0', meaning: 'Sea-level atmospheric density (1.225)', unit: 'kg/m³' },
          { symbol: 'H_0', meaning: 'Isothermal atmosphere scale height (8500)', unit: 'm' },
          { symbol: 'h', meaning: 'Altitude above sea level', unit: 'm' }
        ],
        physicalInsight: 'At sea level air is dense (high rho) but rocket speed is slow (low v). At 100 km air is thin (rho ~ 0) but rocket speed is extremely high. Dynamic pressure peaks in between!'
      },
      {
        stepNumber: 2,
        title: 'Definition of Dynamic Pressure (q)',
        latexFormula: 'q(t) = \\frac{1}{2} \\rho(h(t)) v(t)^2 = \\frac{1}{2} \\rho_0 e^{-\\frac{h(t)}{H_0}} v(t)^2',
        explanation: 'Dynamic pressure represents the kinetic energy per unit volume of the air flowing past the vehicle skin.',
        variableDefinitions: [
          { symbol: 'q', meaning: 'Dynamic pressure', unit: 'Pa or kPa' },
          { symbol: 'v', meaning: 'Rocket airspeed velocity', unit: 'm/s' }
        ],
        physicalInsight: 'Total aerodynamic drag force acting on the rocket is directly proportional to dynamic pressure: F_drag = q * C_d * A.'
      },
      {
        stepNumber: 3,
        title: 'Calculus Optimization: Setting dq/dt = 0',
        latexFormula: '\\frac{dq}{dt} = \\frac{1}{2} \\left[ \\frac{d\\rho}{dt} v^2 + 2 \\rho v \\frac{dv}{dt} \\right] = 0',
        explanation: 'To find the peak point Max Q, apply the product rule for derivatives with respect to time and equate to zero.',
        variableDefinitions: [
          { symbol: '\\frac{d\\rho}{dt}', meaning: 'Time rate of density change: -(\\rho / H_0) * dh/dt', unit: 'kg/(m³·s)' },
          { symbol: '\\frac{dv}{dt}', meaning: 'Vehicle acceleration a', unit: 'm/s²' }
        ],
        physicalInsight: 'Subbing dh/dt = v_y (vertical velocity) gives: -(\\rho / H_0) v_y v^2 + 2 \\rho v a = 0.'
      },
      {
        stepNumber: 4,
        title: 'Max Q Altitude & Velocity Condition',
        latexFormula: 'a_{MaxQ} = \\frac{v_{MaxQ} \\cdot v_y}{2 H_0}',
        explanation: 'At Max Q, the rocket acceleration exactly balances half the ratio of kinetic speed over scale height.',
        variableDefinitions: [
          { symbol: 'a_{MaxQ}', meaning: 'Acceleration at Max Q peak', unit: 'm/s²' },
          { symbol: 'v_{MaxQ}', meaning: 'Total velocity at Max Q peak', unit: 'm/s' }
        ],
        physicalInsight: 'This exact formula allows flight computers to predict the precise millisecond of Max Q and execute automated engine throttling down and throttle up commands.'
      }
    ]
  },
  {
    id: 'gravity-turn-kinematics',
    category: 'GRAVITY_TURN',
    title: 'Gravity Turn Differential Equations',
    subtitle: 'Fuel-Optimal Trajectory Steering Under Gravity & Drag',
    summary: 'The 2D non-linear system of differential equations describing how gravity turns the rocket velocity vector without using aerodynamic steering fins.',
    iconName: 'Compass',
    practicalSpaceXContext: 'At T+15 seconds, Falcon 9 performs a brief "pitch kick" (~1.8 degrees east). From then on, gravity naturally rotates the velocity vector toward the horizon with zero angle of attack, eliminating transverse aerodynamic bending loads.',
    steps: [
      {
        stepNumber: 1,
        title: '2D Equations of Motion in Velocity Frame',
        latexFormula: 'm \\frac{dv}{dt} = T \\cos\\alpha - D - m g \\cos\\gamma',
        explanation: 'Tangential force balance along the velocity vector, where gamma is the flight path angle relative to vertical and alpha is angle of attack.',
        variableDefinitions: [
          { symbol: 'T', meaning: 'Engine thrust vector magnitude', unit: 'N' },
          { symbol: 'D', meaning: 'Aerodynamic drag force', unit: 'N' },
          { symbol: '\\gamma', meaning: 'Flight path angle from vertical', unit: 'rad' },
          { symbol: '\\alpha', meaning: 'Angle of attack (Pitch - Gamma)', unit: 'rad' }
        ],
        physicalInsight: 'Aligning thrust directly along the velocity vector (alpha = 0) eliminates transverse bending forces on the ultra-thin aluminum-lithium fuel tanks.'
      },
      {
        stepNumber: 2,
        title: 'Normal Component & Angular Turning Rate',
        latexFormula: 'm v \\frac{d\\gamma}{dt} = T \\sin\\alpha + m g \\sin\\gamma - \\frac{m v^2}{r + h} \\sin\\gamma',
        explanation: 'Normal force equation perpendicular to velocity vector governing how fast the rocket tilts toward horizontal.',
        variableDefinitions: [
          { symbol: '\\frac{d\\gamma}{dt}', meaning: 'Angular pitch turning rate of flight path', unit: 'rad/s' },
          { symbol: 'r + h', meaning: 'Distance from Earth center', unit: 'm' }
        ],
        physicalInsight: 'When alpha = 0 (zero lift turn), the turning rate simplifies to: d\\gamma / dt = (g / v) * sin(\\gamma). Gravity is doing 100% of the steering work for free!'
      },
      {
        stepNumber: 3,
        title: 'Gravity Loss & Drag Loss Energy Integration',
        latexFormula: '\\Delta v_{actual} = \\Delta v_{ideal} - \\int_{0}^{t_b} g \\cos\\gamma \\, dt - \\int_{0}^{t_b} \\frac{D}{m} \\, dt',
        explanation: 'Total required orbital speed (~7,800 m/s) requires overcoming ~1,200 m/s in gravity losses and ~200 m/s in aerodynamic drag losses.',
        variableDefinitions: [
          { symbol: '\\Delta v_{gravity}', meaning: 'Loss from fighting Earth gravitational pull', unit: 'm/s' },
          { symbol: '\\Delta v_{drag}', meaning: 'Loss from air friction resistance', unit: 'm/s' }
        ],
        physicalInsight: 'Plausible tradeoff: Pitching horizontal too fast increases drag in dense troposphere. Pitching too slow wastes energy fighting gravity vertically. The gravity turn balances both to perfection.'
      }
    ]
  },
  {
    id: 'stage-separation-physics',
    category: 'PROPULSION',
    title: 'Stage Separation & Pneumatic Impulse Mechanics',
    subtitle: 'Kinematics & Cold-Gas RCS Reorientation',
    summary: 'The physics of separating Stage 1 and Stage 2 at Mach 6+ in vacuum, preventing collision between stages.',
    iconName: 'Layers',
    practicalSpaceXContext: 'At T+2m24s at ~65 km altitude, MECO occurs. Pneumatic collet pushers expand, imparting a clean 1.5 m/s relative velocity separation without pyrotechnics. Nitrogen RCS thrusters then rotate the booster 180 degrees.',
    steps: [
      {
        stepNumber: 1,
        title: 'Pneumatic Pusher Impulsive Work-Energy',
        latexFormula: 'W_{pusher} = \\int_{0}^{x_{stroke}} F_{collet}(x) \\, dx = \\frac{1}{2} m_1 v_{rel,1}^2 + \\frac{1}{2} m_2 v_{rel,2}^2',
        explanation: 'SpaceX uses reusable pneumatic collets driven by high-pressure helium cylinders instead of explosive bolts.',
        variableDefinitions: [
          { symbol: 'F_{collet}', meaning: 'Pneumatic pusher force (~30 kN)', unit: 'N' },
          { symbol: 'x_{stroke}', meaning: 'Piston stroke distance (~0.4m)', unit: 'm' },
          { symbol: 'v_{rel}', meaning: 'Relative separation velocity (~1.5 m/s)', unit: 'm/s' }
        ],
        physicalInsight: 'Pneumatic pushers ensure zero explosive debris that could damage engine bell extensions or thermal insulation.'
      },
      {
        stepNumber: 2,
        title: 'Cold Gas RCS Attitude Torque Calculus',
        latexFormula: '\\tau_{RCS} = I_{booster} \\alpha_{rot} = F_{nitrogen} \\cdot L_{lever}',
        explanation: 'Cold nitrogen gas thrusters on the booster interstage fire to impart angular acceleration alpha to flip the booster 180 degrees for boostback burn.',
        variableDefinitions: [
          { symbol: 'I_{booster}', meaning: 'Booster moment of inertia (~2.5 x 10^7 kg·m²)', unit: 'kg·m²' },
          { symbol: 'L_{lever}', meaning: 'Distance from center of mass to thruster', unit: 'm' }
        ],
        physicalInsight: 'A 180-degree turn takes ~10 seconds in near-vacuum before the 3 Merlin engines re-ignite for the boostback burn.'
      }
    ]
  },
  {
    id: 'supersonic-retropropulsion-reentry',
    category: 'REENTRY',
    title: 'Supersonic Retropropulsion & Heat Shielding',
    subtitle: 'Aerothermodynamics & Counter-Flow Shock Wave Physics',
    summary: 'How SpaceX uses engine exhaust gas at Mach 3+ to create a protective bow shock wave shielding the booster from destructive reentry heating.',
    iconName: 'Shield',
    practicalSpaceXContext: 'At T+6m40s at 45 km altitude, the booster ignites 3 Merlin engines moving at Mach 4+. The high-pressure exhaust gas acts as a physical shield against incoming hypersonic air.',
    steps: [
      {
        stepNumber: 1,
        title: 'Hypersonic Reentry Heat Flux Formula (Fay-Riddell)',
        latexFormula: 'q_{heat} = C \\sqrt{\\frac{\\rho}{R_n}} v_{\\infty}^3',
        explanation: 'Aerodynamic stagnation heat flux scales with the cube of velocity (v^3) and square root of air density.',
        variableDefinitions: [
          { symbol: 'q_{heat}', meaning: 'Stagnation point convective heat flux', unit: 'W/m²' },
          { symbol: 'R_n', meaning: 'Nose radius of curvature', unit: 'm' }
        ],
        physicalInsight: 'Unmitigated Mach 6 reentry would incinerate the aluminum Merlin engine bells. Slowing down from Mach 6 to Mach 2 reduces heat flux by a factor of 27!'
      },
      {
        stepNumber: 2,
        title: 'Counter-Flow Stagnation Pressure Balance',
        latexFormula: 'P_{stagnation, exhaust} = \\rho_e v_e^2 + P_e \\ge \\rho_{\\infty} v_{\\infty}^2',
        explanation: 'Supersonic retropropulsion creates a turbulent stagnation zone upstream of the rocket engine bell.',
        variableDefinitions: [
          { symbol: 'P_{exhaust}', meaning: 'Engine plume stagnation pressure', unit: 'Pa' },
          { symbol: 'P_{ambient}', meaning: 'Incoming hypersonic shock pressure', unit: 'Pa' }
        ],
        physicalInsight: 'The exhaust plume pushes the primary shockwave hundreds of meters ahead of the booster, insulating the rocket structure inside a low-temperature recirculation bubble.'
      }
    ]
  },
  {
    id: 'grid-fin-aerodynamics',
    category: 'AERODYNAMICS',
    title: 'Titanium Grid Fin Aerodynamic Control',
    subtitle: 'Hypersonic Lift Vectoring & Drag Control Surfaces',
    summary: 'Grid fin aerodynamics, choked flow limits, and hypersonic pitch/roll/yaw control.',
    iconName: 'Grid',
    practicalSpaceXContext: 'Four 3D-cast titanium grid fins unfasten at high altitude. Operating at Mach 3 down to subsonic speeds, each fin can rotate independently to steer the 30-ton booster toward the ASDS drone ship crosshair.',
    steps: [
      {
        stepNumber: 1,
        title: 'Grid Fin Choked Flow & Wave Drag Spike',
        latexFormula: 'A_{choke}^* = A_{fin} \\left[ \\frac{\\gamma + 1}{2} \\right]^{-\\frac{\\gamma + 1}{2(\\gamma - 1)}} \\frac{1}{M}',
        explanation: 'At transonic speeds (Mach 0.9 - 1.2), shockwaves inside grid fin lattice cells choke internal airflow, causing a surge in wave drag.',
        variableDefinitions: [
          { symbol: 'M', meaning: 'Mach number', unit: 'dimensionless' },
          { symbol: '\\gamma', meaning: 'Specific heat ratio of air (1.4)', unit: 'dimensionless' }
        ],
        physicalInsight: 'Grid fins provide enormous drag braking capability in supersonic flight, helping bleed off kinetic energy passively.'
      },
      {
        stepNumber: 2,
        title: 'Control Torque Generation',
        latexFormula: '\\tau_{control} = \\frac{1}{2} \\rho v^2 A_{fin} C_{L,\\delta} \\cdot \\delta \\cdot L_{arm}',
        explanation: 'Deflecting a grid fin by angle delta produces a normal lift force perpendicular to the booster axis.',
        variableDefinitions: [
          { symbol: 'C_{L,\\delta}', meaning: 'Fin lift curve slope', unit: 'per radian' },
          { symbol: '\\delta', meaning: 'Fin cant angle deflection', unit: 'radians' }
        ],
        physicalInsight: 'Titanium fins withstand up to 1000°C temperatures without melting, replacing earlier aluminum grid fins that burned through during heavy missions.'
      }
    ]
  },
  {
    id: 'suicide-burn-hoverslam',
    category: 'LANDING',
    title: 'The "Suicide Burn" (Hoverslam) Exact Formula',
    subtitle: 'Non-Linear Differential Ignition Height Derivation',
    summary: 'The exact physics formula calculating the exact millisecond to ignite the landing engine so velocity reaches zero precisely at altitude h = 0.',
    iconName: 'Target',
    practicalSpaceXContext: 'Because a single Merlin 1D engine operating at minimum throttle (39%) produces more thrust than the weight of an empty booster (Thrust > Weight -> T/W > 1), the rocket cannot hover. It must perform a "Hoverslam" where velocity reaches zero at the exact moment legs touch the deck.',
    steps: [
      {
        stepNumber: 1,
        title: 'Kinematics under Constant Deceleration',
        latexFormula: 'v_f^2 = v_{entry}^2 + 2 a_{net} h_{burn} = 0 \\implies h_{burn} = \\frac{v_{entry}^2}{2 a_{net}}',
        explanation: 'Basic kinematic relation for constant net deceleration a_net.',
        variableDefinitions: [
          { symbol: 'v_{entry}', meaning: 'Terminal velocity before engine ignition (~250 m/s)', unit: 'm/s' },
          { symbol: 'a_{net}', meaning: 'Net upward deceleration: (T / m) - g', unit: 'm/s²' }
        ],
        physicalInsight: 'If the computer ignites 100 meters too high, the booster stops above the ocean and falls to its death. If it ignites 100 meters too low, it impacts the drone ship at high speed!'
      },
      {
        stepNumber: 2,
        title: 'Variable Mass & Drag Differential Equation',
        latexFormula: 'm(t) \\frac{dv}{dt} = T_{landing}(t) + \\frac{1}{2} \\rho(h) v^2 C_d A - m(t) g(h)',
        explanation: 'Accounting for decreasing fuel mass m(t) = m_dry + m_fuel(t) and atmospheric air resistance during deceleration.',
        variableDefinitions: [
          { symbol: 'T_{landing}', meaning: 'Throttleable Merlin 1D thrust (360 kN - 845 kN)', unit: 'N' }
        ],
        physicalInsight: 'As propellant burns off, the rocket becomes lighter, causing acceleration (T/m) to surge rapidly up to 3-4 Gs right before touchdown.'
      },
      {
        stepNumber: 3,
        title: 'Integral Ignition Height Equation',
        latexFormula: 'h_{ignition} = \\int_{0}^{v_{entry}} \\frac{v}{\\frac{T_{throttle}(t)}{m(t)} - g(h) + \\frac{\\rho(h) v^2 C_d A}{2 m(t)}} \\, dv',
        explanation: 'Numerical flight computers integrate this exact differential equation thousands of times per second to update ignition height in real-time.',
        variableDefinitions: [
          { symbol: 'h_{ignition}', meaning: 'Computed radar altimeter ignition threshold', unit: 'meters' }
        ],
        physicalInsight: 'Real-time convex optimization algorithms (G-FOLD) solve this on board the Falcon 9 flight computer every 10 milliseconds.'
      }
    ]
  },
  {
    id: 'orbital-mechanics-visviva',
    category: 'ORBITAL',
    title: 'Orbital Velocity & The Vis-Viva Equation',
    subtitle: 'Keplerian Mechanics & Second Stage Insertion',
    summary: 'The orbital physics governing how Stage 2 delivers payload into stable Earth orbit.',
    iconName: 'Orbit',
    practicalSpaceXContext: 'Stage 2 accelerates to 27,000 km/h (7.5 km/s) at 200 km altitude, achieving stable LEO orbit where centrifugal acceleration equals gravitational force.',
    steps: [
      {
        stepNumber: 1,
        title: 'Circular Orbital Speed Balance',
        latexFormula: '\\frac{G M_e m}{r^2} = \\frac{m v_{orbit}^2}{r} \\implies v_{orbit} = \\sqrt{\\frac{G M_e}{r}}',
        explanation: 'Balance between Earth gravitational pull and centripetal acceleration.',
        variableDefinitions: [
          { symbol: 'G M_e', meaning: 'Earth standard gravitational parameter (3.986 x 10^14)', unit: 'm³/s²' },
          { symbol: 'r', meaning: 'Orbital radius from Earth center (R_e + h)', unit: 'm' }
        ],
        physicalInsight: 'At 200 km altitude, r = 6,571,000 m. Plugging in numbers gives v_orbit = 7,784 m/s (Mach 23!).'
      },
      {
        stepNumber: 2,
        title: 'The Vis-Viva Energy Equation',
        latexFormula: 'v^2 = G M_e \\left( \\frac{2}{r} - \\frac{1}{a} \\right)',
        explanation: 'Relates instantaneous velocity v at any point on an elliptical orbit with semi-major axis a.',
        variableDefinitions: [
          { symbol: 'a', meaning: 'Semi-major axis of orbit', unit: 'm' },
          { symbol: 'r', meaning: 'Current distance from Earth focus', unit: 'm' }
        ],
        physicalInsight: 'The Vis-Viva equation governs orbital maneuvering, Hohmann transfer orbits to Geostationary Transfer Orbit (GTO), and Trans-Mars Injection for Starship!'
      }
    ]
  }
];

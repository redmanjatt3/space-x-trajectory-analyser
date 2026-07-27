import { RocketSpec } from '../types';

export const EARTH_CONSTANTS = {
  G: 6.67430e-11, // Universal Gravitational Constant m^3 kg^-1 s^-2
  MASS: 5.9722e24, // kg
  RADIUS: 6371000, // meters
  G0: 9.80665, // m/s^2 standard gravity at sea level
  SEA_LEVEL_DENSITY: 1.225, // kg/m^3
  SCALE_HEIGHT: 8500, // meters (isothermal scale height)
  SEA_LEVEL_SPEED_OF_SOUND: 340.29, // m/s
  EARTH_ROTATION_SPEED_EQUATOR: 465.1, // m/s eastward assistance
};

export const ATMOSPHERIC_LAYERS = [
  { name: 'Troposphere', maxAlt: 12000, color: 'rgba(59, 130, 246, 0.2)', label: '0 - 12 km (Weather & Dense Drag)' },
  { name: 'Stratosphere', maxAlt: 50000, color: 'rgba(99, 102, 241, 0.15)', label: '12 - 50 km (Ozone & Max Q Boundary)' },
  { name: 'Mesosphere', maxAlt: 85000, color: 'rgba(168, 85, 247, 0.1)', label: '50 - 85 km (Meteors & Entry Burn Start)' },
  { name: 'Thermosphere', maxAlt: 600000, color: 'rgba(236, 72, 153, 0.05)', label: '85 - 600 km (Kármán Line 100km & Orbit)' },
];

export const ROCKET_SPECS: Record<string, RocketSpec> = {
  falcon9: {
    id: 'falcon9',
    name: 'Falcon 9 Block 5',
    tagline: 'Two-stage partially reusable medium-lift launch vehicle',
    description: 'Powered by 9 Merlin 1D engines burning RP-1 and LOX. Reusable first stage lands on ASDS drone ship or landing pad.',
    height: 70, // meters
    diameter: 3.7, // meters
    crossSectionArea: Math.PI * Math.pow(3.7 / 2, 2), // ~10.75 m^2
    dragCoefficient: 0.38,
    
    firstStage: {
      dryMass: 22200, // kg
      propellantMass: 418700, // kg
      engine: {
        name: 'Merlin 1D (x9)',
        countFirstStage: 9,
        countSecondStage: 0,
        thrustSeaLevel: 7607, // kN (9 * 845 kN)
        thrustVacuum: 8451, // kN (9 * 939 kN)
        ispSeaLevel: 282, // s
        ispVacuum: 311, // s
      },
    },
    
    secondStage: {
      dryMass: 4000, // kg
      propellantMass: 107500, // kg
      engine: {
        name: 'Merlin Vacuum (MVac)',
        countFirstStage: 0,
        countSecondStage: 1,
        thrustSeaLevel: 0,
        thrustVacuum: 981, // kN
        ispSeaLevel: 200,
        ispVacuum: 348, // s
      },
    },
    
    defaultPayloadMass: 15600, // kg to LEO
  },
  
  falconHeavy: {
    id: 'falconHeavy',
    name: 'Falcon Heavy',
    tagline: 'Heavy-lift launch vehicle consisting of 3 Falcon 9 cores',
    description: 'Utilizes 27 Merlin 1D engines generating over 22.8 MN of thrust at liftoff. Dual booster landing + center core entry.',
    height: 70,
    diameter: 12.2, // effective total cross width
    crossSectionArea: Math.PI * Math.pow(3.7 / 2, 2) * 2.8,
    dragCoefficient: 0.42,
    
    firstStage: {
      dryMass: 66600, // 3 cores dry
      propellantMass: 1256100, // 3 cores prop
      engine: {
        name: 'Merlin 1D (x27)',
        countFirstStage: 27,
        countSecondStage: 0,
        thrustSeaLevel: 22819, // kN
        thrustVacuum: 25353, // kN
        ispSeaLevel: 282,
        ispVacuum: 311,
      },
    },
    
    secondStage: {
      dryMass: 4000,
      propellantMass: 107500,
      engine: {
        name: 'Merlin Vacuum (MVac)',
        countFirstStage: 0,
        countSecondStage: 1,
        thrustSeaLevel: 0,
        thrustVacuum: 981,
        ispSeaLevel: 200,
        ispVacuum: 348,
      },
    },
    
    defaultPayloadMass: 35000,
  },
  
  starship: {
    id: 'starship',
    name: 'Starship & Super Heavy',
    tagline: 'Fully reusable super heavy-lift launch system',
    description: 'Super Heavy booster powered by 33 Raptor 2 engines burning liquid methane and LOX ($I_{sp} \approx 327\text{s}$ sea level, $380\text{s}$ vacuum).',
    height: 121,
    diameter: 9.0,
    crossSectionArea: Math.PI * Math.pow(9.0 / 2, 2), // ~63.6 m^2
    dragCoefficient: 0.35,
    
    firstStage: {
      dryMass: 200000, // Super Heavy dry mass kg
      propellantMass: 3400000, // Super Heavy prop mass kg
      engine: {
        name: 'Raptor 2 (x33)',
        countFirstStage: 33,
        countSecondStage: 0,
        thrustSeaLevel: 74300, // kN total (~230 tf per engine)
        thrustVacuum: 81500,
        ispSeaLevel: 327,
        ispVacuum: 350,
      },
    },
    
    secondStage: {
      dryMass: 100000,
      propellantMass: 1200000,
      engine: {
        name: 'Raptor Sea + Vacuum (x6)',
        countFirstStage: 0,
        countSecondStage: 6,
        thrustSeaLevel: 14700,
        thrustVacuum: 15600,
        ispSeaLevel: 327,
        ispVacuum: 380,
      },
    },
    
    defaultPayloadMass: 100000,
  },
};

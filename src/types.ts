export type RocketModelId = 'falcon9' | 'falconHeavy' | 'starship';

export interface RocketEngineSpec {
  name: string;
  countFirstStage: number;
  countSecondStage: number;
  thrustSeaLevel: number; // kN total
  thrustVacuum: number; // kN total
  ispSeaLevel: number; // seconds
  ispVacuum: number; // seconds
}

export interface RocketSpec {
  id: RocketModelId;
  name: string;
  tagline: string;
  description: string;
  height: number; // meters
  diameter: number; // meters
  crossSectionArea: number; // m^2
  dragCoefficient: number; // Cd
  
  firstStage: {
    dryMass: number; // kg
    propellantMass: number; // kg
    engine: RocketEngineSpec;
  };
  
  secondStage: {
    dryMass: number; // kg
    propellantMass: number; // kg
    engine: RocketEngineSpec;
  };
  
  defaultPayloadMass: number; // kg
}

export type FlightPhase =
  | 'PRELAUNCH'
  | 'LIFTOFF'
  | 'PITCH_KICK'
  | 'GRAVITY_TURN'
  | 'MAX_Q'
  | 'MECO'
  | 'STAGE_SEP'
  | 'SECOND_STAGE_BURN'
  | 'BOOSTBACK_BURN'
  | 'UNPOWERED_COAST'
  | 'GRID_FIN_REENTRY'
  | 'ENTRY_BURN'
  | 'TRANSONIC_DESCENT'
  | 'SUICIDE_BURN'
  | 'TOUCHDOWN'
  | 'ORBITAL_INSERTION';

export interface TelemetryPoint {
  time: number; // seconds
  altitude: number; // meters
  downrange: number; // meters
  vx: number; // m/s horizontal
  vy: number; // m/s vertical
  velocity: number; // m/s total
  mach: number; // Mach number
  acceleration: number; // m/s^2
  gForce: number; // Gs
  dynamicPressure: number; // kPa (q)
  massFirstStage: number; // kg
  massSecondStage: number; // kg
  pitchAngle: number; // degrees from vertical
  angleOfAttack: number; // degrees
  thrustFirstStage: number; // kN
  thrustSecondStage: number; // kN
  dragForce: number; // kN
  atmosphericDensity: number; // kg/m^3
  phase: FlightPhase;
  phaseLabel: string;
  
  // Second stage position (after separation)
  secondStageAltitude?: number;
  secondStageDownrange?: number;
  secondStageVelocity?: number;
}

export interface DerivationStep {
  stepNumber: number;
  title: string;
  latexFormula: string;
  explanation: string;
  variableDefinitions: { symbol: string; meaning: string; unit: string }[];
  physicalInsight: string;
}

export interface TopicDerivation {
  id: string;
  category: 'PROPULSION' | 'AERODYNAMICS' | 'GRAVITY_TURN' | 'REENTRY' | 'LANDING' | 'ORBITAL';
  title: string;
  subtitle: string;
  summary: string;
  iconName: string;
  steps: DerivationStep[];
  practicalSpaceXContext: string;
}

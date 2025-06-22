export const BlockTypes = {
  PID_CONTROLLER: 'pid-controller',
  TRANSFER_FUNCTION: 'transfer-function',
  GAIN_BLOCK: 'gain-block',
  STEP_INPUT: 'step-input',
  SINE_WAVE: 'sine-wave',
  PLANT_MODEL: 'plant-model',
  SENSOR: 'sensor'
} as const;

export type BlockType = typeof BlockTypes[keyof typeof BlockTypes];

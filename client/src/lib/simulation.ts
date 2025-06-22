export async function processPIDBlock(
  block: any,
  calculatePID: (params: any) => Promise<{ output: number }>,
  simulation: any,
  updateSimulationData: (id: string, data: number[]) => void
) {
  const { kp, ki, kd, sampleTime = 0.01 } = block.data.properties;

  // Placeholder input values until connection logic is implemented
  const setpoint = 1.0;
  const processValue = 0.5;

  const result = await calculatePID({
    kp,
    ki,
    kd,
    setpoint,
    processValue,
    dt: sampleTime
  });

  const currentData = simulation.data[block.id] || [];
  updateSimulationData(block.id, [...currentData, result.output]);
}

export async function processTransferFunctionBlock(
  block: any,
  calculateTransferFunction: (params: any) => Promise<number[]>,
  simulation: any,
  updateSimulationData: (id: string, data: number[]) => void
) {
  const { numerator, denominator } = block.data.properties;
  const input = [1.0];

  const result = await calculateTransferFunction({
    numerator,
    denominator,
    input,
    sampleTime: simulation.sampleTime
  });

  const currentData = simulation.data[block.id] || [];
  updateSimulationData(block.id, [...currentData, result[0] || 0]);
}

export function processStepInputBlock(
  block: any,
  time: number,
  simulation: any,
  updateSimulationData: (id: string, data: number[]) => void
) {
  const { amplitude, stepTime } = block.data.properties;
  const output = time >= stepTime ? amplitude : 0;

  const currentData = simulation.data[block.id] || [];
  updateSimulationData(block.id, [...currentData, output]);
}

export function processSineWaveBlock(
  block: any,
  time: number,
  simulation: any,
  updateSimulationData: (id: string, data: number[]) => void
) {
  const { amplitude, frequency, phase } = block.data.properties;
  const output = amplitude * Math.sin(2 * Math.PI * frequency * time + phase);

  const currentData = simulation.data[block.id] || [];
  updateSimulationData(block.id, [...currentData, output]);
}

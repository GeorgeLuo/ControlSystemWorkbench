
// Control System Computation Worker
export interface WorkerMessage {
  id: string;
  type: 'pid_calculation' | 'transfer_function' | 'step_response' | 'frequency_response';
  data: any;
}

export interface WorkerResponse {
  id: string;
  type: string;
  result: any;
  error?: string;
}

// PID Controller calculation
function calculatePID(params: {
  kp: number;
  ki: number;
  kd: number;
  setpoint: number;
  processValue: number;
  dt: number;
  previousError?: number;
  integral?: number;
}) {
  const { kp, ki, kd, setpoint, processValue, dt, previousError = 0, integral = 0 } = params;
  
  const error = setpoint - processValue;
  const newIntegral = integral + error * dt;
  const derivative = (error - previousError) / dt;
  
  const output = kp * error + ki * newIntegral + kd * derivative;
  
  return {
    output,
    error,
    integral: newIntegral,
    derivative
  };
}

// Transfer function calculation
function calculateTransferFunction(params: {
  numerator: number[];
  denominator: number[];
  input: number[];
  sampleTime: number;
}) {
  const { numerator, denominator, input, sampleTime } = params;
  const output: number[] = [];
  
  // Simple discrete transfer function implementation
  for (let i = 0; i < input.length; i++) {
    let outputValue = 0;
    
    // Numerator terms
    for (let j = 0; j < numerator.length && i - j >= 0; j++) {
      outputValue += numerator[j] * input[i - j];
    }
    
    // Denominator terms (excluding a0)
    for (let j = 1; j < denominator.length && i - j >= 0; j++) {
      outputValue -= denominator[j] * output[i - j];
    }
    
    output[i] = outputValue / (denominator[0] || 1);
  }
  
  return output;
}

// Step response calculation
function calculateStepResponse(params: {
  numerator: number[];
  denominator: number[];
  amplitude: number;
  duration: number;
  sampleTime: number;
}) {
  const { numerator, denominator, amplitude, duration, sampleTime } = params;
  const numSamples = Math.floor(duration / sampleTime);
  const input = new Array(numSamples).fill(amplitude);
  
  return calculateTransferFunction({ numerator, denominator, input, sampleTime });
}

// Frequency response calculation
function calculateFrequencyResponse(params: {
  numerator: number[];
  denominator: number[];
  frequencies: number[];
}) {
  const { numerator, denominator, frequencies } = params;
  const response = frequencies.map(freq => {
    const s = { real: 0, imag: 2 * Math.PI * freq };
    
    // Calculate numerator at s
    let numReal = 0, numImag = 0;
    for (let i = 0; i < numerator.length; i++) {
      const power = numerator.length - 1 - i;
      const sPower = complexPower(s, power);
      numReal += numerator[i] * sPower.real;
      numImag += numerator[i] * sPower.imag;
    }
    
    // Calculate denominator at s
    let denReal = 0, denImag = 0;
    for (let i = 0; i < denominator.length; i++) {
      const power = denominator.length - 1 - i;
      const sPower = complexPower(s, power);
      denReal += denominator[i] * sPower.real;
      denImag += denominator[i] * sPower.imag;
    }
    
    // Complex division: num/den
    const denMagSq = denReal * denReal + denImag * denImag;
    const magnitude = Math.sqrt((numReal * denReal + numImag * denImag) ** 2 + (numImag * denReal - numReal * denImag) ** 2) / denMagSq;
    const phase = Math.atan2(numImag * denReal - numReal * denImag, numReal * denReal + numImag * denImag);
    
    return {
      frequency: freq,
      magnitude: 20 * Math.log10(magnitude), // Convert to dB
      phase: phase * 180 / Math.PI // Convert to degrees
    };
  });
  
  return response;
}

function complexPower(complex: { real: number; imag: number }, power: number) {
  if (power === 0) return { real: 1, imag: 0 };
  if (power === 1) return complex;
  
  let result = { real: 1, imag: 0 };
  for (let i = 0; i < power; i++) {
    const newReal = result.real * complex.real - result.imag * complex.imag;
    const newImag = result.real * complex.imag + result.imag * complex.real;
    result = { real: newReal, imag: newImag };
  }
  return result;
}

// Worker message handler
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { id, type, data } = e.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'pid_calculation':
        result = calculatePID(data);
        break;
        
      case 'transfer_function':
        result = calculateTransferFunction(data);
        break;
        
      case 'step_response':
        result = calculateStepResponse(data);
        break;
        
      case 'frequency_response':
        result = calculateFrequencyResponse(data);
        break;
        
      default:
        throw new Error(`Unknown calculation type: ${type}`);
    }
    
    const response: WorkerResponse = { id, type, result };
    self.postMessage(response);
    
  } catch (error) {
    const response: WorkerResponse = { 
      id, 
      type, 
      result: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
    self.postMessage(response);
  }
};

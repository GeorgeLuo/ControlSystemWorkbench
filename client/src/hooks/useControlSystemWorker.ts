
import { useCallback, useEffect, useRef } from 'react';
import { WorkerMessage, WorkerResponse } from '@/workers/controlSystemWorker';

interface UseControlSystemWorkerOptions {
  onResult?: (response: WorkerResponse) => void;
  onError?: (error: string) => void;
}

export function useControlSystemWorker(options: UseControlSystemWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const pendingCalculations = useRef<Map<string, (response: WorkerResponse<unknown>) => void>>(new Map());

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/controlSystemWorker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse<unknown>>) => {
      const response = e.data;
      const callback = pendingCalculations.current.get(response.id);
      
      if (callback) {
        callback(response);
        pendingCalculations.current.delete(response.id);
      }
      
      if (response.error) {
        options.onError?.(response.error);
      } else {
        options.onResult?.(response);
      }
    };

    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error);
      options.onError?.('Worker computation failed');
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [options.onResult, options.onError]);

  // Calculate function
  const calculate = useCallback(async <T>(
    type: WorkerMessage['type'],
    data: unknown
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const id = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      pendingCalculations.current.set(id, (response: WorkerResponse<T>) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
      });

      const message: WorkerMessage<typeof data> = { id, type, data };
      workerRef.current.postMessage(message);
    });
  }, []);

  // Specific calculation methods
  interface PIDParams {
    kp: number;
    ki: number;
    kd: number;
    setpoint: number;
    processValue: number;
    dt: number;
    previousError?: number;
    integral?: number;
  }

  interface PIDResult {
    output: number;
    error: number;
    integral: number;
    derivative: number;
  }

  const calculatePID = useCallback((params: PIDParams) =>
    calculate<PIDResult>('pid_calculation', params), [calculate]);

  interface TransferFunctionParams {
    numerator: number[];
    denominator: number[];
    input: number[];
    sampleTime: number;
  }

  const calculateTransferFunction = useCallback((params: TransferFunctionParams) =>
    calculate<number[]>('transfer_function', params), [calculate]);

  interface StepResponseParams {
    numerator: number[];
    denominator: number[];
    amplitude: number;
    duration: number;
    sampleTime: number;
  }

  const calculateStepResponse = useCallback((params: StepResponseParams) =>
    calculate<number[]>('step_response', params), [calculate]);

  interface FrequencyResponseParams {
    numerator: number[];
    denominator: number[];
    frequencies: number[];
  }

  interface FrequencyResponseResult {
    frequency: number;
    magnitude: number;
    phase: number;
  }

  const calculateFrequencyResponse = useCallback((params: FrequencyResponseParams) =>
    calculate<FrequencyResponseResult[]>('frequency_response', params), [calculate]);

  return {
    calculatePID,
    calculateTransferFunction,
    calculateStepResponse,
    calculateFrequencyResponse,
    calculate
  };
}

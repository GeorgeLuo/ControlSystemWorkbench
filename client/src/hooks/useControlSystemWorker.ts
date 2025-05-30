
import { useCallback, useEffect, useRef } from 'react';
import { WorkerMessage, WorkerResponse } from '@/workers/controlSystemWorker';

interface UseControlSystemWorkerOptions {
  onResult?: (response: WorkerResponse) => void;
  onError?: (error: string) => void;
}

export function useControlSystemWorker(options: UseControlSystemWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const pendingCalculations = useRef<Map<string, (response: WorkerResponse) => void>>(new Map());

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/controlSystemWorker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
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
  const calculate = useCallback(async <T = any>(
    type: WorkerMessage['type'],
    data: any
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const id = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      pendingCalculations.current.set(id, (response: WorkerResponse) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
      });

      const message: WorkerMessage = { id, type, data };
      workerRef.current.postMessage(message);
    });
  }, []);

  // Specific calculation methods
  const calculatePID = useCallback((params: {
    kp: number;
    ki: number;
    kd: number;
    setpoint: number;
    processValue: number;
    dt: number;
    previousError?: number;
    integral?: number;
  }) => calculate('pid_calculation', params), [calculate]);

  const calculateTransferFunction = useCallback((params: {
    numerator: number[];
    denominator: number[];
    input: number[];
    sampleTime: number;
  }) => calculate('transfer_function', params), [calculate]);

  const calculateStepResponse = useCallback((params: {
    numerator: number[];
    denominator: number[];
    amplitude: number;
    duration: number;
    sampleTime: number;
  }) => calculate('step_response', params), [calculate]);

  const calculateFrequencyResponse = useCallback((params: {
    numerator: number[];
    denominator: number[];
    frequencies: number[];
  }) => calculate('frequency_response', params), [calculate]);

  return {
    calculatePID,
    calculateTransferFunction,
    calculateStepResponse,
    calculateFrequencyResponse,
    calculate
  };
}

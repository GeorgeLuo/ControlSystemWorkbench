
import { useEffect, useRef } from 'react';
import { useWorkbenchStore } from '@/store/workbench';
import { useControlSystemWorker } from '@/hooks/useControlSystemWorker';

export default function SimulationEngine() {
  const { 
    blocks, 
    connections, 
    simulation, 
    updateSimulationData, 
    setSimulationTime, 
    stopSimulation 
  } = useWorkbenchStore();
  
  const simulationRef = useRef<number>();
  const timeRef = useRef(0);
  
  const { 
    calculatePID, 
    calculateTransferFunction, 
    calculateStepResponse 
  } = useControlSystemWorker({
    onResult: (response) => {
      console.log('Calculation completed:', response.type);
    },
    onError: (error) => {
      console.error('Calculation error:', error);
    }
  });

  // Run simulation loop
  useEffect(() => {
    if (!simulation.isRunning) {
      if (simulationRef.current) {
        cancelAnimationFrame(simulationRef.current);
      }
      return;
    }

    const runSimulationStep = async () => {
      timeRef.current += simulation.sampleTime;
      
      if (timeRef.current >= simulation.duration) {
        stopSimulation();
        return;
      }

      // Process each block
      for (const block of blocks) {
        try {
          switch (block.type) {
            case 'pid-controller':
              await processPIDBlock(block);
              break;
            case 'transfer-function':
              await processTransferFunctionBlock(block);
              break;
            case 'step-input':
              processStepInputBlock(block);
              break;
            case 'sine-wave':
              processSineWaveBlock(block);
              break;
          }
        } catch (error) {
          console.error(`Error processing block ${block.id}:`, error);
        }
      }

      setSimulationTime(timeRef.current);
      
      // Schedule next simulation step
      simulationRef.current = requestAnimationFrame(runSimulationStep);
    };

    // Start simulation
    timeRef.current = 0;
    simulationRef.current = requestAnimationFrame(runSimulationStep);

    return () => {
      if (simulationRef.current) {
        cancelAnimationFrame(simulationRef.current);
      }
    };
  }, [simulation.isRunning, blocks, simulation.sampleTime, simulation.duration]);

  const processPIDBlock = async (block: any) => {
    const { kp, ki, kd, sampleTime = 0.01 } = block.data.properties;
    
    // Get input from connected blocks (simplified)
    const setpoint = 1.0; // Example setpoint
    const processValue = 0.5; // Example process value
    
    const result = await calculatePID({
      kp,
      ki,
      kd,
      setpoint,
      processValue,
      dt: sampleTime,
    });

    // Store result for visualization
    const currentData = simulation.data[block.id] || [];
    updateSimulationData(block.id, [...currentData, result.output]);
  };

  const processTransferFunctionBlock = async (block: any) => {
    const { numerator, denominator } = block.data.properties;
    
    // Get input signal (simplified)
    const input = [1.0]; // Example input
    
    const result = await calculateTransferFunction({
      numerator,
      denominator,
      input,
      sampleTime: simulation.sampleTime,
    });

    const currentData = simulation.data[block.id] || [];
    updateSimulationData(block.id, [...currentData, result[0] || 0]);
  };

  const processStepInputBlock = (block: any) => {
    const { amplitude, stepTime } = block.data.properties;
    const output = timeRef.current >= stepTime ? amplitude : 0;
    
    const currentData = simulation.data[block.id] || [];
    updateSimulationData(block.id, [...currentData, output]);
  };

  const processSineWaveBlock = (block: any) => {
    const { amplitude, frequency, phase } = block.data.properties;
    const output = amplitude * Math.sin(2 * Math.PI * frequency * timeRef.current + phase);
    
    const currentData = simulation.data[block.id] || [];
    updateSimulationData(block.id, [...currentData, output]);
  };

  // This component doesn't render anything visible
  return null;
}

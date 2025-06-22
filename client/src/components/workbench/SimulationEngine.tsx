
import { useEffect, useRef } from 'react';
import { useWorkbenchStore } from '@/store/workbench';
import { useControlSystemWorker } from '@/hooks/useControlSystemWorker';
import {
  processPIDBlock,
  processTransferFunctionBlock,
  processStepInputBlock,
  processSineWaveBlock
} from '@/lib/simulation';
import { BlockTypes } from '@/constants/blockTypes';

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
            case BlockTypes.PID_CONTROLLER:
              await processPIDBlock(
                block,
                calculatePID,
                simulation,
                updateSimulationData
              );
              break;
            case BlockTypes.TRANSFER_FUNCTION:
              await processTransferFunctionBlock(
                block,
                calculateTransferFunction,
                simulation,
                updateSimulationData
              );
              break;
            case BlockTypes.STEP_INPUT:
              processStepInputBlock(
                block,
                timeRef.current,
                simulation,
                updateSimulationData
              );
              break;
            case BlockTypes.SINE_WAVE:
              processSineWaveBlock(
                block,
                timeRef.current,
                simulation,
                updateSimulationData
              );
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


  // This component doesn't render anything visible
  return null;
}

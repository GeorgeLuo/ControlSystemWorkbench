import { test, strictEqual } from 'node:test';
import {
  processPIDBlock,
  processTransferFunctionBlock,
  processStepInputBlock,
  processSineWaveBlock
} from '../client/src/lib/simulation';

test('processPIDBlock updates data with PID output', async () => {
  const block = { id: '1', data: { properties: { kp: 1, ki: 0, kd: 0, sampleTime: 0.01 } }, type: 'pid-controller' };
  const simulation = { sampleTime: 0.01, data: {} };
  const mockCalc = async () => ({ output: 5 });
  let calledWith: any[] = [];
  const update = (id: string, data: number[]) => { calledWith = [id, data]; };

  await processPIDBlock(block, mockCalc, simulation, update);
  strictEqual(calledWith[0], '1');
  strictEqual(calledWith[1][0], 5);
});

test('processTransferFunctionBlock stores first result value', async () => {
  const block = { id: '2', data: { properties: { numerator: [1], denominator: [1] } }, type: 'transfer-function' };
  const simulation = { sampleTime: 0.02, data: {} };
  const mockCalc = async () => [3];
  let result: any[] = [];
  const update = (id: string, data: number[]) => { result = [id, data]; };

  await processTransferFunctionBlock(block, mockCalc, simulation, update);
  strictEqual(result[0], '2');
  strictEqual(result[1][0], 3);
});

test('processStepInputBlock emits amplitude after step time', () => {
  const block = { id: '3', data: { properties: { amplitude: 2, stepTime: 1 } }, type: 'step-input' };
  const simulation = { data: {} };
  let res: any[] = [];
  const update = (id: string, data: number[]) => { res = [id, data]; };

  processStepInputBlock(block, 1.5, simulation, update);
  strictEqual(res[0], '3');
  strictEqual(res[1][0], 2);
});

test('processSineWaveBlock computes sine value', () => {
  const block = { id: '4', data: { properties: { amplitude: 1, frequency: 0.5, phase: 0 } }, type: 'sine-wave' };
  const simulation = { data: {} };
  let res: any[] = [];
  const update = (id: string, data: number[]) => { res = [id, data]; };

  processSineWaveBlock(block, 0.25, simulation, update);
  strictEqual(res[0], '4');
  strictEqual(Math.round(res[1][0] * 1000) / 1000, 1);
});

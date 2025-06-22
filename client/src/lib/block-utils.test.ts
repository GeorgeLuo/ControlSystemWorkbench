import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSubtitleForTool,
  getBlockTypeFromLabel,
  getPropertiesFromSubtitle,
} from './block-utils.js';

// getSubtitleForTool tests
describe('getSubtitleForTool', () => {
  it('returns defaults for known tools', () => {
    assert.equal(getSubtitleForTool('pid-controller'), 'Kp=1, Ki=0.1, Kd=0.05');
    assert.equal(getSubtitleForTool('transfer-function'), '1/(s+1)');
    assert.equal(getSubtitleForTool('gain-block'), 'K=1.0');
  });
});

// getBlockTypeFromLabel tests
describe('getBlockTypeFromLabel', () => {
  it('converts label to kebab-case', () => {
    assert.equal(getBlockTypeFromLabel('PID Controller'), 'pid-controller');
  });
});

// getPropertiesFromSubtitle tests
describe('getPropertiesFromSubtitle', () => {
  it('parses PID parameters', () => {
    const props = getPropertiesFromSubtitle('Kp=2, Ki=0.5, Kd=0.1');
    assert.deepEqual(props, { kp: 2, ki: 0.5, kd: 0.1 });
  });

  it('parses transfer function', () => {
    const props = getPropertiesFromSubtitle('1/(s²+2s+1)');
    assert.deepEqual(props, {
      numerator: ['1'],
      denominator: ['s²', '2s', '1'],
    });
  });

  it('parses gain', () => {
    assert.deepEqual(getPropertiesFromSubtitle('K=3'), { gain: 3 });
  });

  it('parses amplitude', () => {
    assert.deepEqual(getPropertiesFromSubtitle('Amp=2'), { amplitude: 2 });
  });

  it('parses frequency', () => {
    assert.deepEqual(getPropertiesFromSubtitle('f=1Hz'), { frequency: 1 });
  });

  it('returns empty object for unknown', () => {
    assert.deepEqual(getPropertiesFromSubtitle(''), {});
  });
});

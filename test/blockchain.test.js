/**
 * Blockchain contract ABI tests
 *
 * Loads the compiled HospitalRecords artefact produced by Truffle and asserts
 * that every smart-contract method the backend controllers call is present
 * in the ABI. If Truffle migrations are out of date, this test fails loudly
 * instead of the backend throwing a cryptic runtime error.
 */
const path = require('path');
const fs = require('fs');

const ARTEFACT_PATH = path.join(
  __dirname,
  '..',
  'blockchain',
  'build',
  'contracts',
  'HospitalRecords.json'
);

describe('Blockchain — HospitalRecords ABI', () => {
  let artefact;

  beforeAll(() => {
    expect(fs.existsSync(ARTEFACT_PATH)).toBe(true);
    artefact = JSON.parse(fs.readFileSync(ARTEFACT_PATH, 'utf8'));
  });

  test('artefact has a non-empty ABI array', () => {
    expect(Array.isArray(artefact.abi)).toBe(true);
    expect(artefact.abi.length).toBeGreaterThan(0);
  });

  test('ABI exposes every method the backend calls', () => {
    const required = [
      'logAppointment',
      'logBilling',
      'logPrescription',
      'payBillOnChain',
      'getAppointment',
      'getBilling',
      'getPrescription',
    ];
    const names = artefact.abi
      .filter((e) => e.type === 'function')
      .map((e) => e.name);
    for (const fn of required) {
      expect(names).toContain(fn);
    }
  });

  test('payBillOnChain is marked payable', () => {
    const fn = artefact.abi.find(
      (e) => e.type === 'function' && e.name === 'payBillOnChain'
    );
    expect(fn).toBeDefined();
    expect(fn.stateMutability).toBe('payable');
  });
});

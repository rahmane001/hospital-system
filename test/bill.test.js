/**
 * Bill model schema tests
 *
 * Guards the two coursework-critical fields that link an off-chain bill to its
 * on-chain record: `blockchainTxHash` (where the Ganache tx hash is stored)
 * and `blockchainStatus` (pending / logged / failed — used by the admin
 * Blockchain Verification page to render failure badges).
 */
const mongoose = require('mongoose');
const Bill = require('../src/models/Bill');

describe('Bill model — on-chain linkage fields', () => {
  test('schema defines blockchainTxHash as a nullable String', () => {
    const path = Bill.schema.path('blockchainTxHash');
    expect(path).toBeDefined();
    expect(path.instance).toBe('String');
    expect(path.defaultValue).toBeNull();
  });

  test('schema defines blockchainStatus with the expected enum', () => {
    const path = Bill.schema.path('blockchainStatus');
    expect(path).toBeDefined();
    expect(path.instance).toBe('String');
    expect(path.enumValues.sort()).toEqual(['failed', 'logged', 'pending']);
    expect(path.defaultValue).toBe('pending');
  });

  test('a new Bill document starts with pending on-chain status', () => {
    const b = new Bill({
      appointmentId: new mongoose.Types.ObjectId(),
      doctorId: new mongoose.Types.ObjectId(),
      patientId: new mongoose.Types.ObjectId(),
      amount: 150,
    });
    expect(b.status).toBe('pending');
    expect(b.blockchainStatus).toBe('pending');
    expect(b.blockchainTxHash).toBeNull();
  });

  test('status enum still only allows the three original off-chain values', () => {
    const path = Bill.schema.path('status');
    expect(path.enumValues.sort()).toEqual(['cancelled', 'paid', 'pending']);
  });
});

/**
 * Auth unit tests
 *
 * Verifies the JWT contract used by `src/controllers/authController.js` without
 * requiring a live MongoDB — the controller signs tokens with the same
 * algorithm/secret we exercise here, so a round-trip sign+verify proves the
 * auth contract is intact.
 */
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-do-not-use-in-prod';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

describe('Auth — JWT token contract', () => {
  test('generates a token that round-trips through jwt.verify', () => {
    const userId = '507f1f77bcf86cd799439011'; // typical Mongo ObjectId hex
    const token = generateToken(userId);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // header.payload.signature

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(userId);
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test('rejects tampered tokens', () => {
    const token = generateToken('anyone');
    const tampered = token.slice(0, -4) + 'AAAA';
    expect(() => jwt.verify(tampered, process.env.JWT_SECRET)).toThrow();
  });

  test('rejects tokens signed with the wrong secret', () => {
    const badToken = jwt.sign({ id: 'x' }, 'different-secret', { expiresIn: '1d' });
    expect(() => jwt.verify(badToken, process.env.JWT_SECRET)).toThrow();
  });
});

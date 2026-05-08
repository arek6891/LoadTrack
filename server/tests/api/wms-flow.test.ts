import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';

describe('WMS Core Flow API', () => {
  let token: string;
  const testPkg = `TEST-PKG-${Date.now()}`;
  const testPallet = `TEST-PAL-${Date.now()}`;
  const testLoc = `TEST-LOC-${Date.now()}`;
  let loadingId: string;

  beforeAll(async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'logwin' });
    
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  it('should create a new package', async () => {
    const res = await request(app)
      .post('/api/packages')
      .set('Authorization', `Bearer ${token}`)
      .send({ trackingNumber: testPkg });
    
    expect(res.status).toBe(201);
    expect(res.body.trackingNumber).toBe(testPkg);
  });

  it('should create a new pallet and add the package', async () => {
    // 1. Create pallet
    const createPalletRes = await request(app)
      .post('/api/pallets')
      .set('Authorization', `Bearer ${token}`)
      .send({ palletNumber: testPallet });
    
    expect(createPalletRes.status).toBe(201);
    const palletId = createPalletRes.body.id;

    // 2. Add package to pallet
    const res = await request(app)
      .post('/api/pallets/add-package')
      .set('Authorization', `Bearer ${token}`)
      .send({ palletId, trackingNumber: testPkg });
    
    expect(res.status).toBe(200);
    expect(res.body.palletId).toBe(palletId);
  });

  it('should create a location and assign the pallet', async () => {
    // Create location
    await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: testLoc });

    const res = await request(app)
      .post('/api/pallets/move') // Reverted to correct /move
      .set('Authorization', `Bearer ${token}`)
      .send({ palletNumber: testPallet, locationName: testLoc });
    
    expect(res.status).toBe(200);
  });

  it('should create a loading and add the pallet', async () => {
    const loadingRes = await request(app)
      .post('/api/loadings')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        driverName: 'TEST DRIVER',
        vehicleRegistration: 'TEST REG',
        expectedPallets: [testPallet]
      });
    
    expect(loadingRes.status).toBe(201);
    loadingId = loadingRes.body.id;

    const res = await request(app)
      .post('/api/loadings/add-pallet')
      .set('Authorization', `Bearer ${token}`)
      .send({ loadingId, palletNumber: testPallet });
    
    expect(res.status).toBe(200);
  });

  it('should close the loading', async () => {
    const res = await request(app)
      .post(`/api/loadings/${loadingId}/close`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CLOSED'); // Now returning object
  });
});

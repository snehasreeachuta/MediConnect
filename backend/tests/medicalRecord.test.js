const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const request = require('supertest');
const app = require('../app');

describe('Medical Records & AI Summarization Test Suite', () => {
  let patientToken = '';
  let uploadedRecordId = null;

  it('Authenticate patient for record tests', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'patient@mediconnect.local',
        password: 'Patient@123456'
      });
    assert.equal(res.status, 200);
    patientToken = res.body.token;
  });

  it('POST /api/medical-records/upload should upload a valid PDF and generate summary', async () => {
    const samplePdfPath = path.join(__dirname, 'fixtures/sample_report.pdf');

    const res = await request(app)
      .post('/api/medical-records/upload')
      .set('Authorization', `Bearer ${patientToken}`)
      .attach('file', samplePdfPath);

    assert.equal(res.status, 201);
    assert.ok(res.body.record.id);
    assert.equal(res.body.record.processing_status, 'summary_ready');
    uploadedRecordId = res.body.record.id;
  });

  it('GET /api/medical-records/my should list patient records', async () => {
    const res = await request(app)
      .get('/api/medical-records/my')
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.records));
    assert.ok(res.body.records.some(r => r.id === uploadedRecordId));
  });

  it('GET /api/medical-records/:id/download should securely stream file to patient', async () => {
    const res = await request(app)
      .get(`/api/medical-records/${uploadedRecordId}/download`)
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'application/pdf');
  });

  it('GET /api/medical-records/:id/download should reject unauthorized user', async () => {
    const res = await request(app)
      .get(`/api/medical-records/${uploadedRecordId}/download`);

    assert.equal(res.status, 401);
  });
});

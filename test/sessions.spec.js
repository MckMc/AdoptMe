import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Sessions', () => {
  it('register -> 201', async () => {
    const email = `test${Date.now()}@mail.com`;
    const res = await request(app)
      .post('/api/sessions/register')
      .send({ first_name:'T', last_name:'E', email, age:20, password:'123456' });
    expect([200,201]).to.include(res.status);
  });

  it('login -> set cookie jwt', async () => {
    const res = await request(app)
      .post('/api/sessions/login')
      .send({ email:'user@test.com', password:'123456' });
    expect(res.status).to.equal(200);
    expect(res.headers['set-cookie']?.join('')).to.contain('jwt=');
  });
});

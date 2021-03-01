import request from 'supertest';
import { app } from '../../app';

describe('Signin tests', () => {
  it('should returns a successful signin', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(200);
  });

  it('should returns a 400 with an invalid email', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@testcom',
        password: 'password',
      })
      .expect(400);
  });

  it('should returns a 400 with an empty password', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: '',
      })
      .expect(400);
  });

  it('should fails when a email that does not exist is suplied', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(400);
  });

  it('should fails when an incorect password is suplied', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'abcdefg',
      })
      .expect(400);
  });

  it('sets a cookie after successfull signin', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    const response = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});

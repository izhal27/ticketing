import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'new ticket',
      price: 27,
    })
    .expect(201);
};

it('should can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const res = await request(app).get('/api/tickets').send().expect(200);

  expect(res.body.length).toEqual(3);
});

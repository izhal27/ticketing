import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../app';

it('should returns a 404 if the ticket is not found', async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('should returns the ticket if the ticket is found', async () => {
  const ticket = {
    title: 'new ticket',
    price: 27,
  };

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ ...ticket })
    .expect(201);

  const ticketRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  const { title, price } = ticketRes.body;

  expect(title).toEqual(ticket.title);
  expect(price).toEqual(ticket.price);
});

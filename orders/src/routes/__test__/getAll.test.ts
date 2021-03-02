import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models';

const createTicket = async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'New Ticket',
    price: 27_000,
  });
  await ticket.save();
  return ticket;
};

it('should returns fetches orders for a particular user', async () => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  const res = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .send()
    .expect(200);

  expect(res.body.length).toEqual(2);
  expect(res.body[1].id).toEqual(orderOne.id);
  expect(res.body[0].id).toEqual(orderTwo.id);
  expect(res.body[1].ticket.id).toEqual(orderOne.ticket.id);
  expect(res.body[0].ticket.id).toEqual(orderTwo.ticket.id);
});

import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, Ticket, OrderStatus } from '../../models';
import { natsWraper } from '../../nats-wrapper';

it('should returns an error if the ticket does not exist', async () => {
  const ticketId = Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('should returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'New ticket',
    price: 27_000,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'abcderat',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'New ticket',
    price: 27_000,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('should emits an order create event', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'New ticket',
    price: 27_000,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWraper.client.publish).toHaveBeenCalled();
});

import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../app';
import { Ticket, Order, OrderStatus } from '../../models';
import { natsWraper } from '../../nats-wrapper';

it('should marks an order as cancelled', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'New ticket',
    price: 27_000,
  });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});

it('should emits a order cancelled event', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'New ticket',
    price: 27_000,
  });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWraper.client.publish).toHaveBeenCalled();
});

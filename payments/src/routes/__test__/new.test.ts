import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../app';
import { Order, Payment } from '../../models';
import { OrderStatus } from '@iztickets/common/build';
import { stripe } from '../../stripe';

it('should returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: 'asdfasdf', orderId: Types.ObjectId().toHexString() })
    .expect(404);
});

it('should returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    version: 0,
    price: 27_000,
    userId: Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: 'asdfasdf', orderId: order.id })
    .expect(401);
});

it('should returns a 400 when purchasing a cancelled order', async () => {
  const userId = Types.ObjectId().toHexString();

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    version: 0,
    price: 27_000,
    userId,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ token: 'asdfasdf', orderId: order.id })
    .expect(400);
});

it('should returns a 201 with valid input', async () => {
  const userId = Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    version: 0,
    price,
    userId,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(
    charge => charge.amount === price * 100
  );

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});

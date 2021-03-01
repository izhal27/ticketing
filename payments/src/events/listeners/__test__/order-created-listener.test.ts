import { Types } from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@iztickets/common';
import { natsWraper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWraper.client);

  const data: OrderCreatedEvent['data'] = {
    id: Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'adfasdf',
    expiresAt: new Date().toISOString(),
    ticket: {
      id: Types.ObjectId().toHexString(),
      price: 27_000,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('should replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(data.id).toEqual(order!.id);
  expect(data.ticket.price).toEqual(order!.price);
});

it('should acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

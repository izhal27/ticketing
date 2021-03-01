import { Types } from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@iztickets/common';
import { natsWraper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWraper.client);

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    version: 0,
    price: 27_000,
    status: OrderStatus.Created,
    userId: 'asdfasd',
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('should updates the status of the order', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(data.id).toEqual(order!.id);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('should acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

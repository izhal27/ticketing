import { Message } from 'node-nats-streaming';
import { Types } from 'mongoose';
import { OrderCancelledEvent } from '@iztickets/common';
import { Ticket } from '../../../models';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWraper } from '../../../nats-wrapper';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWraper.client);

  const orderId = Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'New ticket',
    price: 27_000,
    userId: 'asdfasd',
  });

  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, orderId, ticket, data, msg };
};

it('should updates the ticket, publishes an event, and acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket.orderId).not.toBeDefined();
  expect(natsWraper.client.publish).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalled();
});

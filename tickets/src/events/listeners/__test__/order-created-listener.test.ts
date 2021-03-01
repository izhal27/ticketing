import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@iztickets/common';
import { natsWraper } from '../../../nats-wrapper';
import { OrderCreateListener } from '../order-created-listeners';
import { Ticket } from '../../../models';

const setup = async () => {
  const listener = new OrderCreateListener(natsWraper.client);

  const ticket = Ticket.build({
    title: 'New ticket',
    price: 27_000,
    userId: 'asdfasdf',
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asdf',
    expiresAt: 'sadfasd',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('should sets the orderId of the ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket.orderId).toEqual(data.id);
});

it('should acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('should publishes a ticket update event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWraper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWraper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});

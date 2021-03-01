import { Message } from 'node-nats-streaming';
import { Types } from 'mongoose';
import { TicketCreatedEvent } from '@iztickets/common/build';

import { natsWraper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Ticket } from '../../../models';

const setup = async () => {
  const listener = new TicketCreatedListener(natsWraper.client);

  const data: TicketCreatedEvent['data'] = {
    id: new Types.ObjectId().toHexString(),
    title: 'New ticket',
    version: 0,
    price: 27_000,
    userId: new Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('should creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket.title).toEqual(data.title);
  expect(ticket.price).toEqual(data.price.toString());
});

it('should acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

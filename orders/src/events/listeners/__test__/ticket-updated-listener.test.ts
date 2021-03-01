import { Message } from 'node-nats-streaming';
import { Types } from 'mongoose';
import { TicketUpdatedEvent } from '@iztickets/common/build';

import { natsWraper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWraper.client);

  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 1,
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'New concert',
    version: ticket.version + 1,
    price: 27_000,
    userId: new Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('should creates, updates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket.title).toEqual(data.title);
  expect(updatedTicket.price).toEqual(data.price.toString());
});

it('should acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('should does not call ack if the event has a skipped version number', async () => {
  const { listener, data, msg } = await setup();
  data.version = 27;

  await listener.onMessage(data, msg);

  expect(msg.ack).not.toHaveBeenCalled();
});

import { Message } from 'node-nats-streaming';
import { Listener, Subjects, OrderCreatedEvent } from '@iztickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models';
import { TicketUpdatedPublisher } from '../publishers';

export class OrderCreateListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id } = data;
    const { id: ticketId } = data.ticket;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      // throw new Error('Ticket not found');
      return;
    }

    ticket.set({ orderId: id });
    await ticket.save();

    await new TicketUpdatedPublisher(this.stan).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}

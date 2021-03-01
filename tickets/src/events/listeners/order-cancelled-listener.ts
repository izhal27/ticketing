import { Message } from 'node-nats-streaming';
import { Listener, Subjects, OrderCancelledEvent } from '@iztickets/common';
import { Ticket } from '../../models';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { id } = data.ticket;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      // throw new Error('Ticket not found');
      return;
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    new TicketUpdatedPublisher(this.stan).publish({
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

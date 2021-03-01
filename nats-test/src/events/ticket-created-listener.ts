import { Message } from 'node-nats-streaming';
import { Listener, Subjects, TicketCreatedEvent } from '@iztickets/common';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data!', data);

    msg.ack();
  }
}

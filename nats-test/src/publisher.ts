import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedPublisher } from './events';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher conected to NATS');

  try {
    const publisher = new TicketCreatedPublisher(stan);

    await publisher.publish({
      id: '123',
      title: 'My Ticket',
      price: 27_000,
      userId: Math.random().toString()
    });
  } catch (err) {
    console.error(err);
  }
});

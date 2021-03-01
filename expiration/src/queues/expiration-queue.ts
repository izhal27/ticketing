import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWraper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: process.env.REDIS_HOST,
});

expirationQueue.process(async job => {
  new ExpirationCompletePublisher(natsWraper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };

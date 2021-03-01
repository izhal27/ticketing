import { Router, Request, Response } from 'express';
import {
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@iztickets/common';

import { Order } from '../models';
import { OrderCancelledPublisher } from '../events';
import { natsWraper } from '../nats-wrapper';

const router = Router();

router.delete('/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('ticket');

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();

  new OrderCancelledPublisher(natsWraper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    },
  });

  res.status(204).send(order);
});

export { router as deleteOrderRouter };

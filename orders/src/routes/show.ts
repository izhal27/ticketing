import { Router, Request, Response } from 'express';
import { NotFoundError, NotAuthorizedError } from '@iztickets/common';
import { Order } from '../models';

const router = Router();

router.get('/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('ticket');

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  res.send(order);
});

export { router as showOrderRouter };

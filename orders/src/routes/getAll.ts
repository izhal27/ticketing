import { Router, Request, Response } from 'express';
import { Order } from '../models';

const router = Router();

router.get('/orders', async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id })
    .sort({
      createdAt: -1,
    })
    .populate('ticket');

  res.send(orders);
});

export { router as getAllRouter };

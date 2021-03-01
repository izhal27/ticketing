import { Router, Request, Response } from 'express';
import { Ticket } from '../models';

const router = Router();

router.get('/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ orderId: undefined }).sort({
    createdAt: -1,
  });

  res.send(tickets);
});

export { router as getAllRouter };

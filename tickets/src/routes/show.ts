import { Router, Request, Response } from 'express';
import { NotFoundError } from '@iztickets/common/build';
import { Ticket } from '../models';

const router = Router();

router.get('/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  NotFoundError,
  requireAuth,
  validateRequest,
  NotAuthorizedError,
  BadRequestError,
} from '@iztickets/common/build';

import { Ticket } from '../models';
import { TicketUpdatedPublisher } from '../events/publishers';
import { natsWraper } from '../nats-wrapper';

const router = Router();

router.put(
  '/tickets/:id',
  requireAuth,
  [
    body('title').trim().not().isEmpty().withMessage('Title is required'),
    body('price')
      .trim()
      .isNumeric()
      .isInt({ gt: 0 })
      .withMessage('Price must be greather than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title,
      price,
    });
    await ticket.save();
    new TicketUpdatedPublisher(natsWraper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as updateTicketRouter };

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@iztickets/common';
import { TicketCreatedPublisher } from '../events/publishers';

import { Ticket } from '../models';
import { natsWraper } from '../nats-wrapper';

const router = Router();

router.post(
  '/tickets',
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

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    new TicketCreatedPublisher(natsWraper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };

import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { body } from 'express-validator';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  validateRequest,
} from '@iztickets/common/build';

import { Order, Ticket, TicketDoc } from '../models';
import { OrderCreatedPublisher } from '../events';
import { natsWraper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SETTINGS = 1 * 60;

const router = Router();

router.post(
  '/orders',
  [
    body('ticketId')
      .notEmpty()
      .custom((input: string) => Types.ObjectId.isValid(input))
      .withMessage('Ticket id must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SETTINGS);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    new OrderCreatedPublisher(natsWraper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };

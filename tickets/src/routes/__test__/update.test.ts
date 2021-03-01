import request from 'supertest';
import { app } from '../../app';
import { Types } from 'mongoose';
import { natsWraper } from '../../nats-wrapper';
import { Ticket } from '../../models';

it('should returns a 404 if the provided is does not exist', async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'qwerty',
      price: 11,
    })
    .expect(404);
});

it('should returns a 401 if the user is not authenticated', async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'qwerty',
      price: 11,
    })
    .expect(401);
});

it('should returns a 401 if the user does not own the ticket', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({
      title: 'qwerty',
      price: 11,
    });

  const newTicket = {
    title: 'new ticket',
    price: 27,
  };
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({
      ...newTicket,
    })
    .expect(401);
});

it('should returns a 400 if the user provided an invalid title or price', async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'qwerty',
      price: 11,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({})
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 27,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: -27,
    })
    .expect(400);
});

it('should updates the ticket provided valid inputs', async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'qwerty',
      price: 11,
    });

  const newTicket = {
    title: 'new ticket',
    price: 27,
  };
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      ...newTicket,
    })
    .expect(201);

  const ticketRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send();

  const { title, price } = ticketRes.body;

  expect(title).toEqual(newTicket.title);
  expect(price).toEqual(newTicket.price);
});

it('should publishes an event', async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'qwerty',
      price: 11,
    });

  const newTicket = {
    title: 'new ticket',
    price: 27,
  };
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      ...newTicket,
    })
    .expect(201);

  expect(natsWraper.client.publish).toHaveBeenCalled();
});

it('should rejects updates if tikcet is reserved', async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'qwerty',
      price: 11,
    });

  const ticket = await Ticket.findById(res.body.id);
  ticket.set({ orderId: Types.ObjectId().toHexString() });
  await ticket.save();

  const newTicket = {
    title: 'new ticket',
    price: 27,
  };
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      ...newTicket,
    })
    .expect(400);
});

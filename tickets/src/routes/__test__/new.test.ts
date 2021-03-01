import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models';
import { natsWraper } from '../../nats-wrapper';

it('should has a route handler listening to /api/tickets for posts requests', async () => {
  const res = await request(app).post('/api/tickets').send({});

  expect(res.status).not.toEqual(404);
});

it('should can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('should returns a status other than 401 if user is signed in', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  expect(res.status).not.toEqual(401);
});

it('should returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 27,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 27,
    })
    .expect(400);
});

it('should returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'abcdef',
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'abcdef',
      price: 0,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'abcdef',
      price: -27,
    })
    .expect(400);
});

it('should creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);

  const ticket = {
    title: 'abcdef',
    price: 27,
  };

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      ...ticket,
    })
    .expect(201);

  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(ticket.title);
  expect(tickets[0].price).toEqual(ticket.price);
});

it('should publishes an event', async () => {
  const ticket = {
    title: 'abcdef',
    price: 27,
  };

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      ...ticket,
    })
    .expect(201);

  expect(natsWraper.client.publish).toHaveBeenCalled();
});

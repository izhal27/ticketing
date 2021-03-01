import { Ticket } from '../ticket';

it('should implements optimistic concurrency control', async done => {
  const ticket = Ticket.build({
    title: 'New ticket',
    price: 27_000,
    userId: '123456',
  });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  secondInstance.set({
    price: 20_000,
  });

  secondInstance.set({
    price: 10_000,
  });

  try {
    await firstInstance.save();
    await secondInstance.save();
  } catch (err) {
    return done();
  }

  throw new Error('Should not reach this point');
});

it('should increments the verison number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'New ticket',
    price: 27_000,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});

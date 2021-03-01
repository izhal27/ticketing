import Link from 'next/link';
import convertPrice from '../lib/convert-price';

const Home = ({ currentUser, tickets }) => {
  const ticketsList = tickets.map((ticket, index) => {
    return (
      <tr key={ticket.id}>
        <td>{++index}</td>
        <td>{ticket.title}</td>
        <td>
          {convertPrice(ticket.price)}
        </td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketsList}</tbody>
      </table>
    </div>
  );
};

Home.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default Home;

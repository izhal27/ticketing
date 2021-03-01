import convertPrice from '../../lib/convert-price';

const Orders = ({ orders }) => {
  const ordersList = orders.map((order, index) => {
    const { ticket } = order;
    const classStatus =
      order.status === 'complete' ? 'text-success' : 'text-danger';
    const expire = new Date(order.expiresAt).toLocaleString();

    return (
      <tr key={order.id}>
        <td>{++index}</td>
        <td>{ticket.title}</td>
        <td>{convertPrice(ticket.price)}</td>
        <td className={classStatus}>{order.status}</td>
        <td>{expire}</td>
      </tr>
    );
  });

  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Price</th>
          <th>Status</th>
          <th>Expires At</th>
        </tr>
      </thead>
      <tbody>{ordersList}</tbody>
    </table>
  );
};

Orders.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default Orders;

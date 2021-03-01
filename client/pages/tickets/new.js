import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [doRequest, errors] = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: () => Router.push('/'),
  });

  const onBlurHandler = () => {
    const value = parseInt(price);

    if (isNaN(value)) {
      setPrice(0);
      return;
    }

    setPrice(value);
  };

  const onSubmitHandler = event => {
    event.preventDefault();
    doRequest();
  };

  const onFocusHandler = event => {
    const { value } = event.target;

    if (value > 0) {
      return;
    }

    setPrice('');
  };

  return (
    <div className="row">
      <div className="col-lg-6">
        <h1>Create a Ticket</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title
            </label>
            <input
              value={title}
              onChange={e => {
                setTitle(e.target.value);
              }}
              className="form-control"
              type="text"
              name="title"
              id="title"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="price">
              Price
            </label>
            <input
              value={price}
              onBlur={onBlurHandler}
              onChange={e => {
                setPrice(e.target.value);
              }}
              onFocus={onFocusHandler}
              className="form-control"
              type="number"
              name="price"
              id="price"
            />
          </div>
          {errors}
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;

import { useState, useEffect } from 'react';
import Router from 'next/router';
import Link from 'next/link';

import useRequest from '../../hooks/use-request';

export default function Signup({ currentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doRequest, errors] = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  });

  useEffect(() => {
    if (currentUser) {
      Router.push('/');
    }
  }, []);

  const onSubmitHandler = event => {
    event.preventDefault();
    doRequest();
  };

  return (
    <>
      <form onSubmit={onSubmitHandler}>
        <h1>Sign Up</h1>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-control"
            type="email"
            name="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="form-control"
            type="password"
            name="password"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Sign Up</button>
      </form>
      <p className="mt-3">
        Already have an account?{' '}
        <Link href="/auth/signin">
          <a>Sign In</a>
        </Link>
      </p>
    </>
  );
}

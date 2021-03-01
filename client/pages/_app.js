import 'bootstrap/dist/css/bootstrap.css';

import buildClient from '../api/build-client';
import Header from '../components/header';
import Layout from '../components/layout';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  const newProps = { ...pageProps, currentUser };

  return (
    <>
      <Header currentUser={currentUser} />
      <Layout currentUser={currentUser}>
        <Component {...newProps} />
      </Layout>
    </>
  );
};

AppComponent.getInitialProps = async appContext => {
  const { req, res } = appContext.ctx;
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  if (req) {
    const { route } = appContext.router;

    if (data?.currentUser) {
      if (route === '/auth/signin' || route === '/auth/signup') {
        res.writeHead(302, {
          Location: '/',
        });

        res.end();
      }
    } else {
      if (route === '/tickets/new' || route === '/orders') {
        res.writeHead(302, {
          Location: '/auth/signin',
        });

        res.end();
      }
    }
  }

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return { pageProps, ...data };
};

export default AppComponent;

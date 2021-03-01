import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Ticketing</title>
      </Head>
      <div className="container mt-3">
        {children}
      </div>
    </>
  );
}

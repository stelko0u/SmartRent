import Head from 'next/head';

const MyHead = () => {
  return (
    <Head>
      <title>Smart Rent</title>
      <meta
        name="description"
        content="Manage your car rentals easily with Smart Rent."
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default MyHead;

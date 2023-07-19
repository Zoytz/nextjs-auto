import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import type { InferGetStaticPropsType } from 'next';
import { Cascader, Table } from 'antd';
import styles from '../styles/App.module.css';
import Menu from '../components/Menu/Menu';

export type DefaultCarType = {
  markOfCar: string
  markCount: number
}

export async function getStaticProps() {

  try {
    const client = await clientPromise;
    const db = client.db('hrTest');

    const cars = await db
           .collection('stock')
           .find({})
           .toArray();

    const marksOfCars = await db
      .collection('stock')
      .distinct('mark')

    const defaultCars: DefaultCarType[] = [];

    marksOfCars.forEach((markOfCar) => {
      const markCount = cars.filter(car => car.mark === markOfCar).length;
      defaultCars.push({markOfCar, markCount});
    });
      
    return {
      props: {
        defaultCars: JSON.parse(JSON.stringify(defaultCars)),
      },
    };
  } catch (e) {
    console.error(e);
  }
}

export default function App({
  defaultCars
}: InferGetStaticPropsType<typeof getStaticProps>) {

  return (
    <div className='page'>
      <Head>
        <title>Nextjs-auto</title>
        <meta
          name='description'
          content='Тестовое задание'
        />
      </Head>
      <main className={styles.main}>
        <Menu cars={defaultCars} />
        <p className={styles.main__hint}>Модель:</p>
        <Cascader
          style={{
            width: '100%',
          }}
          multiple
          maxTagCount='responsive'
          disabled
        />
        <Table
          columns={[]}
          dataSource={[]}
          pagination={{
            pageSize: 20,
          }}
        />
      </main>
    </div>
  )
}

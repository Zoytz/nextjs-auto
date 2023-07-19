import Head from 'next/head';
import clientPromise from '../../lib/mongodb';
import type { InferGetStaticPropsType } from 'next';
import { Cascader, Table } from 'antd';
import styles from '../../styles/App.module.css';
import Menu from '../../components/Menu/Menu';
import { useEffect, useState } from 'react';
import columns from '../../utils/utils';

export type MenuCarType = {
  markOfCar: string
  markCount: number
}

type DefaultCarType = {
  _id: string
  mark: string
  model: string
  engine: {
  power: number
  volume: number
  transmission: string
  fuel: string
  },
  drive: string
  equipmentName: string
  price: number
  createdAt: Date,
}

type PageCarType = {
  _id: string
  mark: string
  model: string
  engine: {
    power: number
    volume: number
    transmission: string
    fuel: string
  },
  drive: string
  equipmentName: string
  price: string
  createdAt: string
  key: string
  fullName: string
}

const { SHOW_CHILD } = Cascader;

export async function getServerSideProps(context: {params: Record<string, string>}) {
  const { params } = context;
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

    const menuCars: MenuCarType[] = [];

    marksOfCars.forEach((markOfCar) => {
      const markCount = cars.filter(car => car.mark === markOfCar).length;
      menuCars.push({ markOfCar, markCount });
    });

    const foundCars = await db
      .collection('stock')
      .find({ mark: params.carMark })
      .toArray();

    const pageCarsModels: string[] = [];
    foundCars.forEach((foundCar) => {
      if (foundCar.model) {
        pageCarsModels.push(foundCar.model)
      }
    });

    const pageCars = foundCars.map((car) => {

      const date = new Date(car.createdAt);
      const day = date.getDay();
      const month = date.getMonth();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      const formatedDate = `${day < 10 ? `0${day}` : `${day}`}.${month < 10 ? `0${month}` : `${month}`}.${date.getFullYear()} ${hours < 10 ? `0${hours}` : `${hours}`}:${minutes < 10 ? `0${minutes}` : `${minutes}`}`;


      return {
        ...car,
        modification: `${!car.engine.volume ? 'Не указано' : car.engine.volume % 1 === 0 ? car.engine.volume + '.0' : car.engine.volume} ${car.engine.transmission} (${car.engine.power} л.с.) ${car.drive ? car.drive : ''}`,
        equipmentName: car.equipmentName !== 'ПустаяКомплектация' ? car.equipmentName : '-',
        price: `${car.price.toLocaleString()} ₽`,
        createdAt: formatedDate,
        key: car._id,
        fullName: `${car.mark} ${car.model ? car.model : ''}`,
      }
    });

    return {
      props: {
        menuCars: JSON.parse(JSON.stringify(menuCars)),
        pageCars: JSON.parse(JSON.stringify(pageCars)),
        marksOfCars: JSON.parse(JSON.stringify(marksOfCars)),
        pageCarsModels: JSON.parse(JSON.stringify(pageCarsModels)),
      },
    };
  } catch (e) {
    console.error(e);
  }
}

export default function CarMarkPage({
  menuCars, pageCars, pageCarsModels
}: InferGetStaticPropsType<typeof getServerSideProps>) {

  const pageCarsModelsSet = Array.from(new Set(pageCarsModels));
  const options = pageCarsModelsSet.map((pageCarsModel) => {
    return {
      label: `${pageCarsModel}`,
      value: `${pageCarsModel}`,
    }
  });

  const [filters, setFilters] = useState<string[]>([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [cascaderKey, setCascaderKey] = useState(0);

  useEffect(() => {
    const filteredCarsArr = pageCars.filter((pageCar: PageCarType) => {
      if (pageCar.model && filters.includes(pageCar.model)) {
        return pageCar;
      }
    });
    setFilteredCars(filteredCarsArr);

  }, [filters]);

  useEffect(() => {
    if (!pageCarsModels || pageCarsModelsSet.length <= 1) {
      setFilteredCars(pageCars);
    };
  }, [pageCars]);

  const handleChooseFilter = (array: any) => {
    const filtersFlatArr = array.flat(1);
    setFilters(filtersFlatArr);
  };

  const handleMenuItemClick = () => {
    setCascaderKey(prev => prev + 1);
    setFilters([]);
  };

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
        <Menu
          cars={menuCars}
          handleMenuItemClick={handleMenuItemClick}
        />
        <p className={styles.main__hint}>Модель:</p>
        <Cascader
          key={cascaderKey}
          style={{
            width: '100%',
          }}
          options={options}
          onChange={handleChooseFilter}
          multiple
          maxTagCount='responsive'
          showCheckedStrategy={SHOW_CHILD}
          disabled={pageCarsModelsSet.length <= 1}
        />
        <Table
          columns={columns}
          dataSource={filteredCars}
          pagination={{
            pageSize: 20,
          }}
        />
      </main>
    </div>
  )
}
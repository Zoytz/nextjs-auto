import Link from 'next/link';
import styles from '../Menu/Menu.module.css';
import { DefaultCarType } from '../../pages';
import { useRouter } from 'next/router';

type PropsType = {
  cars: DefaultCarType[]
  handleMenuItemClick?: () => void
}

export default function Menu(props: PropsType) {

  const route = useRouter();

  return (
    <ul className={styles.menu}>
      {
        props.cars.map((car: DefaultCarType) => {
          return (
            <li
              onClick={props.handleMenuItemClick}
              key={car.markOfCar}
              className={styles.menu__item}>
              <Link
                onClick={props.handleMenuItemClick}
                href={`/${car.markOfCar}`}
                className={route.query.carMark === car.markOfCar ? styles.menu__link_type_active : styles.menu__link}>
                {car.markOfCar}
              </Link>
              <p className={styles.menu__counter}>
                {car.markCount}
              </p>
            </li>
          )
        })
      }
    </ul>
  )
}
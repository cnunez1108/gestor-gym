import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import {pageUser} from '@/lib/server/security';
import {repository} from '@/lib/server/repositories';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Check, CreditCard, Dumbbell } from 'lucide-react';
import styles from './plans.module.css';

export default async function Page() {
  const user = await pageUser();
  const plans = repository.plans();

  return (
    <DashboardLayout user={user}>
      <section className={styles.page} aria-labelledby="plans-title">
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>STRONGHUB GYM</span>
            <h1 id="plans-title">Planes de membresía</h1>
            <p>Una meta, distintas formas de empezar. Elige la duración para cada miembro.</p>
          </div>
          <span className={styles.currency}><CreditCard size={16} aria-hidden="true" /> Precios en US$ · USD</span>
        </header>

        <div className={styles.grid}>
          {plans.map(plan => (
            <article className={styles.card} key={plan.id}>
              <div className={styles.cardTop}>
                <span className={styles.icon}><Dumbbell size={23} aria-hidden="true" /></span>
                <span className={styles.duration}>{plan.days} días</span>
              </div>
              <h2>{plan.name}</h2>
              <p className={styles.description}>Tu próximo paso comienza aquí.</p>
              <div className={styles.price}>
                <span>US$</span>
                <strong>{(plan.price_cents / 100).toFixed(2)}</strong>
              </div>
              <p className={styles.payment}>Pago único por {plan.days} días de vigencia</p>
              <ul className={styles.features}>
                <li><CalendarDays size={17} aria-hidden="true" /> Vigencia desde la fecha de inicio</li>
                <li><Check size={17} aria-hidden="true" /> Un solo pago, sin cuotas</li>
                <li><Check size={17} aria-hidden="true" /> Registro de pago y vencimiento</li>
              </ul>
            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <div>
            <h2>¿Listo para registrar una membresía?</h2>
            <p>Selecciona el miembro y su plan en el formulario de registro.</p>
          </div>
          <Link href="/membresias" className={styles.action}>Registrar membresía <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </DashboardLayout>
  );
}

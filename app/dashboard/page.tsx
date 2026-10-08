import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import {pageUser} from '@/lib/server/security';
import {dashboard} from '@/lib/server/services';
export default async function Page(){const user=await pageUser();const stats=dashboard();return <DashboardLayout user={user}><div className="dashboard-header"><div><h1>¡Bienvenido, {user.name}!</h1><p>Resumen de StrongHub Gym · US$ (USD)</p></div></div><div className="stats-grid">{[['Miembros',stats.members],['Membresías',stats.memberships],['Membresías activas',stats.active],['Ingresos registrados', 'US$ '+(stats.incomeCents/100).toFixed(2)]].map(([label,value])=><div className="stat-card" key={label}><div className="stat-content"><span>{label}</span><strong>{value}</strong></div></div>)}</div></DashboardLayout>;}

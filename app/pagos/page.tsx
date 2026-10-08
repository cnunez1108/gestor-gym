import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import Payments from '@/app/components/Payments';
import { pageUser } from '@/lib/server/security';
export default async function Page(){const user=await pageUser(false);return <DashboardLayout user={user}><Payments/></DashboardLayout>;}

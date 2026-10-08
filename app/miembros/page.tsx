import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import Records from '@/app/components/Records';
import { pageUser } from '@/lib/server/security';
export default async function Page(){const user=await pageUser(false);return <DashboardLayout user={user}><Records kind="members"/></DashboardLayout>;}

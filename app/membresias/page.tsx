import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import MembershipForm from '@/app/components/MembershipForm';
import { pageUser } from '@/lib/server/security';
export default async function Page(){const user=await pageUser();return <DashboardLayout user={user}><MembershipForm/></DashboardLayout>;}

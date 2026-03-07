import { redirect } from 'next/navigation';
import { getMe } from '@/lib/api/apiAuth';
import CreateUserForm from './createuserform';

export default async function CreateUserPage() {
  const me = await getMe();

  if (me?.user?.role !== 'admin') {
    redirect('/admin/users'); // hoặc 403 page
  }

  return <CreateUserForm />;
}

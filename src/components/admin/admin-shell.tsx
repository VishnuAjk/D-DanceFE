import { AppShell } from '@/components/app-shell/app-shell';
import { adminNavigation } from '@/components/app-shell/navigation';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <AppShell navigation={adminNavigation} roles={['super_admin', 'branch_admin']}>{children}</AppShell>;
}

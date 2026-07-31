import { AppShell } from '@/components/app-shell/app-shell';
import { portalNavigation } from '@/components/app-shell/navigation';

export function PortalShell({ children }: { children: React.ReactNode }) {
  return <AppShell navigation={portalNavigation} roles={['customer', 'parent']}>{children}</AppShell>;
}

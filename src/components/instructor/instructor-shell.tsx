import { AppShell } from '@/components/app-shell/app-shell';
import { instructorNavigation } from '@/components/app-shell/navigation';

export function InstructorShell({ children }: { children: React.ReactNode }) {
  return <AppShell navigation={instructorNavigation} roles={['instructor', 'super_admin']}>{children}</AppShell>;
}

import { PortalShell } from '@/components/portal/portal-shell';

export default function CustomerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PortalShell>{children}</PortalShell>;
}

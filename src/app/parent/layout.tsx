import { ParentShell } from '@/components/parent/parent-shell';

export default function ParentLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ParentShell>{children}</ParentShell>;
}

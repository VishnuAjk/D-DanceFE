import { InstructorShell } from '@/components/instructor/instructor-shell';

export default function InstructorLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <InstructorShell>{children}</InstructorShell>;
}

import type { ReactNode } from 'react';

export type NavigationIcon = 'home' | 'studio' | 'people' | 'wallet' | 'play' | 'chart' | 'more';

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
  exact?: boolean;
};

export type AppNavigation = {
  sectionLabel: string;
  title: string;
  primary: NavigationItem[];
  secondary: NavigationItem[];
};

export const adminNavigation: AppNavigation = {
  sectionLabel: 'Admin',
  title: 'Studio control room',
  primary: [
    { href: '/admin', label: 'Dashboard', icon: 'home', exact: true },
    { href: '/admin/batches', label: 'Batches', icon: 'studio' },
    { href: '/admin/enrollments', label: 'Enrollments', icon: 'people' },
    { href: '/admin/fees', label: 'Fees', icon: 'wallet' }
  ],
  secondary: [
    { href: '/admin/branches', label: 'Branches', icon: 'studio' },
    { href: '/admin/courses', label: 'Courses', icon: 'play' },
    { href: '/admin/videos', label: 'Videos', icon: 'play' },
    { href: '/admin/reports', label: 'Reports', icon: 'chart' }
  ]
};

export const portalNavigation: AppNavigation = {
  sectionLabel: 'Portal',
  title: 'Student hub',
  primary: [
    { href: '/portal/dashboard', label: 'Home', icon: 'home' },
    { href: '/portal/student-profiles', label: 'Students', icon: 'people' },
    { href: '/portal/enrollments', label: 'Enrollments', icon: 'studio' },
    { href: '/portal/fees', label: 'Fees', icon: 'wallet' }
  ],
  secondary: [
    { href: '/portal/attendance', label: 'Attendance', icon: 'chart' },
    { href: '/portal/assessments', label: 'Assessments', icon: 'chart' },
    { href: '/portal/videos', label: 'Videos', icon: 'play' }
  ]
};

export const instructorNavigation: AppNavigation = {
  sectionLabel: 'Instructor',
  title: 'Teaching workspace',
  primary: [
    { href: '/instructor/dashboard', label: 'Home', icon: 'home' },
    { href: '/instructor/batches', label: 'Batches', icon: 'people' }
  ],
  secondary: []
};

export function isNavigationActive(pathname: string, item: NavigationItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function NavigationGlyph({ name }: { name: NavigationIcon }): ReactNode {
  const paths: Record<NavigationIcon, ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10M9.5 20v-6h5v6" /></>,
    studio: <><path d="M4 20V7l8-3 8 3v13" /><path d="M8 10h8M8 14h8M8 18h8" /></>,
    people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.8-.8 6 1 6.5 5" /></>,
    wallet: <><path d="M3 6.5h16a2 2 0 0 1 2 2V19H5a2 2 0 0 1-2-2V6.5Z" /><path d="M5 6.5 16 3v3.5M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z" /></>,
    play: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3Z" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>
  };

  return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

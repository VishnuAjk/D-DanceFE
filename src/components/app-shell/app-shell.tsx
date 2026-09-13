'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { ProtectedShell } from '@/components/protected-shell';
import { useAuth } from '@/providers/auth-provider';
import { type AppNavigation, isNavigationActive, NavigationGlyph } from './navigation';

type AppShellProps = {
  children: React.ReactNode;
  navigation: AppNavigation;
  roles: string[];
};

function NavLink({ href, label, icon, active, onClick }: { href: string; label: string; icon: Parameters<typeof NavigationGlyph>[0]['name']; active: boolean; onClick?: () => void }) {
  return (
    <Link href={href} className={`app-nav-link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={onClick}>
      <NavigationGlyph name={icon} />
      <span>{label}</span>
      {active ? <span className="app-nav-link__marker" aria-hidden="true" /> : null}
    </Link>
  );
}

export function AppShell({ children, navigation, roles }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const allItems = [...navigation.primary, ...navigation.secondary];
  const current = allItems.filter((item) => isNavigationActive(pathname, item)).sort((a, b) => b.href.length - a.href.length)[0];

  useEffect(() => {
    if (!moreOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const sheet = sheetRef.current;
    const focusable = () => Array.from(sheet?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMoreOpen(false);
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      moreButtonRef.current?.focus();
    };
  }, [moreOpen]);

  return (
    <ProtectedShell roles={roles}>
      <div className="app-shell">
        <header className="mobile-app-bar">
          <Link className="mobile-app-bar__brand" href={navigation.primary[0].href} aria-label={`${navigation.sectionLabel} home`}>D</Link>
          <div className="mobile-app-bar__copy">
            <span>{navigation.sectionLabel}</span>
            <strong>{current?.label ?? navigation.title}</strong>
          </div>
          <button ref={moreButtonRef} className="icon-button" type="button" aria-label="Open navigation and account menu" aria-expanded={moreOpen} aria-controls="app-more-sheet" onClick={() => setMoreOpen(true)}>
            <NavigationGlyph name="more" />
          </button>
        </header>

        <aside className="desktop-sidebar">
          <div className="desktop-sidebar__hero">
            <p className="dashboard__eyebrow">{navigation.sectionLabel}</p>
            <h1>{navigation.title}.</h1>
            <p>Signed in as <strong>{user?.name ?? navigation.sectionLabel}</strong>.</p>
          </div>
          <nav className="desktop-nav" aria-label={`${navigation.sectionLabel} navigation`}>
            {allItems.map((item) => <NavLink key={item.href} {...item} active={isNavigationActive(pathname, item)} />)}
          </nav>
          <button className="button button--ghost" onClick={() => void logout()} type="button">Logout</button>
        </aside>

        <div className="app-content">
          {user?.isDemo ? (
            <div className="demo-read-only-banner" role="status">
              <strong>Read-only demo</strong>
              <span>You can explore this role, but changes and payments are disabled.</span>
            </div>
          ) : null}
          {children}
        </div>

        <nav className="mobile-bottom-nav" aria-label={`${navigation.sectionLabel} primary navigation`}>
          {navigation.primary.map((item) => <NavLink key={item.href} {...item} active={isNavigationActive(pathname, item)} />)}
          <button className={`app-nav-link${moreOpen || navigation.secondary.some((item) => isNavigationActive(pathname, item)) ? ' is-active' : ''}`} type="button" aria-label="More destinations" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}>
            <NavigationGlyph name="more" /><span>More</span>{moreOpen || navigation.secondary.some((item) => isNavigationActive(pathname, item)) ? <span className="app-nav-link__marker" aria-hidden="true" /> : null}
          </button>
        </nav>

        {moreOpen ? (
          <div className="nav-sheet-layer">
            <button className="nav-sheet-backdrop" type="button" aria-label="Close menu" onClick={() => setMoreOpen(false)} />
            <div id="app-more-sheet" ref={sheetRef} className="nav-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <div className="nav-sheet__handle" aria-hidden="true" />
              <header className="nav-sheet__header"><div><p className="dashboard__eyebrow">{navigation.sectionLabel}</p><h2 id={titleId}>More and account</h2></div><button className="icon-button" type="button" aria-label="Close menu" onClick={() => setMoreOpen(false)}>×</button></header>
              <p className="nav-sheet__account">Signed in as <strong>{user?.name ?? 'Account'}</strong></p>
              {navigation.secondary.length ? <nav className="nav-sheet__links" aria-label="More destinations">{navigation.secondary.map((item) => <NavLink key={item.href} {...item} active={isNavigationActive(pathname, item)} onClick={() => setMoreOpen(false)} />)}</nav> : <p className="dashboard__text">Your main destinations are available in the navigation bar.</p>}
              <button className="button button--ghost nav-sheet__logout" type="button" onClick={() => void logout()}>Logout</button>
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedShell>
  );
}

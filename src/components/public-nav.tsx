'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About us' },
  { href: '/contact-us', label: 'Contact us' },
  { href: '/login', label: 'Sign in', cta: true }
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className="public-nav">
      <Link className="public-nav__brand" href="/">The Dance Studio</Link>
      <button className="public-nav__toggle icon-button" type="button" aria-label="Toggle main menu" aria-expanded={open} aria-controls="public-menu" onClick={() => setOpen((value) => !value)}>{open ? '×' : '☰'}</button>
      <div id="public-menu" ref={menuRef} className={`public-nav__links${open ? ' is-open' : ''}`}>
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className={`landing__nav-link${pathname === link.href ? ' is-active' : ''}${link.cta ? ' landing__nav-link--cta' : ''}`} onClick={() => setOpen(false)}>{link.label}</Link>)}
      </div>
    </header>
  );
}

import Link from 'next/link';
import { useRouter } from 'next/router';
import { Compass, User } from 'lucide-react';

const tabs = [
  {
    href:  '/discover',
    label: 'Discover',
    Icon:  Compass,
    match: (p) => p === '/discover' || p.startsWith('/e/') || p.startsWith('/ticket/'),
  },
  {
    href:  '/profile',
    label: 'Profile',
    Icon:  User,
    match: (p) => p === '/profile',
  },
];

export default function BottomNav() {
  const { pathname } = useRouter();

  return (
    <div className="bottom-nav pointer-events-none">
      <nav className="pointer-events-auto liquid-glass-nav" aria-label="Bottom Navigation">
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} href={href} className={'liquid-nav-item pressable' + (active ? ' active' : '')}>
              <div className={active ? 'liquid-nav-icon active' : 'liquid-nav-icon'}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden
                />
              </div>
              <span className={active ? 'liquid-nav-label active' : 'liquid-nav-label'}>
                {label}
              </span>
              {active && <div className="liquid-nav-dot" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

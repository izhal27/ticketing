import Link from 'next/link';

export default function Header({ currentUser }) {
  const links = [
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter(link => link)
    .map(({ label, href }, i) => {
      return (
        <li key={i}>
          <Link href={href}>
            <a className="nav-link">{label}</a>
          </Link>
        </li>
      );
    });

  return (
    <header>
      <nav className="navbar navbar-light bg-light">
        <Link href="/">
          <a className="navbar-brand">Ticketing</a>
        </Link>
        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center">
            {links}
          </ul>
        </div>
      </nav>
    </header>
  );
}

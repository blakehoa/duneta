import { forwardRef, type MouseEvent } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router';
import { useRouter } from '../../router/link/use-router.js';
import type { DunetaLinkProps } from './types';

const linkClassName =
  'inline-flex items-center font-medium text-[color:var(--accent)] transition-colors hover:text-[color:var(--warning)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]';

function isExternalHref(href: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(href);
}

function resolveHref(href?: RouterLinkProps['to'], to?: RouterLinkProps['to']) {
  return href ?? to;
}

export const DunetaLink = forwardRef<HTMLAnchorElement, DunetaLinkProps>(function DunetaLink(
  {
    children,
    className = '',
    disabled = false,
    href,
    to,
    target,
    rel,
    reloadDocument,
    shallow = false,
    onClick,
    ...props
  },
  ref,
) {
  const router = useRouter();
  const destination = resolveHref(href, to);

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`inline-flex items-center font-medium text-zinc-400 dark:text-zinc-600 ${className}`}
      >
        {children}
      </span>
    );
  }

  const classes = `${linkClassName} ${className}`;
  const safeRel = target === '_blank' ? (rel ?? 'noopener noreferrer') : rel;
  const external =
    typeof destination === 'string' && (reloadDocument || isExternalHref(destination));

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !shallow || external || destination == null) return;

    event.preventDefault();
    router.push(destination, { shallow: true, preventScrollReset: true });
  };

  if (external) {
    return (
      <a
        ref={ref}
        href={destination}
        target={target}
        rel={safeRel}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  if (destination == null) {
    return (
      <span className={classes} {...props}>
        {children}
      </span>
    );
  }

  return (
    <RouterLink
      ref={ref}
      to={destination}
      target={target}
      rel={safeRel}
      reloadDocument={reloadDocument}
      className={classes}
      onClick={handleClick}
      {...props}
    >
      {children}
    </RouterLink>
  );
});

import type { LinkProps as RouterLinkProps } from 'react-router';

export type DunetaLinkProps = Omit<RouterLinkProps, 'to' | 'className'> & {
  href?: RouterLinkProps['to'];
  to?: RouterLinkProps['to'];
  className?: string;
  disabled?: boolean;
  shallow?: boolean;
};

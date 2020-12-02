// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import AppBox from '~ui/Primitives/AppBox';
import colors from '~/styles/modules/colors';

type Props = {|
  ...AppBoxProps,
  href: string,
|};

export const styles = {
  textDecoration: 'underline',
  color: colors.blue['500'],

  '&:focus': {
    boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
  },

  '&:hover': {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: colors.blue['700'],

    '&:focus': {
      boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
    },
  },
};

const Link = React.forwardRef<Props, HTMLElement>(({ href, ...props }: Props, ref) => {
  return <AppBox as="a" ref={ref} css={styles} {...props} />;
});

Link.displayName = 'Link';

export default Link;

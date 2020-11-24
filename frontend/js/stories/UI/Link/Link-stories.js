// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Link from '~ds/Link/Link';

export const styles = {};

storiesOf('Design system|Link', module).add('default', () => {
  return (
    <Link href="https://styled-system.com/" css={styles}>
      Click here
    </Link>
  );
});

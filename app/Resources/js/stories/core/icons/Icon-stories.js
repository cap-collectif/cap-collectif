// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Icon from '../../../components/Ui/Icons/Icon';

storiesOf('Core|Icons/Icon', module)
  .add('default', () => <Icon name="link" />)
  .add('with custom color', () => (
    <span style={{ color: 'red' }}>
      <Icon name="link" />
    </span>
  ))
  .add('with custom size', () => <Icon name="link" size={64} />);

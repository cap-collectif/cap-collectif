// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Link as Url } from '~/components/Ui/Link/Link';

storiesOf('Core/Link', module).add('default', () => (
  <div>
    <div style={{ width: '200px', marginBottom: '20px' }}>
      <Url url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
    </div>
    <div style={{ width: '300px' }}>
      <Url url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
    </div>
  </div>
));

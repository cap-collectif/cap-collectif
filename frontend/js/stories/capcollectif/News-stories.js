// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import News from '~/components/Ui/News/News';
import { news, withoutParaph } from '../mocks/news';

storiesOf('Cap Collectif | News', module)
  .add('default case', () => <News news={news} />)
  .add('without body paraph', () => <News news={withoutParaph} />);

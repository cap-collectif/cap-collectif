// @flow
import * as React from 'react';
import Providers from './Providers';
import Accordion from '../components/Ui/Accordion/Accordion';

type Props = Object;

export default (props: Props) => (
  <Providers>
    <Accordion {...props} />
  </Providers>
);

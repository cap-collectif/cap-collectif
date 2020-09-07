// @flow
import * as React from 'react';
import Providers from './Providers';
import GlobalStepList, {
  type Props,
} from '~/components/InteClient/GlobalStep/GlobalStepList/GlobalStepList';

export default (props: Props) => (
  <Providers>
    <GlobalStepList {...props} />
  </Providers>
);

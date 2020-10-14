// @flow
import * as React from 'react';
import Providers from './Providers';
import ParticipationMotivation, {
  type Props,
} from '~/components/InteClient/ParticipationMotivation/ParticipationMotivation';

export default (props: Props) => (
  <Providers>
    <ParticipationMotivation {...props} />
  </Providers>
);

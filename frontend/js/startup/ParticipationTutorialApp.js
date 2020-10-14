// @flow
import * as React from 'react';
import Providers from './Providers';
import ParticipationTutorial, {
  type Props,
} from '~/components/InteClient/ParticipationTutorial/ParticipationTutorial';

export default (props: Props) => (
  <Providers>
    <ParticipationTutorial {...props} />
  </Providers>
);

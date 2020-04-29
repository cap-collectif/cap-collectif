// @flow
import React from 'react';
import Providers from './Providers';
import QuestionnaireStepPage, { type Props } from '~/components/Page/QuestionnaireStepPage';

export default (props: Props) => (
  <Providers>
    <QuestionnaireStepPage {...props} />
  </Providers>
);

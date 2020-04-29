// @flow
import React from 'react';
import Providers from './Providers';
import QuestionnaireAdminCreateButton, {
  type Props,
} from '../components/Questionnaire/QuestionnaireAdminCreateButton';

export default (props: Props) => (
  <Providers>
    <QuestionnaireAdminCreateButton {...props} />
  </Providers>
);

// @flow
import React from 'react';
import Providers from './Providers';
import QuestionnaireAdminPage, {
  type Props,
} from '../components/Questionnaire/QuestionnaireAdminPage';

export default (props: Props) => (
  <Providers>
    <QuestionnaireAdminPage {...props} />
  </Providers>
);

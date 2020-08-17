// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Questionnaire/QuestionnaireAdminCreateButton';
import Loader from '~ui/FeedbacksIndicators/Loader';

const QuestionnaireAdminCreateButton = lazy(() =>
  import('~/components/Questionnaire/QuestionnaireAdminCreateButton'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QuestionnaireAdminCreateButton {...props} />
    </Providers>
  </Suspense>
);

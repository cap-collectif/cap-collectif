// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Questionnaire/QuestionnaireAdminPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const QuestionnaireAdminPage = lazy(() =>
  import(
    /* webpackChunkName: "QuestionnaireAdminPage" */ '~/components/Questionnaire/QuestionnaireAdminPage'
  ),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QuestionnaireAdminPage {...props} />
    </Providers>
  </Suspense>
);

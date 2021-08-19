// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AdminQuestionnaireList = lazy(() =>
  import(
    /* webpackChunkName: "AdminQuestionnaireList" */ '~/components/Admin/Project/QuestionnaireList/QuestionnaireListQuery'
  ),
);

type Props = {|
  +isAdmin: boolean,
|};

export default ({ isAdmin }: Props) => (
  <Providers>
    <Suspense fallback={<Loader />}>
      <AdminQuestionnaireList isAdmin={isAdmin} />
    </Suspense>
  </Providers>
);

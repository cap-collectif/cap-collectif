// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Consultation/ConsultationListBox';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ConsultationListBox = lazy(() =>
  import(
    /* webpackChunkName: "ConsultationListBox" */ '~/components/Consultation/ConsultationListBox'
  ),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ConsultationListBox {...props} />
    </Providers>
  </Suspense>
);

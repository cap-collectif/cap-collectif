// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';
import type { Props } from '~/components/Admin/Emailing/MailParameter/MailParameterQuery';
import AlertBoxApp from '~/startup/AlertBoxApp';

const MailParameterQuery = lazy(() =>
  import(
    /* webpackChunkName: "MailParameterQuery" */ '~/components/Admin/Emailing/MailParameter/MailParameterQuery'
  ),
);

export default ({ id }: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AlertBoxApp />
      <MailParameterQuery id={id} />
    </Providers>
  </Suspense>
);

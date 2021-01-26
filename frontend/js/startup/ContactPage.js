// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ContactForm = lazy(() => import(/* webpackChunkName: "ContactForm" */ '~/components/Contact/ContactForm'));

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ContactForm />
    </Providers>
  </Suspense>
);

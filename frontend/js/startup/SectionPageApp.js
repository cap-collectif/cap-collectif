// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Consultation/SectionPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const SectionPage = lazy(
  () => import(/* webpackChunkName: "SectionPage" */ '~/components/Consultation/SectionPage'),
);

export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px';
  return (
    <Suspense fallback={<Loader />}>
      <Providers resetCSS={false} designSystem>
        <SectionPage {...props} />
      </Providers>
    </Suspense>
  );
};

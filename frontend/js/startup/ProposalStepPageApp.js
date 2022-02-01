// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProposalStepPage = lazy(
  () => import(/* webpackChunkName: "ProposalStepPage" */ '~/components/Page/ProposalStepPage'),
);

type Props = {|
  +stepId: string,
  +count: number,
|};

export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px';
  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem resetCSS={false}>
        {/* $FlowFixMe  */}
        <ProposalStepPage {...props} />
      </Providers>
    </Suspense>
  );
};

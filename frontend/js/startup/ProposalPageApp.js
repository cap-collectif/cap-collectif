// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Proposal/Page/ProposalPage';

const ProposalPage = lazy(() =>
  import(/* webpackChunkName: "ProposalPage" */ '~/components/Proposal/Page/ProposalPage'),
);

export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px';
  return (
    <Suspense fallback={null}>
      <Providers designSystem resetCSS={false}>
        <ProposalPage {...props} />
      </Providers>
    </Suspense>
  );
};

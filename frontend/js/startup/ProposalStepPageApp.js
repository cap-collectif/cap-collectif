// @flow
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Providers from './Providers';
import { getBaseUrl } from '~/config';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import { ProjectHeaderQueryRenderer } from './ProjectHeaderApp';
import ProposalVoteBasketWidgetApp from './ProposalVoteBasketWidgetApp';

const ProposalStepPage = lazy(
  () => import(/* webpackChunkName: "ProposalStepPage" */ '~/components/Page/ProposalStepPage'),
);

const ProposalPage = lazy(
  () => import(/* webpackChunkName: "ProposalPage" */ '~/components/Proposal/Page/ProposalPage'),
);

type Props = {|
  +stepId: string,
  +projectId: string,
  +currentStepType: string,
  +count: number,
  +votesPageUrl: string,
  +showVotesWidget: boolean,
  +currentVotableStepId: ?string,
  +hasVotableStep: boolean,
  +opinionCanBeFollowed: boolean,
  +image: ?string,
|};

const ProposalStepPageRouterSwitch = ({
  currentStepType,
  votesPageUrl,
  showVotesWidget,
  currentVotableStepId,
  hasVotableStep,
  opinionCanBeFollowed,
  image,
  ...props
}: Props) => {
  return (
    <>
      {showVotesWidget && (
        <ProposalVoteBasketWidgetApp votesPageUrl={votesPageUrl} stepId={props.stepId} />
      )}
      <Switch>
        <Route exact path="/:stepType/:stepSlug">
          {/** Since we stay in the same twig template all the css/page architecture should now be reproduced temporarily in react */}
          <section>
            <div className="container" style={{ padding: 0 }}>
              <ProjectHeaderQueryRenderer
                projectId={props.projectId}
                currentStepType={currentStepType}
              />
            </div>
          </section>
          <section className="section--alt">
            <div className="container">
              <ProposalStepPage {...props} />
            </div>
          </section>
        </Route>
        <Route path="/:stepType/:stepSlug/proposals/:slug">
          <ProposalPage
            opinionCanBeFollowed={opinionCanBeFollowed}
            hasVotableStep={hasVotableStep}
            showVotesWidget={showVotesWidget}
            currentVotableStepId={currentVotableStepId}
          />
        </Route>
      </Switch>
    </>
  );
};

const ProposalStepPageApp = ({
  proposalSlug,
  ...props
}: {|
  ...Props,
  +proposalSlug?: string,
|}) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px';
  let basename = window.location.href.replace(getBaseUrl(), '');
  if (proposalSlug) basename = basename.replace(`/proposals/${proposalSlug}`, '');
  basename = basename.substring(0, basename.lastIndexOf('/'));
  basename = basename.substring(0, basename.lastIndexOf('/'));
  return (
    <Suspense fallback={null}>
      <Providers designSystem resetCSS={false}>
        <Router basename={basename}>
          <ScrollToTop />
          <ProposalStepPageRouterSwitch {...props} />
        </Router>
      </Providers>
    </Suspense>
  );
};

export default ProposalStepPageApp;

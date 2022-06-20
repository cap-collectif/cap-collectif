// @flow
import React, { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'relay-hooks';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Providers from './Providers';
import { ProjectHeaderQueryRenderer } from './ProjectHeaderApp';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import environment from '~/createRelayEnvironment';
import PresentationStepPage from '~/components/Page/PresentationStepPage';
import { DebateStepPageWithRouter } from '~/components/Debate/Page/DebateStepPage';
import QuestionnaireStepPage from '~/components/Page/QuestionnaireStepPage';
import CustomStepPage from '~/components/Page/CustomStepPage';
import ProposalStepPage from '~/components/Page/ProposalStepPage';
import ProposalPage from '~/components/Proposal/Page/ProposalPage';

const ProjectHeader = ({ projectId }: { +projectId: string }) => (
  <section>
    <div className="container" style={{ padding: 0 }}>
      <ProjectHeaderQueryRenderer projectId={projectId} />
    </div>
  </section>
);

const BasicStepFallback = () => <section className="section--alt" style={{ height: '300px' }} />;

type Props = {|
  +projectSlug: string,
  +projectId: string,
  +stepId: string,
  // QuestionnaireStep needs this
  +questionnaireId?: string,
  // ProposalPage needs this
  currentVotableStepId?: string,
|};

const ProjectStepPageRouterSwitch = ({ ...props }: Props) => (
  <>
    <Switch>
      <Route exact path="/presentation/:stepSlug">
        <ProjectHeader projectId={props.projectId} />
        <Suspense fallback={<BasicStepFallback />}>
          <PresentationStepPage stepId={props.stepId} projectId={props.projectId} />
        </Suspense>
      </Route>
      <Route exact path="/questionnaire/:stepSlug">
        <ProjectHeader projectId={props.projectId} />
        <section className="section--alt">
          <div className="container" style={{ paddingTop: 48 }}>
            <div className="row">
              <div className="col-xs-12 col-sm-8 col-sm-offset-2 col-md-10 col-md-offset-1">
                <QuestionnaireStepPage initialQuestionnaireId={props.questionnaireId} />
              </div>
            </div>
          </div>
        </section>
      </Route>
      <Route exact path="/debate/:stepSlug">
        <ProjectHeader projectId={props.projectId} />
        <section style={{ background: '#f7f7f7', borderTop: '1px solid #e5e5e5' }}>
          <div className="container">
            <DebateStepPageWithRouter stepId={props.stepId} fromWidget={false} />
          </div>
        </section>
      </Route>
      <Route exact path="/step/:stepSlug">
        <ProjectHeader projectId={props.projectId} />
        <Suspense fallback={<BasicStepFallback />}>
          <CustomStepPage stepId={props.stepId} />
        </Suspense>
      </Route>
      <Route exact path={['/collect/:stepSlug', '/selection/:stepSlug']}>
        <ProjectHeader projectId={props.projectId} />
        <section className="section--alt">
          <div className="container">
            <ProposalStepPage stepId={props.stepId} projectId={props.projectId} />
          </div>
        </section>
      </Route>
      <Route
        exact
        path={[
          '/collect/:stepSlug/proposals/:proposalSlug',
          '/selection/:stepSlug/proposals/:proposalSlug',
        ]}>
        <ScrollToTop />
        <ProposalPage currentVotableStepId={props.currentVotableStepId} />
      </Route>
    </Switch>
  </>
);

export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px';
  return (
    <Providers designSystem resetCSS={false}>
      <RelayEnvironmentProvider environment={environment}>
        <Router basename={`/project/${props.projectSlug}`}>
          <ProjectStepPageRouterSwitch {...props} />
        </Router>
      </RelayEnvironmentProvider>
    </Providers>
  );
};

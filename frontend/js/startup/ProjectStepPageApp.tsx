// @ts-nocheck
import React, { Suspense } from 'react'
import { RelayEnvironmentProvider } from 'relay-hooks'
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Providers from './Providers'
import { ProjectHeaderQueryRenderer } from './ProjectHeaderApp'
import ScrollToTop from '~/components/Utils/ScrollToTop'
import environment from '~/createRelayEnvironment'
import type { GlobalState } from '~/types'
import '~/types'
import PresentationStepPage from '~/components/Page/PresentationStepPage'
import { DebateStepPageWithRouter } from '~/components/Debate/Page/DebateStepPage'
import QuestionnaireStepPage from '~/components/Page/QuestionnaireStepPage'
import CustomStepPage from '~/components/Page/CustomStepPage'
import ProposalStepPage from '~/components/Page/ProposalStepPage'
import ProposalPage from '~/components/Proposal/Page/ProposalPage'
import { getBaseLocale } from '~/utils/router'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import ProjectTrashButton from '~/components/Project/ProjectTrashButton'
import VoteStepPage from '~/components/VoteStep/VoteStepPage'

const ProjectHeader = ({
  projectId,
  platformLocale,
}: {
  readonly projectId: string
  readonly platformLocale: string
}) => {
  const { state } = useLocation()

  return (
    <section>
      <div
        className="container"
        style={{
          padding: 0,
        }}
      >
        <ProjectHeaderQueryRenderer
          projectId={projectId}
          platformLocale={platformLocale}
          currentStepId={state?.stepId}
        />
      </div>
    </section>
  )
}

const ProjectTrash = ({
  showTrash,
  projectSlug,
  unstable__enableCapcoUiDs,
}: {
  showTrash: boolean
  projectSlug: string
  unstable__enableCapcoUiDs?: boolean
}) =>
  showTrash ? (
    <section className="hidden-print">
      <ProjectTrashButton
        link={`/projects/${projectSlug}/trashed`}
        unstable__enableCapcoUiDs={unstable__enableCapcoUiDs}
      />
    </section>
  ) : null

const BasicStepFallback = () => (
  <section
    className="section--alt"
    style={{
      height: '300px',
    }}
  />
)

type Props = {
  readonly projectSlug: string
  readonly projectId: string
  readonly stepId: string
  readonly platformLocale: string
  // QuestionnaireStep needs this
  readonly questionnaireId?: string
  // ProposalPage needs this
  readonly currentVotableStepId?: string
  // VoteStep needs this
  readonly isMapView?: string
}

const ProjectStepPageRouterSwitch = ({ platformLocale, ...props }: Props) => {
  const currentLanguage = useSelector((state: GlobalState) => state.language.currentLanguage)
  const baseUrl = getBaseLocale(currentLanguage, platformLocale)
  const showTrash = useFeatureFlag('project_trash')
  return (
    <>
      <Switch>
        <Route exact path={`${baseUrl}/project/:projectSlug/presentation/:stepSlug`}>
          <ProjectHeader projectId={props.projectId} platformLocale={platformLocale} />
          <Suspense fallback={<BasicStepFallback />}>
            <PresentationStepPage stepId={props.stepId} />
          </Suspense>
        </Route>
        <Route path={`${baseUrl}/project/:projectSlug/questionnaire/:stepSlug`}>
          <ProjectHeader projectId={props.projectId} platformLocale={platformLocale} />
          <section className="section--alt">
            <div
              className="container"
              style={{
                paddingTop: 48,
              }}
            >
              <div className="row">
                <div className="col-xs-12 col-sm-8 col-sm-offset-2 col-md-10 col-md-offset-1">
                  <QuestionnaireStepPage initialQuestionnaireId={props.questionnaireId} />
                </div>
              </div>
            </div>
          </section>
        </Route>
        <Route exact path={`${baseUrl}/project/:projectSlug/debate/:stepSlug`}>
          <ProjectHeader projectId={props.projectId} platformLocale={platformLocale} />
          <section
            style={{
              background: '#f7f7f7',
              borderTop: '1px solid #e5e5e5',
            }}
          >
            <div className="container">
              <DebateStepPageWithRouter stepId={props.stepId} fromWidget={false} />
            </div>
          </section>
          <ProjectTrash projectSlug={props.projectSlug} showTrash={showTrash} unstable__enableCapcoUiDs />
        </Route>
        <Route exact path={`${baseUrl}/project/:projectSlug/step/:stepSlug`}>
          <ProjectHeader projectId={props.projectId} platformLocale={platformLocale} />
          <Suspense fallback={<BasicStepFallback />}>
            <CustomStepPage stepId={props.stepId} />
          </Suspense>
        </Route>
        <Route
          exact
          path={[
            `${baseUrl}/project/:projectSlug/collect/:stepSlug`,
            `${baseUrl}/project/:projectSlug/selection/:stepSlug`,
          ]}
        >
          <ProjectHeader projectId={props.projectId} platformLocale={platformLocale} />
          <section className="section--alt">
            <div className="container">
              <ProposalStepPage stepId={props.stepId} projectId={props.projectId} />
            </div>
          </section>
          <ProjectTrash projectSlug={props.projectSlug} showTrash={showTrash} unstable__enableCapcoUiDs />
        </Route>
        <Route
          exact
          path={[
            `/project/:projectSlug/collect/:stepSlug/proposals/:proposalSlug`,
            `/project/:projectSlug/selection/:stepSlug/proposals/:proposalSlug`,
            `/project/:projectSlug/vote/:stepSlug/proposals/:proposalSlug`,
          ]}
        >
          <ScrollToTop />
          <ProposalPage currentVotableStepId={props.currentVotableStepId} platformLocale={platformLocale} />
        </Route>
        <Route exact path={`${baseUrl}/project/:projectSlug/vote/:stepSlug`}>
          <ScrollToTop />
          <VoteStepPage stepId={props.stepId} projectId={props.projectId} isMapView={!!props.isMapView} />
        </Route>
      </Switch>
    </>
  )
}

export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Providers designSystem resetCSS={false}>
      <RelayEnvironmentProvider environment={environment}>
        <Router basename="/">
          <ProjectStepPageRouterSwitch {...props} />
        </Router>
      </RelayEnvironmentProvider>
    </Providers>
  )
}

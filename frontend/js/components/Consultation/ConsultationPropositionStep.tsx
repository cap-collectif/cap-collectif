import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'

import styled, { css } from 'styled-components'
import { FormattedMessage, useIntl } from 'react-intl'
import ConsultationPlan from './ConsultationPlan'
import DatesInterval from '../Utils/DatesInterval'
import RemainingTime from '../Utils/RemainingTime'
import SectionRecursiveList from './SectionRecursiveList'
import type { ConsultationPropositionStep_consultationStep$data } from '~relay/ConsultationPropositionStep_consultationStep.graphql'
import { META_STEP_NAVIGATION_HEIGHT } from '../Steps/MetaStepNavigationBox'
import { breakpoint } from '../../utils/mixins'
import UserAvatarList from '../User/UserAvatarList'
import BodyInfos from '../Ui/Boxes/BodyInfos'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'

type RelayProps = {
  readonly consultationStep: ConsultationPropositionStep_consultationStep$data
}

type Props = RelayProps & {
  readonly consultationPlanEnabled: boolean
  readonly showConsultationPlan: boolean
}

const STICKY_OFFSET_TOP = 60
const META_STEP_QUERY_SELECTOR = '.meta__step__navigation'

const ConsultationPlanInner = styled.div`
  position: sticky;
  z-index: 1000;
  top: inherit;
  ${breakpoint(
    'large',
    css`
      top: ${({ offset }) => `${offset}px`};
    `,
  )}
`

export const ConsultationPropositionStep = (props: Props) => {
  const { consultationPlanEnabled, showConsultationPlan, consultationStep: step } = props
  const stepNavigationHeaderRef = React.useRef<HTMLDivElement | null | undefined>(null)
  const intl = useIntl()

  const getStepNavigationHeader: () => HTMLDivElement | null | undefined = () => {
    if (stepNavigationHeaderRef.current === null) {
      stepNavigationHeaderRef.current = document.querySelector(META_STEP_QUERY_SELECTOR) as any as
        | HTMLDivElement
        | null
        | undefined
    }

    return stepNavigationHeaderRef.current
  }

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: step?.project?.title, href: step?.project?.url || '' },
      { title: step?.label, href: '' },
    ])
  }, [step, intl])

  const stickyOffset = getStepNavigationHeader() ? META_STEP_NAVIGATION_HEIGHT : 0
  const atLeast2Sections = step.consultation && step.consultation.sections && step.consultation.sections.length > 1
  const isMultiConsultation = step.consultations.totalCount > 1
  return (
    <>
      {consultationPlanEnabled && (
        <ConsultationPlanInner offset={STICKY_OFFSET_TOP + stickyOffset} id="consultation-plan">
          {step.consultation && <ConsultationPlan consultation={step.consultation} />}
        </ConsultationPlanInner>
      )}
      <div
        id="scroll-content"
        className={
          consultationPlanEnabled && showConsultationPlan && atLeast2Sections ? 'col-md-9' : 'col-md-10 col-md-offset-1'
        }
      >
        <h2 className="text-center">
          {step.consultation && isMultiConsultation ? step.consultation.title || step.title : step.title}
        </h2>
        <div className="mb-15 project__step-authors text-center">
          {isMultiConsultation && step.project && step.project.authors && step.project.authors.length > 0 && (
            <div className="mr-15 d-ib">
              <UserAvatarList users={step.project.authors} max={3} avatarSize={16} />
              <FormattedMessage id="project.show.published_by" />
              &nbsp;
              {step.project.authors.filter(Boolean).map((author, index) => (
                <span key={index}>
                  <a href={author.url}>{author.username}</a>
                  {step.project && step.project.authors && index !== step.project.authors.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mb-15 project__step-dates text-center">
          {(step.timeRange.startAt || step.timeRange.endAt) && (
            <div className="mr-15 d-ib">
              <i className="cap cap-calendar-2-1" />{' '}
              <DatesInterval
                startAt={step.timeRange.startAt}
                endAt={step.timeRange.endAt}
                month="short"
                fullDay
                showCurrentYear={false}
              />
            </div>
          )}
          {step.timeRange.endAt && step.state === 'OPENED' && !step.timeless && (
            <div className="d-ib">
              <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.timeRange.endAt} />
            </div>
          )}
        </div>
        {(isMultiConsultation || (step.project && step.project.hasParticipativeStep)) && (
          <div className="mb-30 project__step__consultation--counters text-center">
            {step.consultation && (
              <div className="mr-15 d-ib">
                <i className="cap cap-baloon-1" />{' '}
                {step.consultation.contributions && step.consultation.contributions.totalCount}{' '}
                <FormattedMessage
                  id="project.preview.counters.contributions"
                  values={{
                    num: step.consultation.contributions && step.consultation.contributions.totalCount,
                  }}
                />
              </div>
            )}
            {step.consultation && (
              <div className="mr-15 d-ib">
                <i className="cap cap-hand-like-2-1" /> {step.consultation.votesCount || 0}{' '}
                <FormattedMessage
                  id="project.preview.counters.votes"
                  values={{
                    num: step.consultation.votesCount,
                  }}
                />
              </div>
            )}
            {step.consultation && (
              <div className="mr-15 d-ib">
                <i className="cap cap-user-2-1" /> {step.consultation.contributors.totalCount}{' '}
                <FormattedMessage
                  id="project.preview.counters.contributors"
                  values={{
                    num: step.consultation.contributors.totalCount,
                  }}
                />
              </div>
            )}
          </div>
        )}
        {isMultiConsultation
          ? ((step.consultation && step.consultation.description) || step.body) && (
              <BodyInfos
                maxLines={7}
                illustration={step.consultation && step.consultation.illustration}
                body={
                  step.consultation && step.consultation.description ? step.consultation.description : step.body || ''
                }
              />
            )
          : step.body && <BodyInfos maxLines={5} body={step.body || ''} />}
        {step.consultation && <SectionRecursiveList consultation={step.consultation} />}
      </div>
    </>
  )
}
export default createFragmentContainer(ConsultationPropositionStep, {
  consultationStep: graphql`
    fragment ConsultationPropositionStep_consultationStep on ConsultationStep
    @argumentDefinitions(exceptStepId: { type: "ID" }, consultationSlug: { type: "String!" }) {
      body
      id
      timeRange {
        startAt
        endAt
      }
      title
      label
      state
      timeless
      project {
        url
        title
        hasParticipativeStep(exceptStepId: $exceptStepId)
        authors {
          username
          url
          ...UserAvatarList_users
        }
      }
      consultation(slug: $consultationSlug) {
        sections {
          id
          sections {
            id
          }
        }
        title
        description
        illustration {
          url
          name
        }
        contributions(first: 0, includeTrashed: true) {
          totalCount
        }
        contributors(first: 0) {
          totalCount
        }
        votesCount
        ...ConsultationPlan_consultation
        ...SectionRecursiveList_consultation @arguments(isAuthenticated: $isAuthenticated)
      }
      consultations {
        totalCount
      }
    }
  `,
})

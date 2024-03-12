import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFragment, graphql } from 'react-relay'
import { useSelector } from 'react-redux'
import { Tooltip } from '@cap-collectif/ui'
import moment from 'moment'
import ProjectHeader from '~ui/Project/ProjectHeader'
import type { ProjectStepTabs_project$key } from '~relay/ProjectStepTabs_project.graphql'
import { fromGlobalId, isGlobalId } from '~/utils/fromGlobalId'
import { convertTypenameToStepSlug } from '~/utils/router'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { GlobalState } from '~/types'

export type Props = {
  project: ProjectStepTabs_project$key
  platformLocale: string
  isConsultation?: boolean
  currentStepId?: string
}
const FRAGMENT = graphql`
  fragment ProjectStepTabs_project on Project {
    steps {
      id
      state
      label
      __typename
      url
      slug
      enabled
      timeRange {
        startAt
        endAt
      }
      ... on QuestionnaireStep {
        questionnaire {
          id
        }
      }
    }
  }
`

const ProjectStepTabs = ({
  project,
  isConsultation,
  platformLocale,
  currentStepId: routerCurrentStep,
}: Props): JSX.Element => {
  const data = useFragment(FRAGMENT, project)
  const intl = useIntl()
  const isMobile = useIsMobile()
  const projectStepId = useSelector((state: GlobalState) => state.project.currentProjectStepById)

  const [currentStepId, setCurrentStepId] = React.useState(routerCurrentStep ?? projectStepId)

  const { id: current } = isGlobalId(currentStepId)
    ? fromGlobalId(currentStepId)
    : {
        id: currentStepId,
      }
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  React.useEffect(() => {
    setCurrentStepIndex(
      data.steps.findIndex(elem => {
        const { id } = isGlobalId(elem.id)
          ? fromGlobalId(elem.id)
          : {
              id: elem.id,
            }
        return id === current
      }),
    )
  }, [current, data.steps])

  const returnStepStatus = step => {
    if (step.state !== 'FUTURE') {
      if (step.state === 'CLOSED' && step.__typename !== 'PresentationStep') {
        return intl.formatMessage({
          id: 'step.status.closed',
        })
      }

      if (step.timeRange?.startAt && step.timeRange?.endAt && step.__typename === 'OtherStep') {
        return intl.formatMessage({
          id: 'step.status.open',
        })
      }

      if (
        step.timeRange?.startAt &&
        step.timeRange?.endAt &&
        step.__typename !== 'OtherStep' &&
        step.__typename !== 'PresentationStep'
      ) {
        const count = moment(step.timeRange?.endAt).diff(moment(), 'days')

        if (count === 0) {
          const hours = moment(step.timeRange?.endAt).diff(moment(), 'hours')
          return intl.formatMessage(
            {
              id: 'count.block.hoursLeft',
            },
            {
              count: hours,
            },
          )
        }

        return isMobile ? (
          intl.formatMessage(
            {
              id: 'count.block.daysLeft',
            },
            {
              count,
            },
          )
        ) : (
          <Tooltip
            label={intl.formatMessage(
              {
                id: 'fromDayToDay',
              },
              {
                day: intl.formatDate(moment(step.timeRange?.startAt), {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }),
                anotherDay: intl.formatDate(moment(step.timeRange?.endAt), {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }),
              },
            )}
          >
            <div>
              {intl.formatMessage(
                {
                  id: 'count.block.daysLeft',
                },
                {
                  count,
                },
              )}
            </div>
          </Tooltip>
        )
      }

      return ''
    }
  }

  const getTooltipText = step => {
    if (step.state === 'FUTURE' && step.timeRange?.startAt && step.__typename !== 'PresentationStep') {
      return intl.formatMessage(
        {
          id: 'frise-tooltip-text',
        },
        {
          date: intl.formatDate(moment(step.timeRange?.startAt), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      )
    }

    return null
  }

  const renderProgressBar = step => {
    const { id: decoded } = isGlobalId(step.id)
      ? fromGlobalId(step.id)
      : {
          id: step.id,
        }

    if (step.state === 'OPENED') {
      if (decoded === current && step.timeRange?.startAt && step.timeRange?.endAt) {
        const progress =
          moment().diff(moment(step.timeRange.startAt), 'days') /
          moment(step.timeRange?.endAt).diff(moment(step.timeRange?.startAt), 'days')
        return <ProjectHeader.Step.Progress progress={progress * 100} />
      }
    }

    return null
  }

  const getColorState = (stepId, state) => {
    const { id: decoded } = isGlobalId(stepId)
      ? fromGlobalId(stepId)
      : {
          id: stepId,
        }

    if (decoded === current) {
      return 'ACTIVE'
    }

    if (state === 'FUTURE') {
      return 'WAITING'
    }

    return 'FINISHED'
  }

  if (!data || data.steps.length <= 1) {
    return null
  }

  return (
    <ProjectHeader.Frise>
      <ProjectHeader.Steps
        modalTitle={intl.formatMessage({
          id: 'project-header-step-modal-title',
        })}
        currentStepIndex={currentStepIndex}
      >
        {data.steps
          .filter(step => step.enabled)
          .map(step => (
            <ProjectHeader.Step
              key={step.id}
              stepId={step.id}
              title={step.label}
              onClick={() => {
                setCurrentStepId(step.id)
              }}
              questionnaireId={step.questionnaire?.id}
              href={`/${convertTypenameToStepSlug(step.__typename)}/${step.slug || ''}`}
              url={isConsultation || step.__typename === 'ConsultationStep' || isMobile ? step.url : null}
              content={returnStepStatus(step)}
              tooltipLabel={getTooltipText(step)}
              state={getColorState(step.id, step.state)}
              platformLocale={platformLocale}
            >
              {renderProgressBar(step)}
            </ProjectHeader.Step>
          ))}
      </ProjectHeader.Steps>
    </ProjectHeader.Frise>
  )
}

export default ProjectStepTabs

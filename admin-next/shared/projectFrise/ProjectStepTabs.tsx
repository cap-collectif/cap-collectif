import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFragment, graphql } from 'react-relay'
import { Box, BoxProps, Tooltip } from '@cap-collectif/ui'
import moment from 'moment'
import type { ProjectStepTabs_project$key } from '@relay/ProjectStepTabs_project.graphql'
import { fromGlobalId, isGlobalId } from '@shared/utils/fromGlobalId'
import useIsMobile from '@shared/hooks/useIsMobile'
import { convertTypenameToStepSlug } from './utils'
import { Progress } from './Progress'
import { Steps } from './Steps'
import { Step } from './Step'

export type Props = BoxProps & {
  project: ProjectStepTabs_project$key
  platformLocale?: string
  isConsultation?: boolean
  currentStepId?: string
  mainColor: string
  RouterWrapper?: React.JSXElementConstructor<any>
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

const ProjectStepTabs: React.FC<Props> = ({
  project,
  isConsultation,
  platformLocale,
  currentStepId: initialStepId,
  mainColor,
  RouterWrapper,
  ...rest
}) => {
  const data = useFragment(FRAGMENT, project)
  const intl = useIntl()
  const isMobile = useIsMobile()

  const [currentStepId, setCurrentStepId] = React.useState(initialStepId)

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
                day: intl.formatDate(moment(step.timeRange?.startAt) as unknown as string, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }),
                anotherDay: intl.formatDate(moment(step.timeRange?.endAt) as unknown as string, {
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
          date: intl.formatDate(moment(step.timeRange?.startAt) as unknown as string, {
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
        return <Progress progress={progress * 100} mainColor={mainColor} />
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
    <Box className="frise" width="100%" paddingX={[4, 0]} {...rest}>
      <Steps
        modalTitle={intl.formatMessage({
          id: 'project-header-step-modal-title',
        })}
        currentStepIndex={currentStepIndex}
        mainColor={mainColor}
      >
        {data.steps
          .filter(step => step.enabled)
          .map(step => (
            <Step
              key={step.id}
              stepId={step.id}
              title={step.label}
              onClick={() => {
                setCurrentStepId(step.id)
              }}
              questionnaireId={step.questionnaire?.id}
              href={`/${convertTypenameToStepSlug(step.__typename)}/${step.slug || ''}`}
              url={
                isConsultation || step.__typename === 'ConsultationStep' || isMobile || !RouterWrapper ? step.url : null
              }
              content={returnStepStatus(step)}
              tooltipLabel={getTooltipText(step)}
              state={getColorState(step.id, step.state)}
              platformLocale={platformLocale}
              mainColor={mainColor}
              RouterWrapper={RouterWrapper}
            >
              {renderProgressBar(step)}
            </Step>
          ))}
      </Steps>
    </Box>
  )
}

export default ProjectStepTabs

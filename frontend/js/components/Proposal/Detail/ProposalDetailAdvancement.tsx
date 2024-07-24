import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import moment from 'moment-timezone'
import ProposalDetailAdvancementStep from './ProposalDetailAdvancementStep'
import type { ProposalDetailAdvancement_proposal } from '~relay/ProposalDetailAdvancement_proposal.graphql'
import { colorsData } from '~/utils/colors'
const grey = '#d9d9d9'
const green = colorsData.SUCCESS

const consideredCurrentProgressStep = (progressSteps: ReadonlyArray<Record<string, any>>) => {
  let lastStarting: any = null

  for (const step of progressSteps) {
    if (moment(step.startAt) < moment()) {
      lastStarting = step
    }
  }

  let isPastLastStarting = false

  for (const step of progressSteps) {
    if (isPastLastStarting) {
      return step
    }

    if (step.endAt && moment(step.startAt) < moment() && moment(step.endAt) > moment()) {
      return step
    }
    if (lastStarting && lastStarting.title === step.title) {
      isPastLastStarting = true
    }
  }

  return progressSteps[progressSteps.length - 1]
}

const generateProgressStepsWithColorAndStatus = (progressSteps: ReadonlyArray<Record<string, any>>) => {
  if (!progressSteps || progressSteps.length < 1) {
    return []
  }

  const stepConsideredCurrent = consideredCurrentProgressStep(progressSteps)
  const steps: any = []
  let isPastCurrent = false

  for (const progressStep of progressSteps) {
    const data: any = {
      roundColor: isPastCurrent ? grey : green,
      borderColor: isPastCurrent ? grey : green,
      status: null,
    }

    if (progressStep.title === stepConsideredCurrent.title) {
      const currentTime = moment()

      if (
        progressStep.startAt &&
        progressStep.endAt &&
        moment(progressStep.startAt) <= currentTime &&
        moment(progressStep.endAt) >= currentTime
      ) {
        data.status = {
          name: 'En cours',
          color: 'warning',
        }
        data.roundColor = colorsData.WARNING
        data.borderColor = grey
      }

      if (!progressStep.endAt && moment(progressStep.startAt) <= currentTime) {
        data.status = {
          name: 'Terminé',
          color: 'success',
        }
        data.roundColor = colorsData.SUCCESS
      }

      if (!progressStep.endAt && moment(progressStep.startAt) > currentTime) {
        data.status = {
          name: 'A venir',
          color: 'info',
        }
        data.roundColor = colorsData.SUCCESS
      }

      if (progressStep.endAt && moment(progressStep.endAt) < currentTime) {
        data.status = {
          name: 'Terminé',
          color: 'success',
        }
        data.roundColor = colorsData.SUCCESS
      }
      isPastCurrent = true
    }
    // @ts-ignore
    steps.push({ ...progressStep, ...data })
  }

  return steps
}

export type Step = {
  id: string
  title: string
  __typename: string
  timeless: boolean | null | undefined
  timeRange: {
    readonly startAt: string | null | undefined
    readonly endAt: string | null | undefined
  }
  isSelected?: boolean
  isCurrent?: boolean
  enabled: boolean
  isPast?: boolean
  isFuture?: boolean
  allowingProgressSteps?: boolean
}
type Props = {
  proposal: ProposalDetailAdvancement_proposal
  displayedSteps: Array<Step>
}
export class ProposalDetailAdvancement extends React.Component<Props> {
  getStatus = (step: Step) => {
    const { proposal } = this.props
    return step.__typename === 'CollectStep' ? proposal.status || null : this.getSelectionStatus(step)
  }
  getSelectionStatus = (step: Step) => {
    const { proposal } = this.props

    for (const selection of proposal.selections) {
      if (step.id === selection.step.id) {
        return selection.status
      }
    }

    return null
  }

  render() {
    const { proposal, displayedSteps } = this.props
    if (!proposal) return null
    const progressSteps = generateProgressStepsWithColorAndStatus(proposal.progressSteps)
    return (
      <ol
        style={{
          listStyle: 'none',
        }}
      >
        {displayedSteps.map((step, index) => {
          let roundColor = grey

          if (step.isCurrent) {
            const status = this.getStatus(step)
            roundColor = status ? colorsData[status.color] : green
          } else if (step.isPast) {
            roundColor = green
          }

          return (
            <ProposalDetailAdvancementStep
              key={index}
              step={{
                title: step.title,
                startAt: step.timeRange.startAt,
                endAt: step.timeRange.endAt,
                progressStep: false,
                timeless: step.timeless,
              }}
              active={step.isCurrent}
              status={step.isCurrent ? this.getStatus(step) : null}
              roundColor={roundColor}
              borderColor={
                index + 1 === displayedSteps.length
                  ? null
                  : displayedSteps[index + 1].isCurrent || displayedSteps[index + 1].isPast
                  ? green
                  : grey
              }
            >
              {step.isCurrent && step.allowingProgressSteps && (
                <ol
                  style={{
                    marginLeft: 30,
                    listStyle: 'none',
                  }}
                >
                  {progressSteps.map((progressStep, i) => (
                    <ProposalDetailAdvancementStep
                      key={i}
                      step={{
                        title: progressStep.title,
                        startAt: progressStep.startAt,
                        endAt: progressStep.endAt ? progressStep.endAt : null,
                        progressStep: true,
                      }}
                      status={progressStep.status}
                      roundColor={progressStep.roundColor}
                      borderColor={i + 1 === progressSteps.length ? null : progressStep.borderColor}
                    />
                  ))}
                </ol>
              )}
            </ProposalDetailAdvancementStep>
          )
        })}
      </ol>
    )
  }
}
export default createFragmentContainer(ProposalDetailAdvancement, {
  proposal: graphql`
    fragment ProposalDetailAdvancement_proposal on Proposal {
      id
      status {
        name
        color
      }
      selections {
        step {
          id
        }
        status {
          name
          color
        }
      }
      progressSteps {
        title
        startAt
        endAt
      }
    }
  `,
})

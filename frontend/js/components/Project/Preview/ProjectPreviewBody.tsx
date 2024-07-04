import { $PropertyType } from 'utility-types'
import * as React from 'react'
import moment from 'moment'
import Truncate from 'react-truncate'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedDate, FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import colors from '~/styles/modules/colors'
import RemainingTime from '../../Utils/RemainingTime'
import ProjectPreviewThemes from './ProjectPreviewThemes'
import ProjectPreviewProgressBar from './ProjectPreviewProgressBar'
import ProjectPreviewCounters from './ProjectPreviewCounters'
import ProjectPreviewExternalCounters from './ProjectPreviewExternalCounters'
import Card from '../../Ui/Card/Card'
import type { ProjectPreviewBody_project } from '~relay/ProjectPreviewBody_project.graphql'
import Tooltip from '~ds/Tooltip/Tooltip'
type Step = $ArrayElement<$PropertyType<ProjectPreviewBody_project, 'steps'>>
type Props = {
  readonly project: ProjectPreviewBody_project
  readonly hasSecondTitle?: boolean
}

const getStepsFilter = (project: ProjectPreviewBody_project) => {
  const projectStep = project.steps
    .slice(0)
    .sort((a, b) => {
      const dateA = a.timeRange.startAt ? new Date(a.timeRange.startAt) : 0
      const dateB = b.timeRange.startAt ? new Date(b.timeRange.startAt) : 0
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0
    })
    .filter(step => step.enabled)
  const stepClosed = projectStep.filter(step => step.state === 'CLOSED' && step.__typename !== 'PresentationStep')
  const stepFuture = projectStep.filter(step => step.state === 'FUTURE' && step.__typename !== 'PresentationStep')
  const stepOpen = projectStep
    .filter(step => step.state === 'OPENED' && step.__typename !== 'PresentationStep')
    .filter(step => step.timeless === false && step.__typename !== 'OtherStep')
  const stepContinuousParticipation = projectStep.filter(step => step.timeless === true && step.__typename !== 'OtherStep')
  return {
    stepClosed,
    stepFuture,
    stepOpen,
    stepContinuousParticipation,
  }
}

const getCurrentStep = (project: ProjectPreviewBody_project) => {
  const filters = getStepsFilter(project)
  const { stepOpen, stepClosed, stepFuture } = filters

  if (stepClosed.length > 0 && stepFuture.length > 0 && stepOpen.length === 0) {
    return true
  }

  if (stepFuture.length > 0 && stepOpen.length === 0 && stepClosed.length === 0) {
    return false
  }

  return null
}

const getActualStep = (project: ProjectPreviewBody_project) => {
  const { stepContinuousParticipation, stepOpen, stepClosed, stepFuture } = getStepsFilter(project)

  if (stepContinuousParticipation.length > 0) {
    return stepContinuousParticipation[0]
  }

  if (stepOpen.length > 0 && stepContinuousParticipation.length === 0) {
    return stepOpen[0]
  }

  if (stepFuture.length > 0 && stepOpen.length === 0 && stepClosed.length === 0) {
    return stepFuture[0]
  }

  if (stepClosed.length > 0 && (stepFuture.length > 0 || stepFuture.length === 0) && stepOpen.length === 0) {
    return stepClosed[stepClosed.length - 1]
  }
}

export class ProjectPreviewBody extends React.Component<Props> {
  getAction = (step: Step, archived: boolean) => {
    if (archived) return null
    const { project } = this.props
    const isCurrentStep = getCurrentStep(project)

    if (step.state === 'OPENED' && this.actualStepIsParticipative()) {
      return (
        <a href={step.url} className="text-uppercase  mr-10">
          <FormattedMessage id="project.preview.action.participe" />
        </a>
      )
    }

    if ((!this.actualStepIsParticipative() && step.state === 'OPENED') || isCurrentStep) {
      return (
        <a href={step.url} className="text-uppercase  mr-10">
          <FormattedMessage id="project.preview.action.seeStep" />
        </a>
      )
    }

    if (step.state === 'CLOSED') {
      return (
        <a href={step.url} className="text-uppercase  mr-10">
          <FormattedMessage id="project.preview.action.seeResult" />
        </a>
      )
    }
  }
  getStartDate = (step: Step) => {
    if (step.timeRange.startAt) {
      const startAtDate = moment(step.timeRange.startAt).toDate()
      const startDay = <FormattedDate value={startAtDate} day="numeric" month="long" year="numeric" />

      if (step.state === 'FUTURE') {
        return (
          <span className="excerpt-dark">
            <FormattedMessage id="date.startAt" /> {startDay}
          </span>
        )
      }
    }
  }
  getTitleContent = () => {
    const { project } = this.props
    const link = project.externalLink || project.url
    const Title = styled(Truncate)`
      color: ${props => (props.archived ? colors['neutral-gray']['500'] : 'inherit')};
      display: flex;
      flex-flow: row nowrap;
      gap: 6px;
    `
    return (
      <Tooltip
        placement="top"
        label={project.title}
        id={`project-${project.id}-tooltip`}
        className="text-left"
        style={{
          wordBreak: 'break-word',
        }}
      >
        <a href={link} target={project.isExternal && project.externalLink ? 'blank' : ''}>
          <div
            style={{
              width: '98%',
            }}
          >
            <Title lines={3} archived={project.archived}>
              {project.title}
            </Title>
          </div>
        </a>
      </Tooltip>
    )
  }
  getTitle = () => {
    const { hasSecondTitle } = this.props
    return <Card.Title tagName={hasSecondTitle ? 'h2' : 'h3'}>{this.getTitleContent()}</Card.Title>
  }

  // This should be a field on our GraphQL API
  actualStepIsParticipative() {
    const { project } = this.props
    const step = getActualStep(project)
    return (
      step &&
      (step.__typename === 'ConsultationStep' ||
        step.__typename === 'CollectStep' ||
        step.__typename === 'QuestionnaireStep' ||
        (step.__typename === 'SelectionStep' && step.votable === true))
    )
  }

  render() {
    const { project } = this.props
    const actualStep = getActualStep(project)
    const isCurrentStep = getCurrentStep(project)
    return (
      <Card.Body position="relative">
        <div className="flex-1">
          <ProjectPreviewThemes project={project} />
          {this.getTitle()}
          <ProjectPreviewCounters project={project} />
          {project.isExternal && <ProjectPreviewExternalCounters project={project} />}
        </div>
        {actualStep && (
          <ProjectPreviewProgressBar project={project} actualStep={actualStep} isCurrentStep={isCurrentStep} />
        )}
        <div className="small excerpt">
          {actualStep && this.getAction(actualStep, project.archived)} {actualStep && this.getStartDate(actualStep)}{' '}
          {actualStep &&
            actualStep.state === 'OPENED' &&
            !actualStep.timeless &&
            actualStep.timeRange.endAt &&
            this.actualStepIsParticipative() &&
            !project.archived && <RemainingTime endAt={actualStep.timeRange.endAt} />}
        </div>
      </Card.Body>
    )
  }
}
export default createFragmentContainer(ProjectPreviewBody, {
  project: graphql`
    fragment ProjectPreviewBody_project on Project {
      id
      title
      externalLink
      isExternal
      url
      steps {
        ...ProjectPreviewProgressBar_actualStep
        __typename
        title
        timeless
        state
        enabled
        timeRange {
          startAt
          endAt
        }
        url
        ... on ProposalStep {
          votable
        }
      }
      archived
      ...ProjectPreviewProgressBar_project
      ...ProjectPreviewCounters_project
      ...ProjectPreviewExternalCounters_project
      ...ProjectPreviewThemes_project
    }
  `,
})

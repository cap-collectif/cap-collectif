import * as React from 'react'
import { ProgressBar } from 'react-bootstrap'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { Progress } from '~ui/FeedbacksIndicators/Progress'
import type { ProjectPreviewProgressBar_project } from '~relay/ProjectPreviewProgressBar_project.graphql'
import type {
  StepState,
  ProjectPreviewProgressBar_actualStep,
} from '~relay/ProjectPreviewProgressBar_actualStep.graphql'
type Props = {
  readonly project: ProjectPreviewProgressBar_project
  readonly actualStep: ProjectPreviewProgressBar_actualStep
  readonly isCurrentStep?: boolean | null | undefined
}
export class ProjectPreviewProgressBar extends React.Component<Props> {
  getStyle = (state: StepState) => {
    const { isCurrentStep } = this.props

    if (state === 'OPENED' || isCurrentStep) {
      return 'success'
    }
  }
  getClass = (state: StepState, archived: boolean) => {
    const { isCurrentStep } = this.props

    if ((state === 'CLOSED' && !isCurrentStep) || archived) {
      return 'progress-bar_grey'
    }

    if (state === 'FUTURE') {
      return 'progress-bar_empty'
    }
  }
  getLabel = (step: ProjectPreviewProgressBar_actualStep, archived: boolean) => {
    if (archived) {
      return <FormattedMessage id="global-archived" />
    }

    const { isCurrentStep } = this.props

    if (step.timeless === true) {
      return <FormattedMessage id="step.timeless" />
    }

    if (step.state === 'OPENED' || isCurrentStep) {
      return <FormattedMessage id="step.status.open" />
    }

    if (step.state === 'FUTURE') {
      return <FormattedMessage id="step.status.future" />
    }

    if (step.state === 'CLOSED' && !isCurrentStep) {
      return <FormattedMessage id="step.status.closed" />
    }
  }
  getWidth = (step: ProjectPreviewProgressBar_actualStep, archived: boolean) => {
    const { isCurrentStep } = this.props

    if (archived || (step.state === 'CLOSED' && !isCurrentStep) || step.state === 'FUTURE' || step.timeless === true) {
      return 100
    }

    if (step.state === 'OPENED' || isCurrentStep) {
      return 50
    }

    return 0
  }

  render() {
    const { project, actualStep } = this.props
    const nbSteps = project.steps.length

    if (nbSteps > 0) {
      return (
        <Progress>
          <ProgressBar
            className={this.getClass(actualStep.state, project.archived)}
            bsStyle={this.getStyle(actualStep.state)}
            now={this.getWidth(actualStep, project.archived)}
            label={this.getLabel(actualStep, project.archived)}
          />
        </Progress>
      )
    }

    return null
  }
}
export default createFragmentContainer(ProjectPreviewProgressBar, {
  project: graphql`
    fragment ProjectPreviewProgressBar_project on Project {
      steps {
        id
      }
      archived
    }
  `,
  actualStep: graphql`
    fragment ProjectPreviewProgressBar_actualStep on Step {
      timeless
      state
    }
  `,
})

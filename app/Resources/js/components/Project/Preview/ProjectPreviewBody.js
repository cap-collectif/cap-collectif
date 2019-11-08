// @flow
import * as React from 'react';
import moment from 'moment';
import Truncate from 'react-truncate';
import { graphql, createFragmentContainer } from 'react-relay';
import { OverlayTrigger } from 'react-bootstrap';
import { FormattedDate, FormattedMessage } from 'react-intl';
import RemainingTime from '../../Utils/RemainingTime';
import ProjectPreviewThemes from './ProjectPreviewThemes';
import ProjectPreviewProgressBar from './ProjectPreviewProgressBar';
import ProjectPreviewCounters from './ProjectPreviewCounters';
import ProjectPreviewExternalCounters from './ProjectPreviewExternalCounters';
import Card from '../../Ui/Card/Card';
import Tooltip from '../../Utils/Tooltip';
import type { ProjectPreviewBody_project } from '~relay/ProjectPreviewBody_project.graphql';

type Props = {|
  +project: ProjectPreviewBody_project,
  +hasSecondTitle?: boolean,
|};

const getStepsFilter = (project: ProjectPreviewBody_project) => {
  const projectStep = project.steps.slice(0).sort((a, b) => {
    const dateA = a.timeRange.startAt ? new Date(a.timeRange.startAt) : 0;
    const dateB = b.timeRange.startAt ? new Date(b.timeRange.startAt) : 0;
    return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
  });
  const stepClosed = projectStep.filter(step => step.status === 'CLOSED');
  const stepFuture = projectStep.filter(step => step.status === 'FUTURE');
  const stepOpen = projectStep.filter(step => step.status === 'OPENED');
  const stepContinuousParticipation = projectStep.filter(step => step.timeless === true);

  return {
    stepClosed,
    stepFuture,
    stepOpen,
    stepContinuousParticipation,
  };
};

const getCurrentStep = (project: ProjectPreviewBody_project) => {
  const filters = getStepsFilter(project);
  const { stepOpen, stepClosed, stepFuture } = filters;

  if (stepClosed.length > 0 && stepFuture.length > 0 && stepOpen.length === 0) {
    return true;
  }
  if (stepFuture.length > 0 && stepOpen.length === 0 && stepClosed.length === 0) {
    return false;
  }

  return null;
};

const getActualStep = (project: ProjectPreviewBody_project) => {
  const { stepContinuousParticipation, stepOpen, stepClosed, stepFuture } = getStepsFilter(project);

  if (stepContinuousParticipation.length > 0) {
    return stepContinuousParticipation[0];
  }
  if (stepOpen.length > 0 && stepContinuousParticipation.length === 0) {
    return stepOpen[0];
  }
  if (stepFuture.length > 0 && stepOpen.length === 0 && stepClosed.length === 0) {
    return stepFuture[0];
  }
  if (
    stepClosed.length > 0 &&
    (stepFuture.length > 0 || stepFuture.length === 0) &&
    stepOpen.length === 0
  ) {
    return stepClosed[stepClosed.length - 1];
  }
};

export class ProjectPreviewBody extends React.Component<Props> {
  getAction = (step: Object) => {
    const { project } = this.props;

    const isCurrentStep = getCurrentStep(project);

    if (step.status === 'OPENED' && this.actualStepIsParticipative()) {
      return (
        <a href={step.url} className="text-uppercase  mr-10">
          <FormattedMessage id="project.preview.action.participe" />
        </a>
      );
    }
    if ((!this.actualStepIsParticipative() && step.status === 'OPENED') || isCurrentStep) {
      return (
        <a href={step.url} className="text-uppercase  mr-10">
          <FormattedMessage id="project.preview.action.seeStep" />
        </a>
      );
    }
    if (step.status === 'CLOSED') {
      return (
        <a href={step.url} className="text-uppercase  mr-10">
          <FormattedMessage id="project.preview.action.seeResult" />
        </a>
      );
    }
  };

  getStartDate = (step: Object) => {
    if (step.timeRange.startAt) {
      const startAtDate = moment(step.timeRange.startAt).toDate();
      const startDay = (
        <FormattedDate value={startAtDate} day="numeric" month="long" year="numeric" />
      );

      if (step.status === 'FUTURE') {
        return (
          <span className="excerpt-dark">
            <FormattedMessage id="date.startAt" /> {startDay}
          </span>
        );
      }
    }
  };

  getTitleContent = () => {
    const { project } = this.props;
    const link = project.externalLink || project.url;
    const tooltip = <Tooltip id={`project-${project.id}-tooltip`}>{project.title}</Tooltip>;

    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <a href={link} target={project.isExternal && project.externalLink ? 'blank' : ''}>
          <div style={{ width: '98%' }}>
            <Truncate lines={3}>{project.title}</Truncate>
          </div>
        </a>
      </OverlayTrigger>
    );
  };

  getTitle = () => {
    const { hasSecondTitle } = this.props;

    return <Card.Title tagName={hasSecondTitle ? 'h2' : 'h3'}>{this.getTitleContent()}</Card.Title>;
  };

  actualStepIsParticipative() {
    const { project } = this.props;
    const step = getActualStep(project);

    return (
      step &&
      (step.type === 'consultation' ||
        step.type === 'collect' ||
        step.type === 'questionnaire' ||
        (step.type === 'selection' && step.votable === true))
    );
  }

  render() {
    const { project } = this.props;
    const actualStep = getActualStep(project);
    const isCurrentStep = getCurrentStep(project);

    return (
      <Card.Body>
        <div className="flex-1">
          <ProjectPreviewThemes project={project} />
          {this.getTitle()}
          <ProjectPreviewCounters project={project} />
          {project.isExternal && <ProjectPreviewExternalCounters project={project} />}
        </div>
        {actualStep && (
          <ProjectPreviewProgressBar
            project={project}
            actualStep={actualStep}
            isCurrentStep={isCurrentStep}
          />
        )}
        <div className="small excerpt">
          {actualStep && this.getAction(actualStep)} {actualStep && this.getStartDate(actualStep)}{' '}
          {actualStep &&
            actualStep.status === 'OPENED' &&
            !actualStep.timeless &&
            actualStep.timeRange.endAt &&
            this.actualStepIsParticipative() && (
              <RemainingTime endAt={actualStep.timeRange.endAt} />
            )}
        </div>
      </Card.Body>
    );
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
        title
        timeless
        status
        timeRange {
          startAt
          endAt
        }
        type
        url
        ... on ProposalStep {
          votable
        }
      }
      ...ProjectPreviewProgressBar_project
      ...ProjectPreviewCounters_project
      ...ProjectPreviewExternalCounters_project
      ...ProjectPreviewThemes_project
    }
  `,
});

// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useFragment, graphql } from 'react-relay';
import { useSelector } from 'react-redux';
import moment from 'moment';
import ProjectHeader from '~ui/Project/ProjectHeader';
import type { ProjectStepTabs_project$key } from '~relay/ProjectStepTabs_project.graphql';
import { fromGlobalId } from '~/utils/fromGlobalId';

export type Props = {|
  project: ProjectStepTabs_project$key,
|};
const FRAGMENT = graphql`
  fragment ProjectStepTabs_project on Project {
    steps {
      id
      state
      label
      __typename
      url
      enabled
      timeRange {
        startAt
        endAt
      }
    }
  }
`;
const ProjectStepTabs = ({ project }: Props): React.Node => {
  const data = useFragment(FRAGMENT, project);
  const intl = useIntl();
  const currentStepId = useSelector(state => state.project.currentProjectStepById);
  const { id: current } = fromGlobalId(currentStepId);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  React.useEffect(() => {
    setCurrentStepIndex(
      data.steps.findIndex(elem => {
        const { id } = fromGlobalId(elem.id);
        return id === current;
      }),
    );
  }, [current, data.steps]);

  const returnStepStatus = step => {
    if (step.state !== 'FUTURE') {
      if (step.state === 'CLOSED' && step.__typename !== 'PresentationStep') {
        return intl.formatMessage({ id: 'step.status.closed' });
      }
      if (step.timeRange?.startAt && step.timeRange?.endAt && step.__typename === 'OtherStep') {
        return intl.formatMessage({ id: 'step.status.open' });
      }
      if (
        step.timeRange?.startAt &&
        step.timeRange?.endAt &&
        step.__typename !== 'OtherStep' &&
        step.__typename !== 'PresentationStep'
      ) {
        const count = moment(step.timeRange?.endAt).diff(moment(), 'days');
        if (count === 0) {
          const hours = moment(step.timeRange?.endAt).diff(moment(), 'hours');
          return intl.formatMessage({ id: 'count.block.hoursLeft' }, { count: hours });
        }
        return intl.formatMessage({ id: 'count.block.daysLeft' }, { count });
      }

      return '';
    }
  };
  const getTooltipText = step => {
    if (
      step.state === 'FUTURE' &&
      step.timeRange?.startAt &&
      step.__typename !== 'PresentationStep'
    ) {
      return intl.formatMessage(
        { id: 'frise-tooltip-text' },
        {
          date: intl.formatDate(moment(step.timeRange?.startAt), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      );
    }
    return null;
  };
  const renderProgressBar = step => {
    const { id: decoded } = fromGlobalId(step.id);
    if (step.state === 'OPENED') {
      if (decoded === current && step.timeRange?.startAt && step.timeRange?.endAt) {
        const progress =
          moment().diff(moment(step.timeRange.startAt), 'days') /
          moment(step.timeRange?.endAt).diff(moment(step.timeRange?.startAt), 'days');
        return <ProjectHeader.Step.Progress progress={progress * 100} />;
      }
    }

    return null;
  };
  const getColorState = (stepId, state) => {
    const { id: decoded } = fromGlobalId(stepId);
    if (decoded === current) {
      return 'ACTIVE';
    }
    if (state === 'FUTURE') {
      return 'WAITING';
    }
    return 'FINISHED';
  };
  if (!data || data.steps.length <= 1) {
    return null;
  }
  return (
    <ProjectHeader.Frise>
       <ProjectHeader.Steps
        modalTitle={intl.formatMessage({ id: 'project-header-step-modal-title' })}
        currentStepIndex={currentStepIndex}>
        {data.steps
          .filter(step => step.enabled)
          .map(step => (
            <ProjectHeader.Step
              key={step.id}
              title={step.label}
              href={step.url}
              content={returnStepStatus(step)}
              tooltipLabel={getTooltipText(step)}
              state={getColorState(step.id, step.state)}>
              {renderProgressBar(step)}
            </ProjectHeader.Step>
          ))}
       </ProjectHeader.Steps>
    </ProjectHeader.Frise>
  );
};
export default ProjectStepTabs;

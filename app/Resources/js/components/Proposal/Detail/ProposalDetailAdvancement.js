// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import moment from 'moment-timezone';
import { connect, type MapStateToProps } from 'react-redux';
import ProposalDetailAdvancementStep from './ProposalDetailAdvancementStep';
import { bootstrapToHex } from '../../../utils/bootstrapToHexColor';
import type { ProposalDetailAdvancement_proposal } from './__generated__/ProposalDetailAdvancement_proposal.graphql';

const grey = '#d9d9d9';
const green = '#5cb85c';

const consideredCurrentProgressStep = (progressSteps: $ReadOnlyArray<Object>) => {
  let lastStarting = null;
  for (const step of progressSteps) {
    if (moment(step.startAt) < moment()) {
      lastStarting = step;
    }
  }
  let isPastLastStarting = false;
  for (const step of progressSteps) {
    if (isPastLastStarting) {
      return step;
    }
    if (step.endAt && moment(step.startAt) < moment() && moment(step.endAt) > moment()) {
      return step;
    }
    if (lastStarting && lastStarting.title === step.title) {
      isPastLastStarting = true;
    }
  }
  return progressSteps[progressSteps.length - 1];
};
const generateProgressStepsWithColorAndStatus = (progressSteps: $ReadOnlyArray<Object>) => {
  if (progressSteps.length < 1) {
    return [];
  }
  const stepConsideredCurrent = consideredCurrentProgressStep(progressSteps);

  const steps = [];
  let isPastCurrent = false;
  for (const progressStep of progressSteps) {
    const data = {
      roundColor: isPastCurrent ? grey : green,
      borderColor: isPastCurrent ? grey : green,
      status: null,
    };

    if (progressStep.title === stepConsideredCurrent.title) {
      const currentTime = moment();

      if (
        progressStep.startAt &&
        progressStep.endAt &&
        moment(progressStep.startAt) <= currentTime &&
        moment(progressStep.endAt) >= currentTime
      ) {
        // $FlowFixMe
        data.status = { name: 'En cours', color: 'warning' };
        data.roundColor = bootstrapToHex('warning');
        data.borderColor = grey;
      }

      if (!progressStep.endAt && moment(progressStep.startAt) <= currentTime) {
        // $FlowFixMe
        data.status = { name: 'Terminé', color: 'success' };
        data.roundColor = bootstrapToHex('success');
      }

      if (!progressStep.endAt && moment(progressStep.startAt) > currentTime) {
        // $FlowFixMe
        data.status = { name: 'A venir', color: 'info' };
        data.roundColor = bootstrapToHex('info');
      }

      if (progressStep.endAt && moment(progressStep.endAt) < currentTime) {
        // $FlowFixMe
        data.status = { name: 'Terminé', color: 'success' };
        data.roundColor = bootstrapToHex('success');
      }

      isPastCurrent = true;
    }

    steps.push({ ...progressStep, ...data });
  }

  return steps;
};

type Props = { proposal: ProposalDetailAdvancement_proposal, project: Object };

export class ProposalDetailAdvancement extends React.Component<Props> {
  getStatus = (step: Object) => {
    const { proposal } = this.props;
    return step.type === 'collect' ? proposal.status || null : this.getSelectionStatus(step);
  };

  getSelectionStatus = (step: Object) => {
    const { proposal } = this.props;
    for (const selection of proposal.selections) {
      if (step.id === selection.step.id) {
        return selection.status;
      }
    }
    return null;
  };

  render() {
    const { proposal, project } = this.props;
    const progressSteps = generateProgressStepsWithColorAndStatus(proposal.progressSteps);
    const steps = project.steps.sort((a, b) => a.position - b.position);
    const selections = proposal.selections;
    for (const step of steps) {
      step.isSelected =
        step.type === 'collect' || selections.map(selection => selection.step.id).includes(step.id);
    }
    let consideredCurrent = steps[0];
    for (const step of steps) {
      if (step.isSelected) {
        consideredCurrent = step;
      }
    }
    for (const step of steps) {
      step.isCurrent = step.id === consideredCurrent.id;
      step.isPast = step.position < consideredCurrent.position;
      step.isFuture = step.position > consideredCurrent.position;
    }
    const displayedSteps = steps.filter(step => step.isSelected || step.isFuture);
    return (
      <div style={{ marginLeft: '10px', marginTop: '-15px' }}>
        <h4>
          <FormattedMessage id="proposal.detail.advancement" />
        </h4>
        <br />
        {displayedSteps.map((step, index) => {
          let roundColor = grey;
          if (step.isCurrent) {
            const status = this.getStatus(step);
            roundColor = status ? bootstrapToHex(status.color) : green;
          } else if (step.isPast) {
            roundColor = green;
          }
          return (
            <ProposalDetailAdvancementStep
              key={index}
              step={{
                title: step.title,
                startAt: step.startAt,
                endAt: step.endAt,
                progressStep: false,
                timeless: step.timeless,
              }}
              status={step.isCurrent ? this.getStatus(step) : null}
              roundColor={roundColor}
              borderColor={
                index + 1 === displayedSteps.length
                  ? null
                  : displayedSteps[index + 1].isCurrent || displayedSteps[index + 1].isPast
                    ? green
                    : grey
              }
              children={
                step.isCurrent &&
                step.showProgressSteps && (
                  <div style={{ marginLeft: 30 }}>
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
                        borderColor={
                          i + 1 === progressSteps.length ? null : progressStep.borderColor
                        }
                      />
                    ))}
                  </div>
                )
              }
            />
          );
        })}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  project: state.project.projectsById[state.project.currentProjectById],
});

const container = connect(mapStateToProps)(ProposalDetailAdvancement);

export default createFragmentContainer(container, {
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
          position
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
});

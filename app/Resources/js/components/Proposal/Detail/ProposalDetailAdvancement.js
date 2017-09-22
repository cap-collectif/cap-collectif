import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { connect } from 'react-redux';
import ProposalDetailAdvancementStep from './ProposalDetailAdvancementStep';
import { bootstrapToHex } from '../../../utils/bootstrapToHexColor';

const grey = '#d9d9d9';
const green = '#5cb85c';

const consideredCurrentProgressStep = progressSteps => {
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
    if (
      step.endAt &&
      moment(step.startAt) < moment() &&
      moment(step.endAt) > moment()
    ) {
      return step;
    }
    if (lastStarting && lastStarting.title === step.title) {
      isPastLastStarting = true;
    }
  }
  return progressSteps[progressSteps.length - 1];
};
const generateProgressStepsWithColorAndStatus = progressSteps => {
  if (progressSteps.length < 1) {
    return [];
  }
  const stepConsideredCurrent = consideredCurrentProgressStep(progressSteps);

  const steps = [];
  let isPastCurrent = false;
  for (const progressStep of progressSteps) {
    const props = {
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
        props.status = { name: 'En cours', color: 'warning' };
        props.roundColor = bootstrapToHex('warning');
        props.borderColor = grey;
      }

      if (!progressStep.endAt && moment(progressStep.startAt) <= currentTime) {
        props.status = { name: 'Terminé', color: 'success' };
        props.roundColor = bootstrapToHex('success');
      }

      if (!progressStep.endAt && moment(progressStep.startAt) > currentTime) {
        props.status = { name: 'A venir', color: 'info' };
        props.roundColor = bootstrapToHex('info');
      }

      if (progressStep.endAt && moment(progressStep.endAt) < currentTime) {
        props.status = { name: 'Terminé', color: 'success' };
        props.roundColor = bootstrapToHex('success');
      }

      isPastCurrent = true;
    }

    steps.push({ ...progressStep, ...props });
  }

  return steps;
};

export const ProposalDetailAdvancement = React.createClass({
  displayName: 'ProposalDetailAdvancement',

  propTypes: {
    proposal: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
  },

  getStatus(step) {
    const { proposal } = this.props;
    return step.type === 'collect'
      ? proposal.status || null
      : this.getSelectionStatus(step);
  },

  getSelectionStatus(step) {
    const { proposal } = this.props;
    for (const selection of proposal.selections) {
      if (step.id === selection.step.id) {
        return selection.status;
      }
    }
    return null;
  },

  render() {
    const { proposal, project } = this.props;
    const progressSteps = generateProgressStepsWithColorAndStatus(
      proposal.progressSteps,
    );
    const steps = project.steps.sort((a, b) => a.position - b.position);
    const selections = proposal.selections.sort(
      (a, b) => a.step.position - b.step.position,
    );
    for (const step of steps) {
      step.isSelected =
        step.type === 'collect' ||
        selections.map(selection => selection.step.id).includes(step.id);
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
    const displayedSteps = steps.filter(
      step => step.isSelected || step.isFuture,
    );
    return (
      <div style={{ marginLeft: '10px', marginTop: '-15px' }}>
        <h4>
          {<FormattedMessage id="proposal.detail.advancement" />}
        </h4>
        <br />
        {displayedSteps.map((step, index) => {
          let roundColor = grey;
          if (step.isCurrent) {
            roundColor = this.getStatus(step)
              ? bootstrapToHex(this.getStatus(step).color)
              : green;
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
                  : displayedSteps[index + 1].isCurrent ||
                    displayedSteps[index + 1].isPast
                    ? green
                    : grey
              }
              children={
                step.isCurrent &&
                step.showProgressSteps &&
                <div style={{ marginLeft: 30 }}>
                  {progressSteps.map((progressStep, i) =>
                    <ProposalDetailAdvancementStep
                      key={i}
                      step={{
                        title: progressStep.title,
                        startAt: moment(progressStep.startAt).format('ll'),
                        endAt: progressStep.endAt
                          ? moment(progressStep.endAt).format('ll')
                          : null,
                        progressStep: true,
                      }}
                      status={progressStep.status}
                      roundColor={progressStep.roundColor}
                      borderColor={
                        i + 1 === progressSteps.length
                          ? null
                          : progressStep.borderColor
                      }
                    />,
                  )}
                </div>
              }
            />
          );
        })}
      </div>
    );
  },
});

const mapStateToProps = state => {
  return {
    project: state.project.projectsById[state.project.currentProjectById],
  };
};

export default connect(mapStateToProps)(ProposalDetailAdvancement);

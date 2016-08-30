import React, { PropTypes } from 'react';
import { IntlMixin, FormattedDate } from 'react-intl';
import ProposalDetailAdvancementStep from './ProposalDetailAdvancementStep';
import { connect } from 'react-redux';
import { bootstrapToHex } from '../../../utils/bootstrapToHexColor';
import moment from 'moment';

export const ProposalDetailAdvancement = React.createClass({
  displayName: 'ProposalDetailAdvancement',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getStatus(step) {
    const { proposal } = this.props;
    return step.type === 'collect'
      ? proposal.status || null
      : this.getSelectionStatus(step)
    ;
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
    const steps = project.steps.sort((a, b) => a.position - b.position);
    const selections = proposal.selections.sort((a, b) => a.step.position - b.step.position);
    for (const step of steps) {
      step.isSelected = step.type === 'collect' || selections.map((selection) => selection.step.id).includes(step.id);
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
        <h4>{this.getIntlMessage('proposal.detail.advancement')}</h4>
        <br />
        {
          displayedSteps.map((step, index) => {
            let roundColor = '#d9d9d9';
            if (step.isCurrent) {
              roundColor = this.getStatus(step) ? bootstrapToHex(this.getStatus(step).color) : '#5cb85c';
            } else if (step.isPast) {
              roundColor = '#5cb85c';
            }
            return (
              <ProposalDetailAdvancementStep
                key={index}
                step={{ title: step.title, startAt: step.startAt, endAt: step.endAt }}
                status={step.isCurrent ? this.getStatus(step) : null}
                roundColor={roundColor}
                borderColor={index + 1 === displayedSteps.length ? null : (displayedSteps[index + 1].isCurrent || displayedSteps[index + 1].isPast ? '#5cb85c' : '#d9d9d9')}
                children={
                  step.type === 'realisation' &&
                    <div style={{ marginLeft: 30 }}>
                      {
                        proposal.progressSteps.map((progressStep, i) =>
                          <ProposalDetailAdvancementStep
                            key={i}
                            step={{
                              title: progressStep.title,
                              startAt: <FormattedDate value={moment(progressStep.startAt)} day="numeric" month="long" year="numeric" />,
                              endAt: progressStep.endAt ? <FormattedDate value={moment(progressStep.endAt)} day="numeric" month="long" year="numeric" /> : null,
                            }}
                            status={null}
                            roundColor={'#d9d9d9'}
                            borderColor={i + 1 === proposal.progressSteps.length ? null : '#d9d9d9'}
                          />
                        )
                      }
                    </div>
                }
              />
            );
          })
        }
      </div>
    );
  },
});

const mapStateToProps = (state) => {
  return {
    project: state.project.projects[state.project.currentProjectById],
  };
};

export default connect(mapStateToProps)(ProposalDetailAdvancement);

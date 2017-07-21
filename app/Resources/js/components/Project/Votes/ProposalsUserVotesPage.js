// @flow
import React, { PropTypes } from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';

const ProposalsUserVotesPage = React.createClass({
  propTypes: {
    userVotesByStepId: PropTypes.object.isRequired,
    votableSteps: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { votableSteps, userVotesByStepId } = this.props;

    return (
      <div>
        <div className="container container--custom text-center">
          <h1 style={{ marginBottom: '0' }}>{this.getIntlMessage('project.votes.title')}</h1>
        </div>
        <div className="container container--custom">
          {
            votableSteps.length > 0
            ? votableSteps.map((step, index) => (
              <div key={index} className="block">
                {
                  votableSteps.length > 1
                    ? <h2>
                      <a className="pull-left btn btn-default" href={step._links.show} style={{ marginRight: '15px' }}>
                        <i className="cap cap-arrow-1-1"></i>
                        <span> {this.getIntlMessage('project.votes.back')}</span>
                      </a>
                      {`${step.title} `}
                      {
                        step.voteType === VOTE_TYPE_BUDGET
                        ? this.getIntlMessage('project.votes.type.budget')
                        : this.getIntlMessage('project.votes.type.simple')
                      }
                    </h2>
                  : <p>
                    <a className="btn btn-default" href={step._links.show}>
                      <i className="cap cap-arrow-1-1"></i>
                      <span> {this.getIntlMessage('project.votes.back')}</span>
                    </a>
                  </p>
                }
                {
                  step.votesHelpText &&
                    <div>
                      <FormattedHTMLMessage message={step.votesHelpText} />
                    </div>
                }
                <h3>
                  <FormattedMessage
                    num={userVotesByStepId[step.id].length}
                    message={this.getIntlMessage('project.votes.nb')}
                  />
                </h3>
                <Row className="proposals-user-votes__table">
                  {
                    userVotesByStepId[step.id].map((proposal, index2) =>
                      <ProposalUserVoteItem
                        key={index2}
                        proposal={proposal}
                        step={step}
                      />,
                    )
                  }
                </Row>
              </div>
            ))
            : <p>{this.getIntlMessage('project.votes.no_active_step')}</p>
          }
        </div>
      </div>
    );
  },

});

const mapStateToProps = (state, props) => {
  const currentUserVotesByStepId = state.proposal.userVotesByStepId;
  const userVotesByStepId = {};
  for (const stepId in props.userVotesByStepId) {
    if (stepId && Object.prototype.hasOwnProperty.call(props.userVotesByStepId, stepId)) {
      userVotesByStepId[stepId] = [];
      for (const voteId of currentUserVotesByStepId[stepId]) {
        const vote = props.userVotesByStepId[stepId].find(v => v.id === voteId);
        userVotesByStepId[stepId].push(vote);
      }
    }
  }
  return {
    votableSteps: state.project.projectsById[state.project.currentProjectById].steps.filter(step => step.votable),
    currentUserVotesByStepId: undefined,
    userVotesByStepId,
  };
};

export default connect(mapStateToProps)(ProposalsUserVotesPage);

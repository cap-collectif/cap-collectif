import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';

const ProposalsUserVotesPage = React.createClass({
  propTypes: {
    userVotesByStepId: PropTypes.object.isRequired,
    votableSteps: PropTypes.array.isRequired,
    currentUserVotesByStepId: PropTypes.array.isRequired,
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
              ? votableSteps.map((step, index) => {
                return (
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
                    <Table responsive hover className="proposals-user-votes__table">
                      <tbody>
                      {
                        userVotesByStepId[step.id].map((proposal, index2) =>
                          <ProposalUserVoteItem
                            key={index2}
                            proposal={proposal}
                            step={step}
                          />,
                        )
                      }
                      </tbody>
                    </Table>
                  </div>
                );
              })
              : <p>{this.getIntlMessage('project.votes.no_active_step')}</p>
          }
        </div>
      </div>
    );
  },

});

const mapStateToProps = (state, props) => {
  // transform state.userVotesByStepId into a real array with the same keys
  const votes = [];
  const currentUserVotesByStepId = state.proposal.userVotesByStepId;
  for (const i in currentUserVotesByStepId) {
    if (Object.prototype.hasOwnProperty.call(currentUserVotesByStepId, i)) {
      votes[i] = currentUserVotesByStepId[i];
    }
  }

  // we take userVotesByStepId props from serialized data and we transform it into a real array (copy of state)
  let items = [];
  for (const i in props.userVotesByStepId) {
    if (Object.prototype.hasOwnProperty.call(props.userVotesByStepId, i)) {
      items[i] = props.userVotesByStepId[i];
    }
  }

  // we filter thought the copy to sync array at deeper level (all votes of a proposal should be synced)
  items = items.map((item, key) => {
    if (votes[key].length > 0) {
      return item.map((it, index) => votes[key][index] === it.id ? it : null)
        .filter(it => it !== null);
    }
    return [];
  });

  return {
    votableSteps: state.project.projects[state.project.currentProjectById].steps.filter(step => step.votable),
    currentUserVotesByStepId: state.proposal.userVotesByStepId,
    userVotesByStepId: items || [],
  };
};

export default connect(mapStateToProps)(ProposalsUserVotesPage);

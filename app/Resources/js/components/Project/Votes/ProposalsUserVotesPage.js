import React, { PropTypes } from 'react';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import { Table } from 'react-bootstrap';
import { IntlMixin, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { connect } from 'react-redux';

const ProposalsUserVotesPage = React.createClass({
  propTypes: {
    userVotesCountByStepId: PropTypes.object.isRequired,
    votableSteps: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { votableSteps, userVotesCountByStepId } = this.props;
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
                        num={userVotesCountByStepId[step.id]}
                        message={this.getIntlMessage('project.votes.nb')}
                      />
                    </h3>
                    <Table responsive hover className="proposals-user-votes__table">
                      <tbody>
                      {
                        step.userVotes.map((vote, index2) => {
                          return <ProposalUserVoteItem key={index2} vote={vote} step={step} />;
                        })
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

const mapStateToProps = (state) => {
  return {
    userVotesCountByStepId: state.proposal.userVotesCountByStepId,
  };
};

export default connect(mapStateToProps)(ProposalsUserVotesPage);

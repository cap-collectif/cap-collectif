import React from 'react';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteStore from '../../../stores/ProposalVoteStore';
import MessageStore from '../../../stores/MessageStore';
import FlashMessages from '../../Utils/FlashMessages';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import {Table} from 'react-bootstrap';
import {IntlMixin, FormattedMessage} from 'react-intl';
import {VOTE_TYPE_BUDGET} from '../../../constants/ProposalConstants';

const ProposalsUserVotesPage = React.createClass({
  propTypes: {
    projectId: React.PropTypes.number.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    votableSteps: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    ProposalActions.initVotableSteps(this.props.votableSteps);
    return {
      messages: {
        'errors': [],
        'success': [],
      },
      votableSteps: ProposalVoteStore.votableSteps,
    };
  },

  componentWillMount() {
    ProposalVoteStore.addChangeListener(this.onVotesChange);
    MessageStore.addChangeListener(this.onMessageChange);
  },

  componentWillUnmount() {
    ProposalVoteStore.removeChangeListener(this.onVotesChange);
    MessageStore.removeChangeListener(this.onMessageChange);
  },

  onMessageChange() {
    this.setState({
      messages: MessageStore.messages,
    });
  },

  onVotesChange() {
    if (ProposalVoteStore.isVotableStepsSync) {
      this.setState({
        votableSteps: ProposalVoteStore.votableSteps,
      });
      return;
    }
    ProposalActions.loadVotableSteps(this.props.projectId);
  },

  render() {
    return (
      <div>
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} style={{marginBottom: 0}} />
        <div className="container container--custom text-center">
          <h1 style={{marginBottom: '0'}}>{this.getIntlMessage('project.votes.title')}</h1>
        </div>
        <div className="container container--custom">
          {
            this.state.votableSteps.length > 0
              ? this.state.votableSteps.map((step, index) => {
                return (
                  <div key={index} className="block">
                    <h2>
                      {step.title + ' '}
                      {
                        step.voteType === VOTE_TYPE_BUDGET
                        ? this.getIntlMessage('project.votes.type.budget')
                        : this.getIntlMessage('project.votes.type.simple')
                      }
                    </h2>
                    {
                      step.votesHelpText
                      ? <p>{step.votesHelpText}</p>
                      : null
                    }
                    <h3>
                      <FormattedMessage
                        num={step.userVotesCount}
                        message={this.getIntlMessage('project.votes.nb')}
                      />
                    </h3>
                    <Table responsive hover className="proposals-user-votes__table">
                      <tbody>
                      {
                        step.userVotes.map((vote, index2) => {
                          return <ProposalUserVoteItem key={index2} vote={vote} step={step}/>;
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

export default ProposalsUserVotesPage;

import React from 'react';
import { IntlMixin, FormattedNumber } from 'react-intl';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import { Nav, Navbar, Button, ProgressBar } from 'react-bootstrap';
import ArrayHelper from '../../../services/ArrayHelper';
import Input from '../../Form/Input';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import ProposalVoteStore from '../../../stores/ProposalVoteStore';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVotesHelper from '../../../services/ProposalVotesHelper';

const ProposalVoteBasketWidget = React.createClass({
  propTypes: {
    projectId: React.PropTypes.number.isRequired,
    votableSteps: React.PropTypes.array.isRequired,
    votesPageUrl: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin],

  getInitialState() {
    return {
      selectedStepId: this.props.votableSteps[0].id,
      votableSteps: this.props.votableSteps,
    };
  },

  componentWillMount() {
    ProposalVoteStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    ProposalActions.initVotableSteps(this.props.votableSteps);
  },

  componentWillUnmount() {
    ProposalVoteStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (ProposalVoteStore.isVotableStepsSync) {
      this.setState({
        votableSteps: ProposalVoteStore.votableSteps,
      });
      return;
    }
    ProposalActions.loadVotableSteps(this.props.projectId);
  },

  render() {
    const selectedStep = ArrayHelper.getElementFromArray(
      this.state.votableSteps,
      parseInt(this.state.selectedStepId, 10)
    );
    const budget = selectedStep.budget || 0;
    const creditsLeft = selectedStep.creditsLeft || 0;
    const creditsSpent = budget - creditsLeft;
    const percentage = ProposalVotesHelper.getSpentPercentage(
      budget,
      creditsSpent
    );
    return (
      <Navbar fixedTop className="proposal-vote__widget hidden-xs">
        <Nav>
          <li className="navbar-text widget__counter">
            <p className="widget__counter__label">
              {this.getIntlMessage('project.votes.widget.step')}
            </p>
            <span className="widget__counter__value">
              {
                this.state.votableSteps.length > 1
                ? <Input
                  id="votes_widget_step"
                  type="select"
                  className="widget__counter__select"
                  valueLink={this.linkState('selectedStepId')}
                  label={false}
                >
                  {
                    this.state.votableSteps.map((step) => {
                      return (
                        <option key={step.id} value={step.id}>
                          {step.title}
                        </option>
                      );
                    })
                  }
                </Input>
                : selectedStep.title
              }
            </span>
          </li>
          <li className="navbar-text widget__counter">
            <p className="widget__counter__label">
              {this.getIntlMessage('project.votes.widget.count')}
            </p>
            <span className="widget__counter__value">
              {selectedStep.userVotesCount}
            </span>
          </li>
        </Nav>
        {
          selectedStep.voteType === VOTE_TYPE_BUDGET
            ? <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {this.getIntlMessage('project.votes.widget.budget')}
                </p>
                <span className="widget__counter__value">
                  {
                    budget
                      ? <FormattedNumber value={budget} style="currency" currency="EUR"/>
                      : this.getIntlMessage('project.votes.widget.no_value')
                  }
                </span>
              </li>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {this.getIntlMessage('project.votes.widget.left')}
                </p>
                <span className="widget__counter__value">
                  <FormattedNumber value={creditsLeft} style="currency" currency="EUR"/>
                </span>
              </li>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {this.getIntlMessage('project.votes.widget.spent')}
                </p>
                <span className="widget__counter__value">
                  <FormattedNumber value={creditsSpent} style="currency" currency="EUR"/>
                </span>
              </li>
          </Nav>
          : null
        }
        <Button
          bsStyle="default"
          className="btn--outline btn-light-gray navbar-btn pull-right"
          href={this.props.votesPageUrl}
        >
          {this.getIntlMessage('proposal.details') }
        </Button>
        {
          selectedStep.voteType === VOTE_TYPE_BUDGET
            ? <Nav pullRight>
              <li className="navbar-text widget__progress-bar">
                <ProgressBar bsStyle="success" now={percentage} label="%(percent)s%"/>
              </li>
            </Nav>
            : null
        }
      </Navbar>
    );
  },

});

export default ProposalVoteBasketWidget;

import React, { PropTypes } from 'react';
import { IntlMixin, FormattedNumber, FormattedMessage } from 'react-intl';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import { Nav, Navbar, Button, ProgressBar } from 'react-bootstrap';
import Input from '../../Form/Input';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import ProposalVotesHelper from '../../../services/ProposalVotesHelper';
import { connect } from 'react-redux';

const ProposalVoteBasketWidget = React.createClass({
  propTypes: {
    projectId: PropTypes.number.isRequired,
    votableSteps: PropTypes.array.isRequired,
    votesPageUrl: PropTypes.string.isRequired,
    image: PropTypes.object,
  },
  mixins: [IntlMixin, DeepLinkStateMixin],

  getDefaultProps() {
    return {
      image: null,
    };
  },

  getInitialState() {
    return {
      selectedStepId: this.props.votableSteps[0].id,
    };
  },

  render() {
    const {
      image,
      votesPageUrl,
      votableSteps,
    } = this.props;
    const selectedStep = votableSteps.filter(step => step.id === parseInt(this.state.selectedStepId, 10))[0];
    const budget = selectedStep.budget || 0;
    const creditsLeft = selectedStep.creditsLeft || 0;
    const creditsSpent = budget - creditsLeft;
    const percentage = ProposalVotesHelper.getSpentPercentage(
      budget,
      creditsSpent
    );
    return (
      <Navbar fixedTop className="proposal-vote__widget">
        {
          image &&
           <Navbar.Header>
            <Navbar.Brand>
              <img className="widget__image" role="presentation" src={image.url} />
            </Navbar.Brand>
            <Navbar.Toggle>
              <i
                style={{ fontSize: '24px' }}
                className="cap cap-information-1"
              >
              </i>
            </Navbar.Toggle>
            <li className="navbar-text widget__progress-bar hidden visible-xs">
              <ProgressBar bsStyle="success" now={percentage} label="%(percent)s%" />
            </li>
          </Navbar.Header>
        }
        <Navbar.Collapse>
          <Nav>
            {
              votableSteps.length > 1 &&
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {this.getIntlMessage('project.votes.widget.step')}
                  </p>
                  <span className="widget__counter__value">
                    <Input
                      id="votes_widget_step"
                      type="select"
                      className="widget__counter__select"
                      valueLink={this.linkState('selectedStepId')}
                      label={false}
                    >
                      {
                        votableSteps.map(step =>
                            <option key={step.id} value={step.id}>
                              {step.title}
                            </option>
                        )
                      }
                    </Input>
                  </span>
              </li>
            }
            <li className="navbar-text widget__counter">
              <p className="widget__counter__label">
                {this.getIntlMessage('project.votes.widget.selection')}
              </p>
              <span className="widget__counter__value">
                <FormattedMessage
                  message={this.getIntlMessage('project.votes.widget.count')}
                  num={selectedStep.userVotesCount}
                />
              </span>
            </li>
          </Nav>
          {
            selectedStep.voteType === VOTE_TYPE_BUDGET &&
              <Nav>
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {this.getIntlMessage('project.votes.widget.budget')}
                  </p>
                  <span className="widget__counter__value">
                    {
                      budget
                        ? <FormattedNumber
                            minimumFractionDigits={0}
                            value={budget}
                            style="currency"
                            currency="EUR"
                        />
                        : this.getIntlMessage('project.votes.widget.no_value')
                    }
                  </span>
                </li>
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {this.getIntlMessage('project.votes.widget.spent')}
                  </p>
                    <span className="widget__counter__value">
                      <FormattedNumber
                        minimumFractionDigits={0}
                        value={creditsSpent}
                        style="currency"
                        currency="EUR"
                      />
                    </span>
                </li>
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {this.getIntlMessage('project.votes.widget.left')}
                  </p>
                  <span className="widget__counter__value">
                    <FormattedNumber
                      minimumFractionDigits={0}
                      value={creditsLeft}
                      style="currency"
                      currency="EUR"
                    />
                  </span>
                </li>
            </Nav>
          }
          <Button
            bsStyle="default"
            className="widget__button navbar-btn pull-right"
            href={votesPageUrl}
          >
            {this.getIntlMessage('proposal.details') }
          </Button>
          {
            selectedStep.voteType === VOTE_TYPE_BUDGET &&
              <Nav pullRight className="widget__progress-bar-nav hidden-xs">
                <li className="navbar-text widget__progress-bar">
                  <ProgressBar bsStyle="success" now={percentage} label="%(percent)s%" />
                </li>
              </Nav>
          }
        </Navbar.Collapse>
      </Navbar>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    votableSteps: state.project.projects[state.project.currentProjectById].steps.filter(step => step.votable),
  };
};
export default connect(mapStateToProps)(ProposalVoteBasketWidget);

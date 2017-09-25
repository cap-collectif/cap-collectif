import React, { PropTypes } from 'react';
import { FormattedNumber, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { mapValues } from 'lodash';
import { Nav, Navbar, Button, ProgressBar } from 'react-bootstrap';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import Input from '../../Form/Input';
import { VOTE_TYPE_BUDGET, VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import { getSpentPercentage } from '../../../services/ProposalVotesHelper';

export const ProposalVoteBasketWidget = React.createClass({
  propTypes: {
    projectId: PropTypes.string.isRequired,
    votableSteps: PropTypes.array.isRequired,
    votesPageUrl: PropTypes.string.isRequired,
    userVotesCountByStepId: PropTypes.object.isRequired,
    creditsLeftByStepId: PropTypes.object.isRequired,
    image: PropTypes.string,
  },

  mixins: [DeepLinkStateMixin],

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
      userVotesCountByStepId,
      creditsLeftByStepId,
    } = this.props;
    const selectedStep = votableSteps.filter(step => step.id === this.state.selectedStepId)[0];
    const budget = selectedStep.budget;
    const creditsLeft = creditsLeftByStepId[selectedStep.id];
    const creditsSpent = budget - creditsLeft;
    const showProgressBar =
      (selectedStep.voteType === VOTE_TYPE_SIMPLE && selectedStep.votesLimit) ||
      selectedStep.voteType === VOTE_TYPE_BUDGET;
    let percentage;
    if (selectedStep.voteType === VOTE_TYPE_BUDGET) {
      percentage = getSpentPercentage(budget, creditsSpent);
    } else {
      percentage = getSpentPercentage(
        selectedStep.votesLimit,
        userVotesCountByStepId[selectedStep.id],
      );
    }
    return (
      <Navbar fixedTop className="proposal-vote__widget">
        {image && (
          <Navbar.Header>
            <Navbar.Brand>
              <img className="widget__image" alt="" src={image} />
            </Navbar.Brand>
            <Navbar.Toggle>
              <i style={{ fontSize: '24px' }} className="cap cap-information-1" />
            </Navbar.Toggle>
            {showProgressBar && (
              <li className="navbar-text widget__progress-bar hidden visible-xs">
                <ProgressBar bsStyle="success" now={percentage} label={`${percentage}%`} />
              </li>
            )}
          </Navbar.Header>
        )}
        <Navbar.Collapse>
          <Nav>
            {votableSteps.length > 1 && (
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.step" />}
                </p>
                <span className="widget__counter__value">
                  <Input
                    id="votes_widget_step"
                    type="select"
                    className="widget__counter__select"
                    valueLink={this.linkState('selectedStepId')}
                    label={false}>
                    {votableSteps.map(step => (
                      <option key={step.id} value={step.id}>
                        {step.title}
                      </option>
                    ))}
                  </Input>
                </span>
              </li>
            )}
          </Nav>
          {selectedStep.voteType === VOTE_TYPE_SIMPLE &&
          selectedStep.votesLimit && (
            <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes" />}
                </p>
                <span className="widget__counter__value">{selectedStep.votesLimit}</span>
              </li>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes_left" />}
                </p>
                <span className="widget__counter__value">
                  {selectedStep.votesLimit - userVotesCountByStepId[selectedStep.id]}
                </span>
              </li>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes_spent" />}
                </p>
                <span className="widget__counter__value">
                  {userVotesCountByStepId[selectedStep.id]}
                </span>
              </li>
            </Nav>
          )}
          {selectedStep.voteType === VOTE_TYPE_BUDGET && (
            <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.budget" />}
                </p>
                <span className="widget__counter__value">
                  {budget ? (
                    <FormattedNumber
                      minimumFractionDigits={0}
                      value={budget}
                      style="currency"
                      currency="EUR"
                    />
                  ) : (
                    <FormattedMessage id="project.votes.widget.no_value" />
                  )}
                </span>
              </li>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.spent" />}
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
                  {<FormattedMessage id="project.votes.widget.left" />}
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
              {selectedStep.votesLimit && (
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {<FormattedMessage id="project.votes.widget.votes_left_budget" />}
                  </p>
                  <span className="widget__counter__value">
                    {selectedStep.votesLimit - userVotesCountByStepId[selectedStep.id]}
                  </span>
                </li>
              )}
            </Nav>
          )}
          {selectedStep.voteType === VOTE_TYPE_SIMPLE &&
          !selectedStep.votesLimit && (
            <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes" />}
                </p>
                <span className="widget__counter__value">
                  {userVotesCountByStepId[selectedStep.id]}
                </span>
              </li>
            </Nav>
          )}
          <Button
            bsStyle="default"
            className="widget__button navbar-btn pull-right"
            href={votesPageUrl}>
            {<FormattedMessage id="proposal.details" />}
          </Button>
          {showProgressBar && (
            <Nav pullRight className="widget__progress-bar-nav hidden-xs">
              <li className="navbar-text widget__progress-bar">
                <ProgressBar bsStyle="success" now={percentage} label={`${percentage}%`} />
              </li>
            </Nav>
          )}
        </Navbar.Collapse>
      </Navbar>
    );
  },
});

const mapStateToProps = state => {
  return {
    userVotesCountByStepId: mapValues(state.proposal.userVotesByStepId, votes => votes.length),
    creditsLeftByStepId: state.proposal.creditsLeftByStepId,
    votableSteps: state.project.projectsById[state.project.currentProjectById].steps.filter(
      step => step.votable,
    ),
    projectId: state.project.currentProjectById,
  };
};
export default connect(mapStateToProps)(ProposalVoteBasketWidget);

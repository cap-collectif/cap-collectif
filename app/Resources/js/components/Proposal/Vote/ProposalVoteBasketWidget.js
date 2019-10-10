// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedNumber, FormattedMessage } from 'react-intl';
import { Nav, Navbar, Button, ProgressBar } from 'react-bootstrap';
import type { ProposalVoteBasketWidget_step } from '~relay/ProposalVoteBasketWidget_step.graphql';
import type { ProposalVoteBasketWidget_viewer } from '~relay/ProposalVoteBasketWidget_viewer.graphql';
import { getSpentPercentage } from '../../../services/ProposalVotesHelper';

type Props = {
  step: ProposalVoteBasketWidget_step,
  viewer: ?ProposalVoteBasketWidget_viewer,
  votesPageUrl: string,
  image: ?string,
};

export class ProposalVoteBasketWidget extends React.Component<Props> {
  static defaultProps = {
    image: null,
  };

  render() {
    const { image, votesPageUrl, step, viewer } = this.props;

    const showProgressBar =
      (step.voteType === 'SIMPLE' && step.votesLimit) || step.voteType === 'BUDGET';

    let percentage = 0;

    const votesCount = viewer && viewer.proposalVotes ? viewer.proposalVotes.totalCount : 0;
    const creditsSpent = viewer && viewer.proposalVotes ? viewer.proposalVotes.creditsSpent : 0;
    const creditsLeft =
      viewer && viewer.proposalVotes ? viewer.proposalVotes.creditsLeft : step.budget;

    if (step.voteType === 'BUDGET') {
      percentage = getSpentPercentage(step.budget, creditsSpent);
    } else {
      percentage = getSpentPercentage(step.votesLimit, votesCount);
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
          {step.voteType === 'SIMPLE' && step.votesLimit && (
            <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes" />}
                </p>
                <span className="widget__counter__value">{step.votesLimit}</span>
              </li>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes_left" />}
                </p>
                <span className="widget__counter__value">{step.votesLimit - votesCount}</span>
              </li>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes_spent" />}
                </p>
                <span className="widget__counter__value">{votesCount}</span>
              </li>
            </Nav>
          )}
          {step.voteType === 'BUDGET' && (
            <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.budget" />}
                </p>
                <span className="widget__counter__value">
                  {step.budget ? (
                    <FormattedNumber
                      minimumFractionDigits={0}
                      value={step.budget}
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
                    value={creditsSpent || 0}
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
                    value={creditsLeft || 0}
                    style="currency"
                    currency="EUR"
                  />
                </span>
              </li>
              {step.votesLimit && (
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {<FormattedMessage id="project.votes.widget.votes_left_budget" />}
                  </p>
                  <span className="widget__counter__value">{step.votesLimit - votesCount}</span>
                </li>
              )}
            </Nav>
          )}
          {step.voteType === 'SIMPLE' && !step.votesLimit && (
            <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.votes" />}
                </p>
                <span className="widget__counter__value">{votesCount}</span>
              </li>
            </Nav>
          )}
          <Button
            bsStyle="default"
            className="widget__button navbar-btn pull-right"
            href={votesPageUrl}>
            <FormattedMessage id="proposal.details" />
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
  }
}

export default createFragmentContainer(ProposalVoteBasketWidget, {
  step: graphql`
    fragment ProposalVoteBasketWidget_step on ProposalStep {
      id
      title
      voteType
      votesLimit
      budget
    }
  `,
  viewer: graphql`
    fragment ProposalVoteBasketWidget_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
      id
      proposalVotes(stepId: $stepId) {
        totalCount
        creditsLeft
        creditsSpent
      }
    }
  `,
});

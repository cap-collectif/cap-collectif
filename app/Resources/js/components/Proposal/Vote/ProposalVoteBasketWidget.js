// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import { FormattedNumber, FormattedMessage } from 'react-intl';
import { Nav, Navbar, Button, ProgressBar } from 'react-bootstrap';
import Input from '../../Form/Input';
import type { ProposalVoteBasketWidget_project } from './__generated__/ProposalVoteBasketWidget_project.graphql';
import type { ProposalVoteBasketWidget_viewer } from './__generated__/ProposalVoteBasketWidget_viewer.graphql';
import { getSpentPercentage } from '../../../services/ProposalVotesHelper';

type Props = {
  project: ProposalVoteBasketWidget_project,
  viewer: ?ProposalVoteBasketWidget_viewer,
  votesPageUrl: string,
  image: string,
  relay: RelayRefetchProp,
};

type State = {
  selectedStepId: ?string,
};

export class ProposalVoteBasketWidget extends React.Component<Props, State> {
  static defaultProps = {
    image: null,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedStepId: props.project.votableSteps[0].id || null,
    };
    this._refetch();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.selectedStepId !== this.state.selectedStepId) {
      this._refetch();
    }
  }

  _refetch = () => {
    this.props.relay.refetch(
      { step: this.state.selectedStepId, withVotes: true },
      null, // We can use the refetchVariables as renderVariables
      () => {
        console.log('Refetch done');
      },
      { force: true },
    );
  };

  render() {
    const { image, votesPageUrl, project, viewer } = this.props;

    if (!this.state.selectedStepId) return;
    const selectedStep = project.votableSteps.filter(
      step => step.id === this.state.selectedStepId,
    )[0];
    const showProgressBar =
      (selectedStep.voteType === 'SIMPLE' && selectedStep.votesLimit) ||
      selectedStep.voteType === 'BUDGET';

    let percentage = 0;

    const votesCount = viewer && viewer.proposalVotes ? viewer.proposalVotes.totalCount : 0;
    const creditsSpent = viewer && viewer.proposalVotes ? viewer.proposalVotes.creditsSpent : 0;
    const creditsLeft =
      viewer && viewer.proposalVotes ? viewer.proposalVotes.creditsLeft : selectedStep.budget;

    if (selectedStep.voteType === 'BUDGET') {
      percentage = getSpentPercentage(selectedStep.budget, creditsSpent);
    } else {
      percentage = getSpentPercentage(selectedStep.votesLimit, votesCount);
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
            {project.votableSteps.length > 1 && (
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  <FormattedMessage id="project.votes.widget.step" />
                </p>
                <span className="widget__counter__value">
                  <Input
                    id="votes_widget_step"
                    type="select"
                    className="widget__counter__select"
                    onChange={(event: SyntheticInputEvent<>) => {
                      this.setState({
                        selectedStepId: event.target.value,
                      });
                    }}
                    label={false}>
                    {project.votableSteps.map(step => (
                      <option key={step.id} value={step.id}>
                        {step.title}
                      </option>
                    ))}
                  </Input>
                </span>
              </li>
            )}
          </Nav>
          {selectedStep.voteType === 'SIMPLE' &&
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
                    {selectedStep.votesLimit - votesCount}
                  </span>
                </li>
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {<FormattedMessage id="project.votes.widget.votes_spent" />}
                  </p>
                  <span className="widget__counter__value">{votesCount}</span>
                </li>
              </Nav>
            )}
          {selectedStep.voteType === 'BUDGET' && (
            <Nav>
              <li className="navbar-text widget__counter">
                <p className="widget__counter__label">
                  {<FormattedMessage id="project.votes.widget.budget" />}
                </p>
                <span className="widget__counter__value">
                  {selectedStep.budget ? (
                    <FormattedNumber
                      minimumFractionDigits={0}
                      value={selectedStep.budget}
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
              {selectedStep.votesLimit && (
                <li className="navbar-text widget__counter">
                  <p className="widget__counter__label">
                    {<FormattedMessage id="project.votes.widget.votes_left_budget" />}
                  </p>
                  <span className="widget__counter__value">
                    {selectedStep.votesLimit - votesCount}
                  </span>
                </li>
              )}
            </Nav>
          )}
          {selectedStep.voteType === 'SIMPLE' &&
            !selectedStep.votesLimit && (
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

export default createRefetchContainer(
  ProposalVoteBasketWidget,
  {
    project: graphql`
      fragment ProposalVoteBasketWidget_project on Project {
        id
        votableSteps {
          ... on CollectStep {
            id
            title
            voteType
            votesLimit
            budget
          }
          ... on SelectionStep {
            id
            title
            voteType
            votesLimit
            budget
          }
        }
      }
    `,
    viewer: graphql`
      fragment ProposalVoteBasketWidget_viewer on User
        @argumentDefinitions(
          stepId: { type: "ID", nonNull: false }
          withVotes: { type: "Boolean!", defaultValue: false }
        ) {
        id
        proposalVotes(stepId: $stepId) @include(if: $withVotes) {
          totalCount
          creditsLeft
          creditsSpent
        }
      }
    `,
  },
  graphql`
    query ProposalVoteBasketWidgetQuery($stepId: ID!, $withVotes: Boolean!) {
      viewer {
        ...ProposalVoteBasketWidget_viewer @arguments(stepId: $stepId, withVotes: $withVotes)
      }
    }
  `,
);

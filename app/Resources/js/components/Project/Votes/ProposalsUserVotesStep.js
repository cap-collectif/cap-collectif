// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { submit, isDirty, isSubmitting } from 'redux-form';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalsUserVotesTable from './ProposalsUserVotesTable';
import SubmitButton from '../../Form/SubmitButton';
import UpdateProposalVotesMutation from '../../../mutations/UpdateProposalVotesMutation';
import type { ProposalsUserVotesStep_step } from './__generated__/ProposalsUserVotesStep_step.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type RelayProps = {|
  step: ProposalsUserVotesStep_step,
|};
type Props = {|
  ...RelayProps,
  dispatch: Function,
  dirty: boolean,
  submitting: boolean,
  isAuthenticated: boolean,
|};

export class ProposalsUserVotesStep extends React.Component<Props> {
  onSubmit = (values: { votes: Array<{ public: boolean, id: string }> }) =>
    UpdateProposalVotesMutation.commit({
      input: {
        step: this.props.step.id,
        votes: values.votes.map(v => ({ id: v.id, anonymous: !v.public })),
        isAuthenticated: this.props.isAuthenticated,
      },
      isAuthenticated: this.props.isAuthenticated,
    });

  render() {
    const { step, dirty, submitting, dispatch } = this.props;
    const { votesRanking } = step;
    const keyTradProjectCount = step.form.isProposalForm ? 'project.votes.nb' : 'count-questions';

    if (!step.viewerVotes) {
      return null;
    }

    return (
      <div className="block">
        <h2>{step.title}</h2>
        <a className="btn btn-default" href={step.url}>
          <i className="cap cap-arrow-1-1" />
          <span>
            {' '}
            <FormattedMessage id="project.votes.back" />
          </span>
        </a>
        {step.votesHelpText && (
          <div className="well mb-0 mt-25">
            <p>
              <b>
                <FormattedMessage id="admin.fields.step.votesHelpText" />
              </b>
            </p>
            <WYSIWYGRender value={step.votesHelpText} />
          </div>
        )}
        <div>
          <h3 className="d-ib mr-10 mb-10">
            {votesRanking ? (
              <FormattedMessage id="modal-ranking" />
            ) : (
              <FormattedMessage id="vote-modal-title" />
            )}
          </h3>
          <h4 className="excerpt d-ib">
            <FormattedMessage
              id={keyTradProjectCount}
              values={{ num: step.viewerVotes.totalCount }}
            />
          </h4>
        </div>
        {step.viewerVotes.totalCount > 0 && (
          <div>
            <ProposalsUserVotesTable
              onSubmit={this.onSubmit}
              deletable
              step={step}
              votes={step.viewerVotes}
            />
            <SubmitButton
              id="confirm-update-votes"
              disabled={!dirty}
              onSubmit={() => {
                dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
              }}
              label="global.save_modifications"
              isSubmitting={submitting}
              bsStyle="success"
              className="mt-10"
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props: RelayProps) => ({
  dirty: isDirty(`proposal-user-vote-form-step-${props.step.id}`)(state),
  submitting: isSubmitting(`proposal-user-vote-form-step-${props.step.id}`)(state),
  isAuthenticated: !!state.user.user,
});
const container = connect(mapStateToProps)(ProposalsUserVotesStep);

export default createFragmentContainer(container, {
  step: graphql`
    fragment ProposalsUserVotesStep_step on ProposalStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean" }) {
      ...ProposalsUserVotesTable_step
      id
      title
      voteType
      votesHelpText
      open
      url
      votesRanking
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
        totalCount
        ...ProposalsUserVotesTable_votes
      }
      form {
        isProposalForm
      }
    }
  `,
});

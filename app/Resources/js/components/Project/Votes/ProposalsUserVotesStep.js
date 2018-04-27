// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { submit, isDirty, isSubmitting } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalsUserVotesTable from './ProposalsUserVotesTable';
import SubmitButton from '../../Form/SubmitButton';
import type { ProposalsUserVotesStep_step } from './__generated__/ProposalsUserVotesStep_step.graphql';

type RelayProps = {
  step: ProposalsUserVotesStep_step,
};
type Props = RelayProps & {
  dispatch: Function,
  dirty: boolean,
  submitting: boolean,
};

export class ProposalsUserVotesStep extends React.Component<Props> {
  render() {
    const { step, dirty, submitting, dispatch } = this.props;

    return (
      <div>
        <h2>
          <a
            className="pull-left btn btn-default"
            href={step.show_url}
            style={{ marginRight: '15px' }}>
            <i className="cap cap-arrow-1-1" />
            <span>
              {' '}
              <FormattedMessage id="project.votes.back" />
            </span>
          </a>
          {`${step.title} `}
          {step.voteType === 'BUDGET' ? (
            <FormattedMessage id="project.votes.type.budget" />
          ) : (
            <FormattedMessage id="project.votes.type.simple" />
          )}
        </h2>
        <p>
          <a className="btn btn-default" href={step.show_url}>
            <i className="cap cap-arrow-1-1" />
            <span>
              {' '}
              <FormattedMessage id="project.votes.back" />
            </span>
          </a>
        </p>
        <div className="well mb-0 mt-10">
          <p>
            <b>
              <FormattedMessage id="admin.fields.step.votesHelpText" />
            </b>
          </p>
          <p>
            <FormattedMessage id="modal-vote-ranking-explanations" />
          </p>
        </div>

        <h3 className="d-ib mr-10 mb-10">
          <FormattedMessage id="modal-ranking" />
        </h3>
        <h4 className="excerpt d-ib">
          <FormattedMessage
            id="project.votes.nb"
            values={{
              num: step.viewerVotes.totalCount,
            }}
          />
        </h4>
        <ProposalsUserVotesTable step={step} votes={step.viewerVotes} />
        <SubmitButton
          id="confirm-update-votes"
          disabled={!dirty}
          onSubmit={() => {
            dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
          }}
          label="global.save"
          isSubmitting={submitting}
          bsStyle="success"
        />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state, props: RelayProps) => ({
  dirty: isDirty(`proposal-user-vote-form-step-${props.step.id}`)(state),
  submitting: isSubmitting(`proposal-user-vote-form-step-${props.step.id}`)(state),
});
const container = connect(mapStateToProps)(ProposalsUserVotesStep);

export default createFragmentContainer(container, {
  step: graphql`
    fragment ProposalsUserVotesStep_step on ProposalStep {
      ...ProposalsUserVotesTable_step
      id
      title
      voteType
      votesHelpText
      open
      show_url
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
        totalCount
        ...ProposalsUserVotesTable_votes
      }
    }
  `,
});

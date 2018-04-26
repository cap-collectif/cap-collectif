// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { submit } from 'redux-form';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalsUserVotesTable from './ProposalsUserVotesTable';
import SubmitButton from '../../Form/SubmitButton';
import type { ProposalsUserVotesPage_project } from './__generated__/ProposalsUserVotesPage_project.graphql';

type Props = {
  project: ProposalsUserVotesPage_project,
  dispatch: Function,
};

class ProposalsUserVotesPage extends React.Component<Props> {
  render() {
    const { project, dispatch } = this.props;

    return (
      <div>
        <div className="container container--custom text-center">
          <h1 className="mb-0">
            <FormattedMessage id="project.votes.title" />
          </h1>
        </div>
        <div className="container container--custom">
          {project.votableSteps.length > 0 ? (
            project.votableSteps.filter(step => !!step.id).map((step, index) => (
              <div key={index} className="block">
                {project.votableSteps.length > 1 ? (
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
                ) : (
                  <p>
                    <a className="btn btn-default" href={step.show_url}>
                      <i className="cap cap-arrow-1-1" />
                      <span>
                        {' '}
                        <FormattedMessage id="project.votes.back" />
                      </span>
                    </a>
                  </p>
                )}
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
                  onSubmit={() => {
                    dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
                  }}
                  label="global.save"
                  isSubmitting={false}
                  bsStyle="success"
                />
              </div>
            ))
          ) : (
            <p>
              <FormattedMessage id="project.votes.no_active_step" />
            </p>
          )}
        </div>
      </div>
    );
  }
}

const container = connect()(ProposalsUserVotesPage);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProposalsUserVotesPage_project on Project {
      id
      votableSteps {
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
    }
  `,
});

// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import classNames from 'classnames';
import DraftProposalPreview from '../Preview/DraftProposalPreview';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import DraftBox from '../../Utils/DraftBox';
import Loader from '../../Utils/Loader';

type Props = {
  step: Object,
};

const renderDraftProposals = ({ error, props }: { error: ?Error, props: any }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }

  if (props) {
    const classes = classNames({
      'list-group': true,
      'mb-40': true,
    });
    // eslint-disable-next-line react/prop-types
    if (props.draftProposalsForUserInStep.length === 0) {
      return null;
    }

    return (
      <DraftBox>
        <ul className={classes}>
          {props.draftProposalsForUserInStep.map((
            // eslint-disable-line
            proposal,
            i,
          ) => <DraftProposalPreview key={`draft-proposal-${i}`} proposal={proposal} />)}
        </ul>
      </DraftBox>
    );
  }
  return <Loader />;
};

export default class DraftProposalList extends React.Component<Props> {
  render() {
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query DraftProposalListQuery($stepId: ID!) {
              draftProposalsForUserInStep(stepId: $stepId) {
                title
                show_url
              }
            }
          `}
          variables={{
            stepId: this.props.step.id,
          }}
          render={renderDraftProposals}
        />
      </div>
    );
  }
}

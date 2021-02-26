// @flow
import * as React from 'react';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProposalPreview from '../Proposal/Preview/ProposalPreview';
import type {
  LastProposalsQueryResponse,
  LastProposalsQueryVariables,
} from '~relay/LastProposalsQuery.graphql';
import type { State } from '~/types';

export type Props = {|
  +ids: $ReadOnlyArray<string>,
  +isTipsMeeeEnabled: boolean,
|};

export class LastProposals extends React.Component<Props> {
  render() {
    const { ids, isTipsMeeeEnabled } = this.props;
    return (
      <div className="container">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query LastProposalsQuery($ids: [ID!]!, $stepId: ID!, $isTipsMeeeEnabled: Boolean!) {
              proposals: nodes(ids: $ids) {
                ... on Proposal {
                  id
                  ...ProposalPreview_proposal
                    @arguments(
                      stepId: $stepId
                      isAuthenticated: false
                      isProfileView: true
                      isTipsMeeeEnabled: $isTipsMeeeEnabled
                    )
                }
              }
            }
          `}
          variables={
            ({
              ids,
              // TODO fixme https://github.com/cap-collectif/platform/issues/7016
              stepId: '',
              isTipsMeeeEnabled,
            }: LastProposalsQueryVariables)
          }
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?LastProposalsQueryResponse,
          }) => {
            if (error) {
              return graphqlError;
            }

            if (!props) {
              return <Loader />;
            }

            const { proposals } = props;
            return (
              <Row>
                <ul
                  className={classNames({
                    'media-list': true,
                    'proposal-preview-list': true,
                    opinion__list: true,
                  })}>
                  {proposals.filter(Boolean).map(proposal => (
                    <ProposalPreview
                      key={proposal.id}
                      proposal={proposal}
                      step={null}
                      viewer={null}
                    />
                  ))}
                </ul>
              </Row>
            );
          }}
        />
      </div>
    );
  }
}
const mapStateToProps = (state: State) => ({
  isTipsMeeeEnabled: state.default.features.unstable__tipsmeee,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(LastProposals);

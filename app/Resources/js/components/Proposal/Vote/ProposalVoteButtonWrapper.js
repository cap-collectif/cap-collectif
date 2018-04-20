// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import ProposalVoteButtonWrapperFragment from './ProposalVoteButtonWrapperFragment';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalVoteModal from './ProposalVoteModal';
import type { State } from '../../../types';
import type {
  ProposalVoteButtonWrapperQueryResponse,
  ProposalVoteButtonWrapperQueryVariables,
} from './__generated__/ProposalVoteButtonWrapperQuery.graphql';

type ParentProps = {
  proposal: Object,
};

type Props = ParentProps & {
  isAuthenticated: boolean,
  id: string,
  style: Object,
  className: string,
};

export class ProposalVoteButtonWrapper extends React.Component<Props> {
  static defaultProps = {
    id: undefined,
    style: {},
    className: '',
  };

  render() {
    const step = this.props.proposal.currentVotableStep;
    if (!step || !step.open) {
      return null;
    }
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProposalVoteButtonWrapperQuery(
            $proposal: ID!
            $stepId: ID!
            $isAuthenticated: Boolean!
          ) {
            proposal: node(id: $proposal) {
              ...ProposalVoteButtonWrapperFragment_proposal
                @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
              ...ProposalVoteModal_proposal
                @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
            }
            step: node(id: $stepId) {
              ...ProposalVoteButtonWrapperFragment_step
              ...ProposalVoteModal_step
            }
            viewer @include(if: $isAuthenticated) {
              ...ProposalVoteButtonWrapperFragment_viewer @arguments(stepId: $stepId)
            }
          }
        `}
        variables={
          ({
            proposal: this.props.proposal.id,
            stepId: step.id,
            isAuthenticated: this.props.isAuthenticated,
          }: ProposalVoteButtonWrapperQueryVariables)
        }
        render={({
          error,
          props,
        }: {
          error: ?Error,
          props?: ?ProposalVoteButtonWrapperQueryResponse,
        }) => {
          if (error) {
            console.warn(error); // eslint-disable-line no-console
            return graphqlError;
          }
          if (props) {
            // eslint-disable-next-line react/prop-types
            if (props.proposal && props.step) {
              return (
                <span>
                  {/* $FlowFixMe */}
                  <ProposalVoteButtonWrapperFragment
                    proposal={props.proposal}
                    step={props.step}
                    viewer={props.viewer || null}
                    className={this.props.className}
                    id={this.props.id}
                    style={this.props.style}
                  />
                  <ProposalVoteModal proposal={props.proposal} step={props.step} />
                </span>
              );
            }
            return graphqlError;
          }
          return null;
        }}
      />
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  isAuthenticated: state.user.user !== null,
});

export default connect(mapStateToProps)(ProposalVoteButtonWrapper);

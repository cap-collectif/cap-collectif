// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import ProposalVoteButtonWrapperFragment from './ProposalVoteButtonWrapperFragment';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/Loader';
import type { State } from '../../../types';
import type {
  ProposalVoteButtonWrapperQueryResponse,
  ProposalVoteButtonWrapperQueryVariables,
} from './__generated__/ProposalVoteButtonWrapperQuery.graphql';

type ParentProps = {
  proposal: { id: string },
};

type Props = ParentProps & {
  step: ?Object,
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
    const { step } = this.props;
    if (!step || !step.open) {
      return null;
    }
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProposalVoteButtonWrapperQuery(
            $proposal: ID!
            $step: ID!
            $isAuthenticated: Boolean!
          ) {
            proposal: node(id: $proposal) {
              ...ProposalVoteButtonWrapperFragment_proposal
                @arguments(step: $step, isAuthenticated: $isAuthenticated)
            }
            step: node(id: $step) {
              ...ProposalVoteButtonWrapperFragment_step
            }
            viewer @include(if: $isAuthenticated) {
              ...ProposalVoteButtonWrapperFragment_viewer @arguments(step: $step)
            }
          }
        `}
        variables={
          ({
            proposal: this.props.proposal.id,
            step: step.id,
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
                </span>
              );
            }
            return graphqlError;
          }
          return <Loader />;
        }}
      />
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: ParentProps) => {
  const step =
    state.project.currentProjectById && props.proposal.votableStepId
      ? state.project.projectsById[state.project.currentProjectById].stepsById[
          props.proposal.votableStepId
        ]
      : null;
  return {
    step,
    isAuthenticated: state.user.user !== null,
  };
};

export default connect(mapStateToProps)(ProposalVoteButtonWrapper);

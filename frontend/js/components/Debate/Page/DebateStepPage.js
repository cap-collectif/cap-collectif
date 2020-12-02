// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { State } from '~/types';
import type { DebateStepPageQueryResponse } from '~relay/DebateStepPageQuery.graphql';
import DebateStepPageLogic from './DebateStepPageLogic';

export type Props = {|
  stepId: string,
  title: string,
  isAuthenticated: boolean,
|};

export class DebateStepPage extends React.Component<Props> {
  render() {
    const { stepId, title, isAuthenticated } = this.props;
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query DebateStepPageQuery($stepId: ID!, $isAuthenticated: Boolean!) {
              ...DebateStepPageLogic_query
                @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
            }
          `}
          variables={{
            stepId,
            isAuthenticated,
          }}
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?DebateStepPageQueryResponse,
          }) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }
            return (
              <DebateStepPageLogic query={props} title={title} isAuthenticated={isAuthenticated} />
            );
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
});

export default connect(mapStateToProps)(DebateStepPage);

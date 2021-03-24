// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { State } from '~/types';
import type { DebateStepPageQueryResponse } from '~relay/DebateStepPageQuery.graphql';
import type { DebateType } from '~relay/DebateStepPageLogic_query.graphql';
import DebateStepPageLogic from './DebateStepPageLogic';
import { DebateStepPageContext } from './DebateStepPage.context';
import useIsMobile from '~/utils/hooks/useIsMobile';

export type Props = {|
  +stepId: string,
  +title: string,
  +isAuthenticated: boolean,
  +fromWidget: boolean,
  +widgetLocation: string,
  +debateType: DebateType,
|};

export const DebateStepPage = ({
  stepId,
  title,
  isAuthenticated,
  fromWidget,
  widgetLocation,
  debateType,
}: Props) => {
  const isMobile = useIsMobile();
  const contextValue = React.useMemo(
    () => ({
      widget: {
        isSource: fromWidget,
        location: widgetLocation,
      },
      stepClosed: true,
      title,
    }),
    [title, fromWidget, widgetLocation],
  );
  const isDebateFaceToFace = debateType === 'FACE_TO_FACE';

  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query DebateStepPageQuery(
          $stepId: ID!
          $isAuthenticated: Boolean!
          $isMobile: Boolean!
          $isDebateFaceToFace: Boolean!
        ) {
          ...DebateStepPageLogic_query
            @arguments(
              stepId: $stepId
              isAuthenticated: $isAuthenticated
              isMobile: $isMobile
              isDebateFaceToFace: $isDebateFaceToFace
            )
          step: node(id: $stepId) {
            ... on Step {
              timeRange {
                hasEnded
              }
            }
          }
        }
      `}
      variables={{
        stepId,
        isAuthenticated,
        isMobile,
        isDebateFaceToFace,
      }}
      render={({
        error,
        props,
      }: {
        ...ReactRelayReadyState,
        props: ?DebateStepPageQueryResponse,
      }) => {
        if (error) {
          console.error(error); // eslint-disable-line no-console
          return graphqlError;
        }

        contextValue.stepClosed =
          typeof props?.step?.timeRange?.hasEnded === 'boolean'
            ? props?.step?.timeRange?.hasEnded
            : true;

        return (
          <DebateStepPageContext.Provider value={contextValue}>
            <DebateStepPageLogic query={props} />
          </DebateStepPageContext.Provider>
        );
      }}
    />
  );
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(DebateStepPage);

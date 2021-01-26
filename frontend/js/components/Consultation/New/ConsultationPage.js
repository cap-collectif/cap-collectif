// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { State } from '~/types';
import ConsultationPageLogic from '~/components/Consultation/New/ConsultationPageLogic';
import type { ConsultationPageQueryResponse } from '~relay/ConsultationPageQuery.graphql';

export type Props = {|
  id: string,
  isAuthenticated: boolean,
  consultationSlug: string,
|};

export const ConsultationPage = ({ id: stepId, isAuthenticated, consultationSlug }: Props) => {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ConsultationPageQuery(
          $stepId: ID!
          $isAuthenticated: Boolean!
          $consultationSlug: String!
        ) {
          ...ConsultationPageLogic_query
            @arguments(
              stepId: $stepId
              isAuthenticated: $isAuthenticated
              consultationSlug: $consultationSlug
            )
        }
      `}
      variables={{
        stepId,
        isAuthenticated,
        consultationSlug,
      }}
      render={({
        error,
        props,
      }: {
        ...ReactRelayReadyState,
        props: ?ConsultationPageQueryResponse,
      }) => {
        if (error) {
          console.log(error); // eslint-disable-line no-console
          return graphqlError;
        }
        return <ConsultationPageLogic query={props} isAuthenticated={isAuthenticated} />;
      }}
    />
  );
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
});

export default connect(mapStateToProps)(ConsultationPage);

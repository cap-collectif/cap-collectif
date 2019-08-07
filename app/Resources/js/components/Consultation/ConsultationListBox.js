// @flow
import * as React from 'react';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import { graphql, QueryRenderer, type ReadyState } from 'react-relay';
import type { RelayGlobalId } from '../../types';
import type { ConsultationListBoxQueryResponse } from '~relay/ConsultationListBoxQuery.graphql';
import ConsultationListView from './ConsultationListView';

type Props = {|
  +id: RelayGlobalId
|}

const CONSULTATION_STEP_QUERY = graphql`
    query ConsultationListBoxQuery(
        $consultationStepId: ID!
    ) {
        step: node(id: $consultationStepId) {
            ... on ConsultationStep {
                consultations {
                    ...ConsultationListView_consultations
                }
            }
        }
    }
`;

const ConsultationStep = ({ error, props }: { ...ReadyState, props: ?ConsultationListBoxQueryResponse }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.step && props.step.consultations) {
      const { step: { consultations } } = props;
      return (
        // $FlowFixMe
        <ConsultationListView consultations={consultations}/>
      );
    }
    return graphqlError;
  }
  return <Loader/>;
};

const ConsultationListBox = (props: Props) => {
  const { id: consultationStepId } = props;
  return (
    <div className="row">
      <QueryRenderer
        environment={environment}
        query={CONSULTATION_STEP_QUERY}
        render={ConsultationStep}
        variables={{
          consultationStepId
        }}
      />
    </div>
  );
};

export default ConsultationListBox;

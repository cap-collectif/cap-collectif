// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { ConsultationPlanQueryResponse } from '~relay/ConsultationPlanQuery.graphql';
import ConsultationPlanRecursiveItems from './ConsultationPlanRecursiveItems';

type Step = {
  id: string,
  title: string,
  startAt: ?string,
  endAt: ?string,
  timeless: boolean,
  status: string,
};

type Props = {
  step: Step,
};

export class ConsultationPlan extends React.Component<Props> {
  render() {
    const { step } = this.props;

    const renderConsultationPlanRecursiveItems = ({
      error,
      props,
    }: { props: ?ConsultationPlanQueryResponse } & ReadyState) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        if (props.consultation) {
          return (
            // $FlowFixMe
            <ConsultationPlanRecursiveItems consultation={props.consultation} stepId={step.id} />
          );
        }
        return graphqlError;
      }
      return <Loader />;
    };

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ConsultationPlanQuery($consultationId: ID!) {
            consultation: node(id: $consultationId) {
              ...ConsultationPlanRecursiveItems_consultation
            }
          }
        `}
        variables={{
          consultationId: step.id,
        }}
        render={renderConsultationPlanRecursiveItems}
      />
    );
  }
}

export default ConsultationPlan;

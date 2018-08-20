// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/Loader';
import type { ConsultationPlanQueryResponse } from './__generated__/ConsultationPlanQuery.graphql';
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

    console.log(step);

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
            <ConsultationPlanRecursiveItems consultation={props.consultation} />
          );
        }
        return graphqlError;
      }
      return <Loader />;
    };

    return (
      <div className="consult-plan col-sm-3">
        <div>
          <p>PLAN</p>
          <i className="cap cap-map-location" />
        </div>
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
      </div>
    );
  }
}

export default ConsultationPlan;

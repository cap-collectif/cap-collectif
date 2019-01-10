// @flow
import React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { Row } from 'react-bootstrap';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import StepText from './StepText';
import { CardContainer } from '../../Ui/Card/CardContainer';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type {
  StepInfosQueryResponse,
  StepInfosQueryVariables,
} from './__generated__/StepInfosQuery.graphql';

type Props = {
  step: Object,
};

class StepInfos extends React.Component<Props> {
  render() {
    const { step } = this.props;

    return (
      <CardContainer>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query StepInfosQuery($stepId: ID!) {
              step: node(id: $stepId) {
                ... on Step {
                  body
                }
              }
            }
          `}
          variables={
            ({
              stepId: step.id,
            }: StepInfosQueryVariables)
          }
          render={({ error, props }: { props: ?StepInfosQueryResponse } & ReadyState) => {
            if (error) {
              return graphqlError;
            }

            if (props && props.step) {
              const { body } = props.step;
              return (
                <div className="card__body">
                  <StepText text={body} />
                </div>
              );
            }
            return (
              <Row>
                <Loader />
              </Row>
            );
          }}
        />
      </CardContainer>
    );
  }
}

export default StepInfos;

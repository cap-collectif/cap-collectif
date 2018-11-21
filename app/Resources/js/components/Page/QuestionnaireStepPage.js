// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import environment, { graphqlError } from '../../createRelayEnvironment';
import StepPageFooter from '../Steps/Page/StepPageFooter';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import UserReplies from '../Reply/UserReplies';
import { type GlobalState } from '../../types';
import { type QuestionnaireStepPageQueryResponse } from './__generated__/QuestionnaireStepPageQuery.graphql';
import { Loader } from '../Ui/FeedbacksIndicators/Loader';

type Props = {
  step: Object,
  questionnaireId: ?string,
  isAuthenticated: boolean,
};

const component = ({
  error,
  props,
}: {
  props: ?QuestionnaireStepPageQueryResponse,
} & ReadyState) => {
  if (error) {
    return graphqlError;
  }

  if (props) {
    if (props.questionnaire !== null) {
      return (
        <div>
          {/* $FlowFixMe $refType */}
          <UserReplies questionnaire={props.questionnaire} />
          <ReplyCreateFormWrapper questionnaire={props.questionnaire} />
        </div>
      );
    }
    return graphqlError;
  }
  return <Loader />;
};

export class QuestionnaireStepPage extends React.Component<Props> {
  render() {
    const { questionnaireId, step, isAuthenticated } = this.props;

    return (
      <div>
        <StepPageHeader step={step} />
        {questionnaireId ? (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query QuestionnaireStepPageQuery($id: ID!, $isAuthenticated: Boolean!) {
                questionnaire: node(id: $id) {
                  ...ReplyCreateFormWrapper_questionnaire
                    @arguments(isAuthenticated: $isAuthenticated)
                  ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
                }
              }
            `}
            variables={{
              id: questionnaireId,
              isAuthenticated,
            }}
            render={component}
          />
        ) : null}
        <StepPageFooter step={step} />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => ({
  isAuthenticated: state.user.user !== null,
  step:
    state.project.currentProjectById &&
    state.project.projectsById[state.project.currentProjectById].stepsById[props.step.id],
});

export default connect(mapStateToProps)(QuestionnaireStepPage);

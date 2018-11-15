// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
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
  form: { id: string },
  isAuthenticated: boolean,
};

const component = ({
  error,
  props,
}: {
  error: ?Error,
  props: ?QuestionnaireStepPageQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }

  if (props) {
    // eslint-disable-next-line
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
    const { form, step } = this.props;

    return (
      <div>
        <StepPageHeader step={step} />
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
            id: form.id,
            isAuthenticated: this.props.isAuthenticated,
          }}
          render={component}
        />
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

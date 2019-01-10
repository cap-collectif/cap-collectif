// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { connect } from 'react-redux';
import environment, { graphqlError } from '../../createRelayEnvironment';
import StepPageFooter from '../Steps/Page/StepPageFooter';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import UserReplies from '../Reply/UserReplies';
import { type GlobalState } from '../../types';
import { type QuestionnaireStepPageQueryResponse } from './__generated__/QuestionnaireStepPageQuery.graphql';
import { Loader } from '../Ui/FeedbacksIndicators/Loader';

type Props = {
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
    if (props.questionnaire) {
      return (
        <div>
          {/* $FlowFixMe $refType */}
          {props.questionnaire.step && <StepPageHeader step={props.questionnaire.step} />}
          {/* $FlowFixMe $refType */}
          <UserReplies questionnaire={props.questionnaire} />
          <ReplyCreateFormWrapper questionnaire={props.questionnaire} />
          {/* $FlowFixMe $refType */}
          {props.questionnaire.step && <StepPageFooter step={props.questionnaire.step} />}
        </div>
      );
    }
    return graphqlError;
  }
  return <Loader />;
};

export class QuestionnaireStepPage extends React.Component<Props> {
  render() {
    const { questionnaireId, isAuthenticated } = this.props;

    return (
      <div>
        {questionnaireId ? (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query QuestionnaireStepPageQuery($id: ID!, $isAuthenticated: Boolean!) {
                questionnaire: node(id: $id) {
                  ... on Questionnaire {
                    step {
                      ...StepPageFooter_step
                      ...StepPageHeader_step
                    }
                  }
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
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: state.user.user !== null,
});

export default connect(mapStateToProps)(QuestionnaireStepPage);

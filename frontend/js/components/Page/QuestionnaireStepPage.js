// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import environment, { graphqlError } from '../../createRelayEnvironment';
import { type GlobalState } from '../../types';
import { type QuestionnaireStepPageQueryResponse } from '~relay/QuestionnaireStepPageQuery.graphql';
import { Loader } from '../Ui/FeedbacksIndicators/Loader';
import QuestionnaireStepTabs from '../Questionnaire/QuestionnaireStepTabs';

export type Props = {|
  +questionnaireId: ?string,
  +isAuthenticated: boolean,
  +isPrivateResult: boolean,
  +enableResults: boolean,
|};

const component = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?QuestionnaireStepPageQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }

  if (props) {
    if (props.questionnaire) {
      return (
        <div>
          <QuestionnaireStepTabs questionnaire={props.questionnaire} />
        </div>
      );
    }
    return graphqlError;
  }
  return <Loader />;
};

export class QuestionnaireStepPage extends React.Component<Props> {
  render() {
    const { questionnaireId, isAuthenticated, enableResults, isPrivateResult } = this.props;
    return (
      <div>
        {questionnaireId ? (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query QuestionnaireStepPageQuery(
                $id: ID!
                $isAuthenticated: Boolean!
                $enableResults: Boolean!
              ) {
                questionnaire: node(id: $id) {
                  ...QuestionnaireStepTabs_questionnaire
                    @arguments(isAuthenticated: $isAuthenticated, enableResults: $enableResults)
                }
              }
            `}
            variables={{
              id: questionnaireId,
              isAuthenticated,
              enableResults: enableResults && !isPrivateResult,
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
  enableResults: state.default.features.new_feature_questionnaire_result || false,
});

export default connect<Props, GlobalState, _>(mapStateToProps)(QuestionnaireStepPage);

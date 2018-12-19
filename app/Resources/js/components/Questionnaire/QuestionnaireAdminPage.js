// @flow
import React, { Component } from 'react';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import QuestionnaireAdminPageTabs from './QuestionnaireAdminPageTabs';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { QuestionnaireAdminPageQueryResponse } from './__generated__/QuestionnaireAdminPageQuery.graphql';
import type { Uuid } from '../../types';

type Props = { questionnaireId: Uuid };

const component = ({
  error,
  props,
}: {
  props: ?QuestionnaireAdminPageQueryResponse,
} & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line
    if (props.questionnaire !== null) {
      // $FlowFixMe
      return <QuestionnaireAdminPageTabs questionnaire={props.questionnaire} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class QuestionnaireAdminPage extends Component<Props> {
  render() {
    return (
      <div className="admin_questionnaire_form">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query QuestionnaireAdminPageQuery($id: ID!) {
              questionnaire: node(id: $id) {
                ...QuestionnaireAdminPageTabs_questionnaire
              }
            }
          `}
          variables={{
            id: this.props.questionnaireId,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default QuestionnaireAdminPage;

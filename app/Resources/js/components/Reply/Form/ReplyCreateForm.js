// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import ReplyForm from './ReplyForm';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { ReplyCreateFormQueryResponse } from '~relay/ReplyCreateFormQuery.graphql';

const component = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?ReplyCreateFormQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }

  if (props) {
    if (props.questionnaire !== null) {
      return (
        <div>
          <ReplyForm questionnaire={props.questionnaire} />
        </div>
      );
    }
    return graphqlError;
  }
  return <Loader />;
};

type Props = {
  form: { id: string },
};

export class ReplyCreateForm extends React.Component<Props> {
  render() {
    const { form } = this.props;
    return (
      <div id="create-reply-form">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ReplyCreateFormQuery($id: ID!) {
              questionnaire: node(id: $id) {
                ...ReplyForm_questionnaire
              }
            }
          `}
          variables={{
            id: form.id,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default ReplyCreateForm;

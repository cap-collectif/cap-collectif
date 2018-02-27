import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import ReplyForm from './ReplyForm';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Utils/Loader';

const component = ({ error, props }: { error: ?Error, props: any }) => {
  if (error) {
    return graphqlError;
  }

  if (props) {
    // eslint-disable-next-line
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
  form: Object,
  disabled: boolean,
};

export class ReplyCreateForm extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  render() {
    return (
      <div id="create-reply-form">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ReplyCreateFormQuery($id: ID!) {
              questionnaire(id: $id) {
                ...ReplyForm_questionnaire
              }
            }
          `}
          variables={{
            id: this.props.form.id,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default ReplyCreateForm;

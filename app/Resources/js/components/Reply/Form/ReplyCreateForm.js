import React, { PropTypes } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import ReplyForm, { formName } from './ReplyForm';
import SubmitButton from '../../Form/SubmitButton';
import ReplyActions from '../../../actions/ReplyActions';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Utils/Loader';

const component = ({ error, props }: { error: ?Error, props: any }) => {
  if (error) {
    return graphqlError;
  }

  // console.warn(props);

  if (props) {
    // eslint-disable-next-line
    if (props.questionnaire !== null) {
      return (
        <div>
          <ReplyForm
            questionnaire={props.questionnaire}
          />
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

  // state = {
  //   isSubmitting: false,
  // };
  //
  // handleSubmit() {
  //   this.setState({
  //     isSubmitting: true,
  //   });
  // }
  //
  // handleSubmitSuccess() {
  //   const { form } = this.props;
  //   this.setState({
  //     isSubmitting: false,
  //   });
  //   if (form.multipleRepliesAllowed) {
  //     this.replyForm.emptyForm();
  //   }
  //   ReplyActions.loadUserReplies(form.id);
  // }
  //
  // handleFailure() {
  //   this.setState({
  //     isSubmitting: false,
  //   });
  // }

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

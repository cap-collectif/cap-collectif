import React, { PropTypes, Component } from 'react';
import ReplyActions from '../../../actions/ReplyActions';
import ReplyForm from './ReplyForm';

class ReplyUpdateForm extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting === true) {
      const { reply, onSubmitSuccess, onSubmitFailure, onValidationFailure } = this.props;

      const state = this._replyForm.state;
      if (this._replyForm.isValid()) {
        return ReplyActions.add(reply.id, state.form)
          .then(onSubmitSuccess)
          .catch(onSubmitFailure);
      }
      onValidationFailure();
    }
  }

  render() {
    return <ReplyForm ref={c => (this._replyForm = c)} {...this.props} />;
  }
}

ReplyUpdateForm.propTypes = {
  form: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onValidationFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  reply: PropTypes.object.isRequired
};

export default ReplyUpdateForm;

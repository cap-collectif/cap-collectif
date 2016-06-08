import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaVoteForm from './IdeaVoteForm';

const IdeaCreateVoteForm = React.createClass({
  displayName: 'IdeaCreateVoteForm',
  propTypes: {
    idea: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    anonymous: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      serverErrors: [],
    };
  },

  componentWillReceiveProps(nextProps) {
    const { idea, anonymous } = this.props;
    const ideaVoteForm = this.ideaVoteForm;
    if (!this.props.isSubmitting && nextProps.isSubmitting) {
      if (ideaVoteForm.isValid()) {
        const data = ideaVoteForm.state.form;
        if (!anonymous) {
          delete data.username;
          delete data.email;
        }
        if (!idea.commentable) {
          delete data.comment;
        }
        IdeaActions
          .vote(idea.id, data)
          .then(() => {
            ideaVoteForm.reinitState();
            this.props.onSubmitSuccess();
          })
          .catch((error) => {
            if (error.response) {
              this.setServerErrors(error.response);
            }
            this.props.onFailure();
          })
        ;
        return;
      }

      this.props.onFailure();
    }
  },

  setServerErrors(error) {
    const errors = [error.message];
    this.setState({
      serverErrors: errors,
    });
  },

  render() {
    return (
      <IdeaVoteForm
        ref={(c) => this.ideaVoteForm = c}
        idea={this.props.idea}
        serverErrors={this.state.serverErrors}
        anonymous={this.props.anonymous}
      />
    );
  },

});

export default IdeaCreateVoteForm;

import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaVoteForm from './IdeaVoteForm';

const IdeaDeleteVoteForm = React.createClass({
  displayName: 'IdeaDeleteVoteForm',
  propTypes: {
    idea: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    anonymous: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  componentWillReceiveProps(nextProps) {
    const {
      idea,
      isSubmitting,
      onFailure,
      onSubmitSuccess,
    } = this.props;
    const ideaVoteForm = this.ideaVoteForm;
    if (!isSubmitting && nextProps.isSubmitting) {
      if (ideaVoteForm.isValid()) {
        IdeaActions
          .deleteVote(idea.id)
          .then(() => {
            ideaVoteForm.reinitState();
            onSubmitSuccess();
          })
          .catch(onFailure)
        ;
        return;
      }

      onFailure();
    }
  },

  render() {
    const {
      anonymous,
      idea,
    } = this.props;
    return (
      <IdeaVoteForm
        ref={(c) => this.ideaVoteForm = c}
        idea={idea}
        anonymous={anonymous}
      />
    );
  },

});

export default IdeaDeleteVoteForm;

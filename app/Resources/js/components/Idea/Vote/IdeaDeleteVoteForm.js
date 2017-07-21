import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaVoteForm from './IdeaVoteForm';
import { deleteVoteSucceeded } from '../../../redux/modules/idea';

export const IdeaDeleteVoteForm = React.createClass({
  displayName: 'IdeaDeleteVoteForm',
  propTypes: {
    dispatch: PropTypes.func.isRequired,
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
      dispatch,
    } = this.props;
    const ideaVoteForm = this.ideaVoteForm;
    if (!isSubmitting && nextProps.isSubmitting) {
      if (ideaVoteForm.isValid()) {
        IdeaActions
          .deleteVote(idea.id)
          .then((vote) => {
            dispatch(deleteVoteSucceeded(idea.id, vote));
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
        ref={c => this.ideaVoteForm = c}
        idea={idea}
        anonymous={anonymous}
      />
    );
  },

});

export default connect()(IdeaDeleteVoteForm);

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
    const { idea } = this.props;
    const ideaVoteForm = this.ideaVoteForm;
    if (!this.props.isSubmitting && nextProps.isSubmitting) {
      if (ideaVoteForm.isValid()) {
        IdeaActions
          .deleteVote(idea.id)
          .then(() => {
            this.setState(this.getInitialState());
            this.props.onSubmitSuccess();
          })
          .catch(this.props.onFailure)
        ;
        return;
      }

      this.props.onFailure();
    }
  },

  render() {
    return (
      <IdeaVoteForm
        ref={(c) => this.ideaVoteForm = c}
        idea={this.props.idea}
        anonymous={this.props.anonymous}
      />
    );
  },

});

export default IdeaDeleteVoteForm;

// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import UserPreview from '../../User/UserPreview';
import SubmitButton from '../../Form/SubmitButton';
import IdeaCreateVoteForm from './IdeaCreateVoteForm';
import IdeaDeleteVoteForm from './IdeaDeleteVoteForm';
import type { Dispatch, State } from '../../../types';

type Props = {
  user: ?Object,
  idea: Object,
  className?: string,
  formWrapperClassName?: string,
  submitting: boolean,
  dispatch: Dispatch,
};

export class IdeaVoteBox extends React.Component<Props> {
  displayName: 'IdeaVoteBox';

  userHasVote() {
    // eslint-disable-next-line react/prop-types
    const { idea, user } = this.props;
    return user && idea.userHasVote;
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { idea, className, formWrapperClassName, user, submitting, dispatch } = this.props;
    return (
      <div className={className}>
        {user && (
          <UserPreview user={user} style={{ padding: '0', marginBottom: '0', fontSize: '18px' }} />
        )}
        <div className={formWrapperClassName}>
          {this.userHasVote() ? (
            <IdeaDeleteVoteForm idea={idea} anonymous={!user} />
          ) : (
            <IdeaCreateVoteForm idea={idea} anonymous={!user} />
          )}
        </div>
        <SubmitButton
          id="idea-vote-button"
          isSubmitting={submitting}
          onSubmit={() => {
            dispatch(submit('IdeaVoteForm'));
          }}
          label={this.userHasVote() ? 'idea.vote.delete' : 'idea.vote.add'}
          bsStyle={!this.userHasVote() || submitting ? 'success' : 'danger'}
          className="btn-block"
          style={{ marginTop: '10px' }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
  submitting: isSubmitting('IdeaVoteForm')(state),
});

export default connect(mapStateToProps)(IdeaVoteBox);

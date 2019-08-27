// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type { CommentSectionQueryResponse } from '~relay/CommentSectionQuery.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { GlobalState } from '../../types';
import CommentSectionView from './CommentSectionView';

type Props = {
  commentableId: string,
  isAuthenticated: boolean,
};

export class CommentSection extends React.Component<Props> {
  render() {
    const { isAuthenticated, commentableId } = this.props;
    return (
      <div className="comments__section">
        <QueryRenderer
          variables={{ commentableId, isAuthenticated }}
          environment={environment}
          query={graphql`
            query CommentSectionQuery($commentableId: ID!, $isAuthenticated: Boolean!) {
              commentable: node(id: $commentableId) {
                ... on Commentable {
                  id
                  allComments: comments(first: 0) {
                    totalCountWithAnswers
                  }
                  ...CommentListView_commentable @arguments(isAuthenticated: $isAuthenticated)
                  ...CommentForm_commentable
                }
              }
            }
          `}
          render={({ error, props }: { props: ?CommentSectionQueryResponse, ...ReadyState }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              if (props.commentable) {
                return (
                  /* $FlowFixMe */
                  <CommentSectionView
                    commentable={props.commentable}
                    isAuthenticated={isAuthenticated}
                    useBodyColor={false}
                  />
                );
              }
              return graphqlError;
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: !!state.user.user,
});

export default connect(mapStateToProps)(CommentSection);

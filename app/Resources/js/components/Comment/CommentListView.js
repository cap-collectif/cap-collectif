// @flow
import * as React from 'react';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import type { CommentListView_commentable } from '~relay/CommentListView_commentable.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import CommentListViewPaginated from './CommentListViewPaginated';
import scrollToAnchor from '../../services/ScrollToAnchor';

export type CommentOrderBy = 'last' | 'old' | 'popular';

type Props = {
  commentable: CommentListView_commentable,
  isAuthenticated: boolean,
  order: CommentOrderBy,
  relay: RelayRefetchProp,
  invertedBackground?: ?boolean,
};

type State = {
  isRefetching: boolean,
  highlightedComment: ?string,
};

export class CommentListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
    highlightedComment: null,
  };

  componentDidMount() {
    if (this.props.commentable) {
      if (location.hash.length > 0) {
        this.setState({ highlightedComment: location.hash.split('_')[1] }); // eslint-disable-line
        setTimeout(() => {
          scrollToAnchor('#comments-section-load-more');
        }, 20);
      }
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.order !== this.props.order) {
      this._refetch();
    }
  }

  _refetch = () => {
    this.setState({ isRefetching: true });
    const { order, commentable, isAuthenticated } = this.props;

    const refetchVariables = () => ({
      orderBy: {
        field: order === 'popular' ? 'POPULARITY' : 'PUBLISHED_AT',
        direction: order === 'last' || order === 'popular' ? 'DESC' : 'ASC',
      },
      cursor: null,
      commentableId: commentable.id,
      isAuthenticated,
      count: 100,
    });

    this.props.relay.refetch(
      refetchVariables,
      null,
      () => {
        this.setState({ isRefetching: false });
      },
      { force: true },
    );
  };

  render() {
    const { highlightedComment, isRefetching } = this.state;

    if (isRefetching) {
      return <Loader />;
    }

    const { commentable, invertedBackground } = this.props;

    return (
      // $FlowFixMe
      <CommentListViewPaginated
        commentable={commentable}
        highlightedComment={highlightedComment}
        invertedBackground={invertedBackground}
      />
    );
  }
}

export default createRefetchContainer(
  CommentListView,
  {
    commentable: graphql`
      fragment CommentListView_commentable on Commentable
        @argumentDefinitions(
          count: { type: "Int" }
          cursor: { type: "String" }
          orderBy: { type: "CommentOrder!", defaultValue: { field: PUBLISHED_AT, direction: DESC } }
          isAuthenticated: { type: "Boolean!" }
        ) {
        id
        ...CommentListViewPaginated_commentable
          @arguments(
            cursor: $cursor
            orderBy: $orderBy
            isAuthenticated: $isAuthenticated
            count: $count
          )
      }
    `,
  },
  graphql`
    query CommentListViewRefetchQuery(
      $commentableId: ID!
      $cursor: String
      $orderBy: CommentOrder!
      $isAuthenticated: Boolean!
      $count: Int
    ) {
      commentable: node(id: $commentableId) {
        id
        ...CommentListView_commentable
          @arguments(
            cursor: $cursor
            orderBy: $orderBy
            isAuthenticated: $isAuthenticated
            count: $count
          )
      }
    }
  `,
);

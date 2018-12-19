// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, type IntlShape } from 'react-intl';
import environment, { graphqlError } from '../../createRelayEnvironment';
import CommentListView, { type CommentOrderBy } from './CommentListView';
import CommentForm from './CommentForm';
import type { CommentSectionQueryResponse } from './__generated__/CommentSectionQuery.graphql';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { GlobalState } from '../../types';

type Props = {
  intl: IntlShape,
  commentableId: string,
  isAuthenticated: boolean,
};

type State = {
  order: CommentOrderBy,
};

export class CommentSection extends React.Component<Props, State> {
  state = {
    order: 'last',
  };

  updateSelectedValue = (e: any) => {
    this.setState({
      order: e.target.value,
    });
  };

  render() {
    const { isAuthenticated, commentableId, intl } = this.props;
    const { order } = this.state;
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
          render={({ error, props }: { props: ?CommentSectionQueryResponse } & ReadyState) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              if (props.commentable) {
                return (
                  <div>
                    <h3>
                      <FormattedMessage id="proposal.tabs.comments" />
                    </h3>
                    <Row>
                      <Col componentClass="h4" id="proposal-page-comments-counter" sm={6}>
                        {props.commentable.allComments && (
                          <FormattedHTMLMessage
                            id="comment.list"
                            values={{
                              num: props.commentable.allComments.totalCountWithAnswers,
                            }}
                          />
                        )}
                      </Col>
                      {props.commentable.allComments &&
                        props.commentable.allComments.totalCountWithAnswers > 1 && (
                          <Col
                            smOffset={2}
                            sm={4}
                            xs={12}
                            style={{ marginTop: '10px', marginBottom: '20px' }}>
                            <select
                              className="form-control"
                              value={order}
                              onChange={value => this.updateSelectedValue(value)}
                              onBlur={value => this.updateSelectedValue(value)}>
                              <option value="popular">
                                {intl.formatMessage({ id: 'global.filter_popular' })}
                              </option>
                              <option value="last">
                                {intl.formatMessage({ id: 'global.filter_last' })}
                              </option>
                              <option value="old">
                                {intl.formatMessage({ id: 'global.filter_old' })}
                              </option>
                            </select>
                          </Col>
                        )}
                    </Row>
                    {/* $FlowFixMe */}
                    <CommentForm commentable={props.commentable} />
                    {/* $FlowFixMe */}
                    <CommentListView
                      isAuthenticated={isAuthenticated}
                      order={order}
                      commentable={props.commentable}
                    />
                  </div>
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

export default connect(mapStateToProps)(injectIntl(CommentSection));

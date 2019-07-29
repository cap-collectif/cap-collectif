// @flow
import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, type IntlShape } from 'react-intl';
import CommentListView from './CommentListView';
import CommentForm from './CommentForm';
import type { CommentSectionFragmented_commentable } from '~relay/CommentSectionFragmented_commentable.graphql';

type Props = {|
  +intl: IntlShape,
  +commentable: CommentSectionFragmented_commentable,
  +isAuthenticated: boolean,
  +invertedBackground?: ?boolean,
|};

export function CommentSectionView(props: Props) {
  const [order, setOrder] = useState('last');
  const { isAuthenticated, intl, invertedBackground, commentable } = props;

  const updateSelectedValue = (e: any) => {
    setOrder({
      order: e.target.value,
    });
  };

  return (
    <div>
      <h3>
        <FormattedMessage id="proposal.tabs.comments" />
      </h3>
      <Row>
        <Col componentClass="h4" id="proposal-page-comments-counter" sm={6}>
          {commentable.allComments && (
            <FormattedHTMLMessage
              id="comment.list"
              values={{
                num: commentable.allComments.totalCountWithAnswers,
              }}
            />
          )}
        </Col>
        {commentable.allComments && commentable.allComments.totalCountWithAnswers > 1 && (
          <Col smOffset={2} sm={4} xs={12} style={{ marginTop: '10px', marginBottom: '20px' }}>
            <select
              className="form-control"
              value={order}
              onChange={value => updateSelectedValue(value)}
              onBlur={value => updateSelectedValue(value)}>
              <option value="popular">{intl.formatMessage({ id: 'global.filter_popular' })}</option>
              <option value="last">{intl.formatMessage({ id: 'global.filter_last' })}</option>
              <option value="old">{intl.formatMessage({ id: 'global.filter_old' })}</option>
            </select>
          </Col>
        )}
      </Row>
      <CommentForm commentable={commentable} />
      {/* $FlowFixMe */}
      <CommentListView
        isAuthenticated={isAuthenticated}
        order={order}
        commentable={commentable}
        invertedBackground={invertedBackground}
      />
    </div>
  );
}

export default injectIntl(CommentSectionView);

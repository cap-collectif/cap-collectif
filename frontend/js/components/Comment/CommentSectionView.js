// @flow
import React, { useState } from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, type IntlShape } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { Menu, Button, Flex, Box } from '@cap-collectif/ui';
import CommentListView, { type CommentOrderBy } from './CommentListView';
import CommentForm from './CommentForm';
import type { CommentSectionFragmented_commentable } from '~relay/CommentSectionFragmented_commentable.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {|
  +intl: IntlShape,
  +commentable: CommentSectionFragmented_commentable,
  +isAuthenticated: boolean,
  +useBodyColor: boolean,
  unstable__enableCapcoUiDs?: boolean,
|};

export const FilterButton: StyledComponent<{}, {}, typeof Button> = styled(Button)`
  border: none !important;
  outline: none !important;
  background-color: ${colors.white} !important;
  box-shadow: none !important;
  color: ${colors.darkText} !important;
  svg {
    margin: 0 !important;
    margin-top: 5px !important;
    margin-right: 4px !important;
  }
`;

const filters = {
  popular: 'global.filter_popular',
  old: 'global.filter_old',
  last: 'global.filter_last',
};

export function CommentSectionView(props: Props) {
  const [order, setOrder] = useState<CommentOrderBy>('last');
  const { isAuthenticated, intl, useBodyColor, commentable, unstable__enableCapcoUiDs } = props;

  return (
    <div>
      {unstable__enableCapcoUiDs ? null : (
        <h3>
          <FormattedMessage id="proposal.tabs.comments" />
        </h3>
      )}
      <Flex direction="row" justify="space-between" align="center" mb={5}>
        <Box id="proposal-page-comments-counter">
          {commentable.allComments && (
            <FormattedHTMLMessage
              id="comment.list"
              values={{
                num: commentable.allComments.totalCountWithAnswers,
              }}
            />
          )}
        </Box>
        {commentable.allComments && commentable.allComments.totalCountWithAnswers > 1 && (
          <Menu
            placement="bottom-end"
            disclosure={
              <FilterButton
                id="js-btn-visibility-step"
                variant="tertiary"
                variantColor="hierarchy"
                style={{ fontWeight: 400 }}>
                <Icon name={ICON_NAME.sort} size={14} color={colors.darkText} />
                <FormattedMessage id={filters[order]} />
              </FilterButton>
            }>
            <Menu.List>
              <Menu.Item
                style={{ borderWidth: '1px', borderStyle: 'solid' }}
                backgroundColor="transparent"
                id="public-collect"
                onClick={() => setOrder('popular')}>
                {intl.formatMessage({ id: filters.popular })}
              </Menu.Item>
              <Menu.Item
                style={{ borderWidth: '1px', borderStyle: 'solid' }}
                backgroundColor="transparent"
                id="private-collect"
                onClick={() => setOrder('last')}>
                {intl.formatMessage({ id: filters.last })}
              </Menu.Item>
              <Menu.Item
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
                borderBottomColor="transparent"
                backgroundColor="transparent"
                id="old"
                onClick={() => setOrder('old')}>
                {intl.formatMessage({ id: filters.old })}
              </Menu.Item>
            </Menu.List>
          </Menu>
        )}
      </Flex>
      {/* $FlowFixMe reduxForm */}
      <CommentForm commentable={commentable} />
      {/* $FlowFixMe */}
      <CommentListView
        isAuthenticated={isAuthenticated}
        order={order}
        commentable={commentable}
        useBodyColor={useBodyColor}
        unstable__enableCapcoUiDs={unstable__enableCapcoUiDs}
      />
    </div>
  );
}

export default injectIntl(CommentSectionView);

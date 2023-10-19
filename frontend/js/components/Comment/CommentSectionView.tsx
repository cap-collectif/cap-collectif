import React, { useState } from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { Menu, Button, Flex, Box } from '@cap-collectif/ui'
import type { CommentOrderBy } from './CommentListView'
import CommentListView from './CommentListView'
import CommentForm from './CommentForm'
import type { CommentSectionFragmented_commentable } from '~relay/CommentSectionFragmented_commentable.graphql'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import CommentListNotApprovedByModerator from '~/components/Comment/CommentListNotApprovedByModerator'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
type Props = {
  readonly intl: IntlShape
  readonly commentable: CommentSectionFragmented_commentable
  readonly isAuthenticated: boolean
  readonly useBodyColor: boolean
}
export const FilterButton: StyledComponent<any, {}, typeof Button> = styled(Button)`
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
`
const filters = {
  popular: 'global.filter_popular',
  old: 'global.filter_old',
  last: 'global.filter_last',
}
export function CommentSectionView(props: Props) {
  const [order, setOrder] = useState<CommentOrderBy>('last')
  const { isAuthenticated, intl, useBodyColor, commentable } = props
  const moderationCommentFeature = useFeatureFlag('moderation_comment')
  return (
    <div>
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
                style={{
                  fontWeight: 400,
                }}
              >
                <Icon name={ICON_NAME.sort} size={14} color={colors.darkText} />
                <FormattedMessage id={filters[order]} />
              </FilterButton>
            }
          >
            <Menu.List>
              <Menu.Item
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
                backgroundColor="transparent"
                id="public-collect"
                onClick={() => setOrder('popular')}
              >
                {intl.formatMessage({
                  id: filters.popular,
                })}
              </Menu.Item>
              <Menu.Item
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
                backgroundColor="transparent"
                id="private-collect"
                onClick={() => setOrder('last')}
              >
                {intl.formatMessage({
                  id: filters.last,
                })}
              </Menu.Item>
              <Menu.Item
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
                borderBottomColor="transparent"
                backgroundColor="transparent"
                id="old"
                onClick={() => setOrder('old')}
              >
                {intl.formatMessage({
                  id: filters.old,
                })}
              </Menu.Item>
            </Menu.List>
          </Menu>
        )}
      </Flex>
      <CommentForm commentable={commentable} />
      {moderationCommentFeature && isAuthenticated && (
        <CommentListNotApprovedByModerator commentable={commentable} useBodyColor={useBodyColor} />
      )}
      <CommentListView
        isAuthenticated={isAuthenticated}
        order={order}
        commentable={commentable}
        useBodyColor={useBodyColor}
      />
    </div>
  )
}
export default injectIntl(CommentSectionView)

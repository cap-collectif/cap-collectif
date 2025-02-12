import * as React from 'react'
import { Box, ButtonQuickAction as ButtonQuickActionDS, CapUIIcon, Flex, Text } from '@cap-collectif/ui'
import { useFragment, graphql } from 'react-relay'
import moment from 'moment'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import UserAvatar from '~/components/User/UserAvatar'
import type { ProposalAnalysisCommentListItem_comment$key } from '~relay/ProposalAnalysisCommentListItem_comment.graphql'
import '~relay/ProposalAnalysisCommentListItem_comment.graphql'
import type { ProposalAnalysisCommentListItem_viewer$key } from '~relay/ProposalAnalysisCommentListItem_viewer.graphql'
import '~relay/ProposalAnalysisCommentListItem_viewer.graphql'
import DeleteProposalAnalysisCommentMutation from '~/mutations/DeleteProposalAnalysisCommentMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { GlobalState } from '~/types'

type Props = {
  comment: ProposalAnalysisCommentListItem_comment$key
  viewer: ProposalAnalysisCommentListItem_viewer$key
  connectionId: string
}
const VIEWER_FRAGMENT = graphql`
  fragment ProposalAnalysisCommentListItem_viewer on User {
    id
  }
`
const COMMENT_FRAGMENT = graphql`
  fragment ProposalAnalysisCommentListItem_comment on Comment {
    id
    body
    createdAt
    author {
      ...UserAvatar_user
      id
      username
      firstname
      lastname
    }
  }
`
const ButtonQuickAction = styled(ButtonQuickActionDS)`
  border: none;
  display: flex !important;
  align-items: center;
  justify-content: center;
`

const ProposalAnalysisCommentListItem = ({ comment: commentRef, viewer: viewerRef, connectionId }: Props) => {
  const intl = useIntl()
  const comment = useFragment<ProposalAnalysisCommentListItem_comment$key>(COMMENT_FRAGMENT, commentRef)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const author = comment?.author
  const createdAt = moment(comment?.createdAt).format('DD/MM/YYYY - kk:mm')
  const isAuthor = author?.id === viewer?.id
  const [hover, setHover] = React.useState(false)

  const displayName = () => {
    if (author?.firstname && author?.lastname) {
      return `${author?.firstname} ${author?.lastname.charAt(0).toUpperCase()}.`
    }

    return author?.firstname ?? author?.username
  }

  const buttonBackgroundColor = useSelector((state: GlobalState) => state.default.parameters['color.btn.primary.bg'])
  const showDeleteButton = isAuthor && hover

  const onClick = async () => {
    try {
      await DeleteProposalAnalysisCommentMutation.commit({
        input: {
          id: comment.id,
        },
        connections: [connectionId],
      })
    } catch (error) {
      mutationErrorToast(intl)
    }
  }

  return (
    <Flex width="100%">
      <UserAvatar user={author} displayUrl={false} />
      <Flex
        direction="column"
        backgroundColor="white"
        padding={2}
        borderRadius="4px"
        fontSize={3}
        width="100%"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Flex align="center" justifyContent="space-between" mb={1}>
          <Box>
            <Text as="span" color={buttonBackgroundColor} fontWeight={600} mr={2}>
              {displayName()}
            </Text>
            <Text as="span" color="neutral-gray.700">
              {createdAt}
            </Text>
          </Box>
          <ButtonQuickAction
            icon={CapUIIcon.Trash}
            label={intl.formatMessage({
              id: 'global.delete',
            })}
            variantColor="red"
            onClick={onClick}
            opacity={showDeleteButton ? 1 : 0}
          />
        </Flex>
        <Text color="gray.900" lineHeight="16px" fontSize={3}>
          {comment.body}
        </Text>
      </Flex>
    </Flex>
  )
}

export default ProposalAnalysisCommentListItem

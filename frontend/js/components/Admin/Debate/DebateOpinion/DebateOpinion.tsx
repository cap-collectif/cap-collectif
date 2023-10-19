import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import css from '@styled-system/css'
import Flex from '~ui/Primitives/Layout/Flex'
import Card from '~ds/Card/Card'
import Tag from '~ds/Tag/Tag'
import Text from '~ui/Primitives/Text'
import WYSIWYGRender from '~/components/Form/WYSIWYGRender'
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction'
import { ICON_NAME } from '~ds/Icon/Icon'
import type { DebateOpinion_debateOpinion } from '~relay/DebateOpinion_debateOpinion.graphql'
import '~relay/DebateOpinion_debateOpinion.graphql'
import NewUserAvatarLegacy from '~/components/User/NewUserAvatarLegacy'
type Props = {
  readonly debateOpinion: DebateOpinion_debateOpinion
  readonly onEdit: () => void
  readonly onDelete: () => void
}
export const DebateOpinion = ({ debateOpinion, onEdit, onDelete }: Props) => {
  const { title, body, author, type } = debateOpinion
  const [hovering, setHovering] = React.useState<boolean>(false)
  return (
    <Card
      p={0}
      bg="white"
      flex="1"
      position="relative"
      overflow="hidden"
      maxHeight="400px"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Tag
        interactive={false}
        variant={type === 'FOR' ? 'green' : 'red'}
        css={css({
          position: 'absolute',
          top: '-1px',
          left: '-1px',
        })}
        borderBottomLeftRadius={0}
        borderTopRightRadius={0}
      >
        <FormattedMessage id={type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
      </Tag>

      {hovering && (
        <Flex
          direction="row"
          css={css({
            position: 'absolute',
            top: 2,
            right: 2,
          })}
        >
          <ButtonQuickAction
            icon={ICON_NAME.PENCIL}
            label={<FormattedMessage id="global.change" />}
            onClick={onEdit}
            variantColor="primary"
          />
          <ButtonQuickAction
            icon={ICON_NAME.TRASH}
            label={<FormattedMessage id="global.delete" />}
            onClick={onDelete}
            variantColor="danger"
          />
        </Flex>
      )}

      <Flex direction="column" px={6} pt={10} pb={6} maxHeight="100%">
        <Flex direction="row" spacing={2} mb={4} align="center">
          <NewUserAvatarLegacy user={author} size="md" border="2px solid" borderColor="yellow.500" />
          <Text fontSize={3} color="gray.500">
            {author.username}
          </Text>
        </Flex>
        <Flex direction="column" spacing={2} maxHeight="100%" overflow="hidden">
          <Text fontWeight="600">{title}</Text>
          <WYSIWYGRender value={body} />
        </Flex>
      </Flex>
    </Card>
  )
}
export default createFragmentContainer(DebateOpinion, {
  debateOpinion: graphql`
    fragment DebateOpinion_debateOpinion on DebateOpinion {
      type
      title
      body
      author {
        username
        ...NewUserAvatarLegacy_user
      }
    }
  `,
})

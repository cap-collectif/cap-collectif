import * as React from 'react'
import { useFragment, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import { Box, Button, Heading, Text, Tag, AbstractCard, Flex, CapUIFontSize } from '@cap-collectif/ui'
import type { DebateOpinion_opinion$key } from '~relay/DebateOpinion_opinion.graphql'
import { LineHeight } from '~ui/Primitives/constants'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import DebateStepPageOpinionDrawer from '~/components/Debate/Page/Drawers/DebateStepPageOpinionDrawer'
import colors from '~/styles/modules/colors'
import UserAvatar from '~/components/User/UserAvatar'
// TODO remove this and import from relay
export type DebateOpinionStatus = 'FOR' | 'AGAINST'
type Props = {
  readonly isMobile?: boolean
  readonly readMore?: boolean
  readonly opinion: DebateOpinion_opinion$key
}

const DebateOpinion = ({ isMobile = false, readMore = false, ...props }: Props): JSX.Element => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const opinion = useFragment(
    graphql`
      fragment DebateOpinion_opinion on DebateOpinion @argumentDefinitions(isMobile: { type: "Boolean!" }) {
        ...DebateStepPageOpinionDrawer_opinion @include(if: $isMobile)
        title
        body
        author {
          ...UserAvatar_user
          username
          biography
        }
        type
      }
    `,
    props.opinion,
  )
  return (
    <AbstractCard
      p={0}
      bg="white"
      flex="1" // we have to manually set a max height in px for the transition to work
      maxHeight={!readMore ? '400px' : '2000px'}
      overflow="hidden"
      sx={{
        transition: 'max-height 0.5s ease-out',
        '.ql-video': {
          width: '100%',
          aspectRatio: ' 16 / 9',
        },
      }}
      position="relative"
    >
      <Tag
        variantColor={opinion.type === 'FOR' ? 'success' : 'danger'}
        variantType="tag"
        borderBottomLeftRadius={0}
        borderTopLeftRadius={0}
        borderTopRightRadius={0}
        sx={{
          // @ts-ignore
          position: 'absolute !important',
          '&:hover': {
            cursor: 'default',
            background: colors[opinion.type === 'FOR' ? 'green' : 'red'][150],
          },
        }}
      >
        <Text as="span" fontSize={CapUIFontSize.Caption} lineHeight={LineHeight.SM} fontWeight="700" uppercase>
          <FormattedMessage id={opinion.type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
        </Text>
      </Tag>
      {!readMore && (
        <Box
          width="100%"
          height={12}
          bottom={0}
          sx={{
            position: 'absolute',
            background:
              'linear-gradient(to top, rgba(255,255,255,1) 0%,rgba(255,255,255,1) 30%,rgba(255,255,255,0) 100%)',
          }}
        />
      )}
      <Flex direction="column" m={6} mt={10}>
        <Flex direction="row" spacing={6} mb={5}>
          <UserAvatar
            alignSelf="flex-start"
            size="xl"
            borderColor="yellow.500"
            color="yellow.500"
            border="2px solid"
            bg="blue.100"
            user={opinion.author}
          />
          <Flex direction="column">
            <Text fontSize={CapUIFontSize.BodyRegular} fontWeight="600">
              {opinion.author.username}
            </Text>
            <Text color="neutral-gray.700" fontSize={CapUIFontSize.BodyRegular} lineHeight="19px">
              {opinion.author.biography}
            </Text>
          </Flex>
        </Flex>
        <Flex direction="column" spacing={3}>
          <Heading as="h4" fontWeight="600">
            {opinion.title}
          </Heading>
          <Text>
            <WYSIWYGRender value={opinion.body} />
          </Text>
          {isMobile && (
            <Button
              onClick={onOpen}
              variant="link"
              variantSize="medium"
              alignSelf="center"
              position="absolute"
              bottom="0"
              left="0"
              width="100%"
              height={10}
              display="block"
              sx={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 5%, white 25%)',
              }}
            >
              <FormattedMessage id="capco.module.read_more" />
            </Button>
          )}
        </Flex>
      </Flex>
      {isMobile && <DebateStepPageOpinionDrawer onClose={onClose} isOpen={isOpen} opinion={opinion} />}
    </AbstractCard>
  )
}

export default DebateOpinion

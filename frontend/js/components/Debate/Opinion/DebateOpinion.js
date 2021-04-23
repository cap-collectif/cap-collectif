// @flow
import * as React from 'react';
import { useFragment, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import css from '@styled-system/css';
import { useDisclosure } from '@liinkiing/react-hooks';
import type { DebateOpinion_opinion$key } from '~relay/DebateOpinion_opinion.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import { LineHeight } from '~ui/Primitives/constants';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import Button from '~ds/Button/Button';
import DebateStepPageOpinionDrawer from '~/components/Debate/Page/Drawers/DebateStepPageOpinionDrawer';
import NewUserAvatar from '~/components/User/NewUserAvatar';
import AppBox from '~ui/Primitives/AppBox';

// TODO remove this and import from relay
export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  +isMobile?: boolean,
  +readMore?: boolean,
  +opinion: DebateOpinion_opinion$key,
|};

const DebateOpinion = ({ isMobile = false, readMore = false, ...props }: Props): React.Node => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const opinion = useFragment(
    graphql`
      fragment DebateOpinion_opinion on DebateOpinion
        @argumentDefinitions(isMobile: { type: "Boolean!" }) {
        ...DebateStepPageOpinionDrawer_opinion @include(if: $isMobile)
        title
        body
        author {
          ...NewUserAvatar_user
          username
          biography
        }
        type
      }
    `,
    props.opinion,
  );
  return (
    <Card
      p={0}
      bg="white"
      flex="1" // we have to manually set a max height in px for the transition to work
      maxHeight={!readMore ? '400px' : '2000px'}
      overflow="hidden"
      css={{ transition: 'max-height 0.5s ease-out' }}
      position="relative">
      <Tag
        variant={opinion.type === 'FOR' ? 'green' : 'red'}
        borderBottomLeftRadius={0}
        borderTopLeftRadius={0}
        borderTopRightRadius={0}
        css={css({
          position: 'absolute',
        })}>
        <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700" uppercase>
          <FormattedMessage id={opinion.type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
        </Text>
      </Tag>
      {!readMore && (
        <AppBox
          width="100%"
          height={12}
          bottom={0}
          css={css({
            position: 'absolute',
            background:
              'linear-gradient(to top, rgba(255,255,255,1) 0%,rgba(255,255,255,1) 30%,rgba(255,255,255,0) 100%)',
          })}
        />
      )}
      <Flex direction="column" m={6} mt={10}>
        <Flex direction="row" spacing={6} mb={5} alignItems="center">
          <NewUserAvatar
            alignSelf="flex-start"
            size="xl"
            borderColor="yellow.500"
            color="yellow.500"
            border="2px solid"
            user={opinion.author}
          />
          <Flex direction="column">
            <Text fontSize={3} fontWeight="600">
              {opinion.author.username}
            </Text>
            <Text color="neutral-gray.700" fontSize={3} lineHeight="19px">
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
              css={css({
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 5%, white 25%)',
              })}>
              <FormattedMessage id="capco.module.read_more" />
            </Button>
          )}
        </Flex>
      </Flex>
      {isMobile && (
        <DebateStepPageOpinionDrawer onClose={onClose} isOpen={isOpen} opinion={opinion} />
      )}
    </Card>
  );
};

export default DebateOpinion;

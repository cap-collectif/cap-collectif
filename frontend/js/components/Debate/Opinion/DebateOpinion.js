// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import css from '@styled-system/css';
import { useDisclosure } from '@liinkiing/react-hooks';
import type { DebateOpinion_opinion } from '~relay/DebateOpinion_opinion.graphql';
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

export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  +opinion: DebateOpinion_opinion,
  +isMobile: boolean,
  +readMore: boolean,
|};

export const DebateOpinion = ({ opinion, isMobile, readMore }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <Card p={0} bg="white" flex="1">
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
            <WYSIWYGRender
              /**  Should be 500in desktop BUT html-truncate has issues truncating  the HTML content.
              Maybe it's the embedded youtube video, idk. This require further processing
               */
              truncate={isMobile ? 80 : !readMore ? 80 : 0}
              value={opinion.body}
            />
          </Text>
          {isMobile && (
            <Button onClick={onOpen} variant="link" variantSize="medium" alignSelf="center">
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

export default createFragmentContainer(DebateOpinion, {
  opinion: graphql`
    fragment DebateOpinion_opinion on DebateOpinion {
      ...DebateStepPageOpinionDrawer_opinion
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
});

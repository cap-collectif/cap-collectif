// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import css from '@styled-system/css';
import type { DebateOpinion_opinion } from '~relay/DebateOpinion_opinion.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Avatar from '~ds/Avatar/Avatar';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';

export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  +opinion: DebateOpinion_opinion,
|};

export const DebateOpinion = ({ opinion }: Props) => {
  return (
    <Card p={0} bg="white" flex="1">
      <Tag
        variant={opinion.type === 'FOR' ? 'green' : 'red'}
        css={css({
          position: 'absolute',
        })}>
        <Heading as="h5" fontWeight="700" uppercase>
          <FormattedMessage id={opinion.type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
        </Heading>
      </Tag>
      <Flex direction="column" m={6} mt={10}>
        <Flex direction="row" spacing={6} mb={5} alignItems="center">
          <Avatar
            src={opinion.author.media?.url}
            name={opinion.author.username}
            alt={opinion.author.username}
            size="xl"
            borderColor="yellow.500"
            border="3px"
          />
          <Flex direction="column">
            <Text fontSize={3} fontWeight="600">
              {opinion.author.username}
            </Text>
            <Text fontSize={3}>{opinion.author.biography}</Text>
          </Flex>
        </Flex>
        <Flex direction="column" spacing={2}>
          <Heading as="h4" fontWeight="600">
            {opinion.title}
          </Heading>
          <Text truncate={100}>
            <WYSIWYGRender value={opinion.body} />
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default createFragmentContainer(DebateOpinion, {
  opinion: graphql`
    fragment DebateOpinion_opinion on DebateOpinion {
      title
      body
      author {
        media {
          url
        }
        username
        biography
      }
      type
    }
  `,
});

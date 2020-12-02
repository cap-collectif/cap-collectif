// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import css from '@styled-system/css';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Avatar from '~ds/Avatar/Avatar';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';

export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  +title: string,
  +debateOpinionStatus: DebateOpinionStatus,
  +authorName: ?string,
  +authorPicture: ?string,
  +body: string,
|};

export const DebateOpinion = ({
  title,
  body,
  authorName,
  authorPicture,
  debateOpinionStatus = 'FOR',
}: Props) => (
  <Card p={0} bg="white" flex="1">
    <Tag
      variant={debateOpinionStatus === 'FOR' ? 'green' : 'red'}
      css={css({
        position: 'absolute',
      })}>
      <Heading as="h5" fontWeight="700" uppercase>
        <FormattedMessage id={debateOpinionStatus === 'FOR' ? 'opinion.for' : 'opinion.against'} />
      </Heading>
    </Tag>
    <Flex direction="column" m={6} mt={10}>
      <Flex direction="row" spacing={6} mb={5}>
        <Avatar
          src={authorPicture}
          name={authorName}
          alt={authorName}
          size="xl"
          borderColor="yellow.500"
          border="3px"
        />
        <Flex direction="column">
          <Text fontSize={3} fontWeight="600">
            {authorName}
          </Text>
          <Text fontSize={3}>
            Ingénieur de recherche à l’Institut national de la santé et de la recherche médicale
            (INSERM) UMR912 – SESSTIM
          </Text>
        </Flex>
      </Flex>
      <Flex direction="column" spacing={2}>
        <Heading as="h4" fontWeight="600">
          {title}
        </Heading>
        <Text truncate={100}>
          <WYSIWYGRender value={body} />
        </Text>
      </Flex>
    </Flex>
  </Card>
);

export default DebateOpinion;

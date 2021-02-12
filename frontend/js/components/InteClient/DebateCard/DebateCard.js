// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import css from '@styled-system/css';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import { LineHeight } from '~ui/Primitives/constants';
import Avatar from '~ds/Avatar/Avatar';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Status = 'FOR' | 'AGAINST';

type Props = {|
  ...AppBoxProps,
  +type: Status,
  +title: string,
  +body: string,
  +username: string,
  +avatarUrl: string,
  +biography: string,
|};

export const DebateCard = ({
  type,
  title,
  body,
  username,
  avatarUrl,
  biography,
  ...props
}: Props) => (
  <Card p={0} bg="white" flex="1" {...props}>
    <Tag
      variant={type === 'FOR' ? 'green' : 'red'}
      borderBottomLeftRadius={0}
      borderTopLeftRadius={0}
      borderTopRightRadius={0}
      css={css({
        position: 'absolute',
      })}>
      <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700" uppercase>
        <FormattedMessage id={type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
      </Text>
    </Tag>
    <Flex direction="column" m={6} mt={10}>
      <Flex direction="row" spacing={6} mb={5} alignItems="center">
        <Avatar
          name={username}
          src={avatarUrl}
          alt={username}
          alignSelf="flex-start"
          size="xl"
          borderColor="yellow.500"
          color="yellow.500"
          border="2px solid"
        />
        <Flex direction="column">
          <Text fontSize={3} fontWeight="600">
            {username}
          </Text>
          <Text color="neutral-gray.700" fontSize={3} lineHeight="19px">
            {biography}
          </Text>
        </Flex>
      </Flex>
      <Flex direction="column" spacing={3}>
        <Heading as="h4" fontWeight="600">
          {title}
        </Heading>
        <Text>{body}</Text>
      </Flex>
    </Flex>
  </Card>
);

export default DebateCard;

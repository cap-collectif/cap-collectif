// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Tooltip from '~/components/DesignSystem/Tooltip/Tooltip';

type Props = {|
  +count: number,
|};

const TagCount = ({ count }: Props) => {
  const intl = useIntl();
  return (
    <Tooltip label={intl.formatMessage({ id: 'messages.sent.to.author.count'}, { num: count })}>
      <Flex
        as="p"
        width="16px"
        direction="row"
        align="center"
        justify="center"
        p="2px"
        bg="gray.200"
        m={0}
        ml={1}
        borderRadius="2px">
        {count}
      </Flex>
    </Tooltip>
  );
};

export default TagCount;

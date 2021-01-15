// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RoundShape, RectShape } from 'react-placeholder/lib/placeholders';
import css from '@styled-system/css';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import { LineHeight } from '~ui/Primitives/constants';
import Text from '~ui/Primitives/Text';

export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  +debateOpinionStatus: DebateOpinionStatus,
|};

export const DebateOpinionPlaceholder = ({ debateOpinionStatus = 'FOR' }: Props) => (
  <Card p={0} bg="white" width="100%">
    <Tag
      variant={debateOpinionStatus === 'FOR' ? 'green' : 'red'}
      css={css({
        position: 'absolute',
      })}>
      <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700" uppercase>
        <FormattedMessage id={debateOpinionStatus === 'FOR' ? 'opinion.for' : 'opinion.against'} />
      </Text>
    </Tag>
    <Flex direction="column" m={6} mt={10}>
      <Flex direction="row" spacing={6} mb={5}>
        <RoundShape color="#EEEEEE" style={{ width: 72, height: 72 }} />
        <Flex direction="column" flex="1" spacing={2}>
          <RectShape color="#EEEEEE" style={{ width: '30%', height: 20 }} />
          <RectShape color="#EEEEEE" style={{ width: '100%', height: 36 }} />
        </Flex>
      </Flex>
      <Flex direction="column" spacing={4}>
        <RectShape color="#EEEEEE" style={{ width: '60%', height: 20 }} />
        <Flex direction="column" spacing={6}>
          <RectShape color="#EEEEEE" style={{ width: '100%', height: 110 }} />
          <RectShape color="#EEEEEE" style={{ width: '100%', height: 150 }} />
        </Flex>
      </Flex>
    </Flex>
  </Card>
);

export default DebateOpinionPlaceholder;

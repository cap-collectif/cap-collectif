// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Tag from '~ds/Tag/Tag';
import { type ForOrAgainstValue } from '~relay/FaceToFace_debate.graphql';

type Props = {|
  type: ForOrAgainstValue,
|};

const DebateEmptyOpinion = ({ type }: Props) => (
  <Flex
    direction="column"
    border="1px dashed"
    borderColor="gray.300"
    align="center"
    p={5}
    flex="1"
    borderRadius="normal"
    position="relative">
    <Tag
      variant={type === 'FOR' ? 'green' : 'red'}
      position="absolute"
      top="-1px"
      left="-1px"
      borderBottomLeftRadius={0}
      borderTopRightRadius={0}
      interactive={false}>
      <FormattedMessage id={type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
    </Tag>
    <Icon name={ICON_NAME.ADD} size={ICON_SIZE.XL} color="gray.300" />
  </Flex>
);

export default DebateEmptyOpinion;

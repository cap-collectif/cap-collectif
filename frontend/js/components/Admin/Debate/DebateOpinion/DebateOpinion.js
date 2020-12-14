// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import css from '@styled-system/css';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import { ICON_NAME } from '~ds/Icon/Icon';
import { type DebateOpinion_debateOpinion } from '~relay/DebateOpinion_debateOpinion.graphql';
import NewUserAvatar from '~/components/User/NewUserAvatar';

type Props = {|
  +debateOpinion: DebateOpinion_debateOpinion,
  +onEdit: () => void,
  +onDelete: () => void,
|};

export const DebateOpinion = ({ debateOpinion, onEdit, onDelete }: Props) => {
  const { title, body, author, type } = debateOpinion;

  return (
    <Card p={0} bg="white" flex="1" position="relative" overflow="hidden">
      <Tag
        variant={type === 'FOR' ? 'green' : 'red'}
        css={css({
          position: 'absolute',
          top: '-1px',
          left: '-1px',
        })}
        borderBottomLeftRadius={0}
        borderTopRightRadius={0}>
        <FormattedMessage id={type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
      </Tag>

      <Flex
        direction="row"
        css={css({
          position: 'absolute',
          top: 2,
          right: 2,
        })}>
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

      <Flex direction="column" px={4} pt={10} pb={6}>
        <Flex direction="row" spacing={2} mb={4} align="center">
          <NewUserAvatar user={author} size="md" border="2px solid" borderColor="yellow.500" />
          <Text fontSize={3} color="gray.500">
            {author.username}
          </Text>
        </Flex>
        <Flex direction="column" spacing={2}>
          <Text fontWeight="600">{title}</Text>
          <Text truncate={340}>
            <WYSIWYGRender value={body} />
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default createFragmentContainer(DebateOpinion, {
  debateOpinion: graphql`
    fragment DebateOpinion_debateOpinion on DebateOpinion {
      type
      title
      body
      author {
        username
        ...NewUserAvatar_user
      }
    }
  `,
});

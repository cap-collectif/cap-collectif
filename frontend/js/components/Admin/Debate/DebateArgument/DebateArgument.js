// @flow
import * as React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedDate, FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import { type DebateArgument_argument } from '~relay/DebateArgument_argument.graphql';
import { type DebateArgument_debate } from '~relay/DebateArgument_debate.graphql';
import { ICON_NAME } from '~ds/Icon/Icon';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import InlineList from '~ds/InlineList/InlineList';
import { formatConnectionPath } from '~/shared/utils/relay';
import DeleteDebateArgumentMutation from '~/mutations/DeleteDebateArgumentMutation';
import { toast } from '~ds/Toast';

type Props = {|
  +argument: DebateArgument_argument,
  +debate: DebateArgument_debate,
|};

const onDelete = (argumentId: string, debateId: string, intl: IntlShape) => {
  const connections = [formatConnectionPath(['client', debateId], 'ArgumentTab_debateArguments')];

  DeleteDebateArgumentMutation.commit({
    input: {
      id: argumentId,
    },
    connections,
    debateId,
  })
    .then(response => {
      if (response.deleteDebateArgument?.errorCode) {
        toast({
          variant: 'danger',
          content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
        });
      }
    })
    .catch(() => {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
      });
    });
};

export const DebateArgument = ({ argument, debate }: Props) => {
  const { id, body, author, published, publishedAt, type } = argument;
  const intl = useIntl();
  const [hovering, setHovering] = React.useState<boolean>(false);

  return (
    <Flex
      p={2}
      borderTop="normal"
      borderColor="gray.150"
      direction="row"
      align="center"
      justify="space-between"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}>
      <Flex direction="column" flex="3" mr={4}>
        <Text truncate={100} color="blue.900">
          {body}
        </Text>

        <InlineList separator="•" color="gray.600">
          <Text>{author.username}</Text>

          {published && (
            <Text>
              <FormattedMessage
                id="global.publishDate.publishTime.feminine"
                values={{
                  date: (
                    <FormattedDate
                      value={moment(publishedAt)}
                      day="numeric"
                      month="short"
                      year="numeric"
                    />
                  ),
                  time: (
                    <FormattedDate value={moment(publishedAt)} hour="numeric" minute="numeric" />
                  ),
                }}
              />
            </Text>
          )}
        </InlineList>
      </Flex>

      <Flex direction="row" flex="1" align="center" justify="space-between">
        <Tag variant={type === 'FOR' ? 'green' : 'red'}>
          <FormattedMessage
            id={type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against'}
          />
        </Tag>

        {hovering && (
          <ButtonQuickAction
            icon={ICON_NAME.TRASH}
            label={<FormattedMessage id="global.delete" />}
            onClick={() => onDelete(id, debate.id, intl)}
            variantColor="danger"
          />
        )}
      </Flex>
    </Flex>
  );
};

export default createFragmentContainer(DebateArgument, {
  argument: graphql`
    fragment DebateArgument_argument on DebateArgument {
      id
      body
      published
      publishedAt
      type
      author {
        username
      }
    }
  `,
  debate: graphql`
    fragment DebateArgument_debate on Debate {
      id
    }
  `,
});

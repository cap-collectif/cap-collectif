import * as React from 'react'
import moment from 'moment'
import { createFragmentContainer, graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl'
import type { DebateArgument_argument } from '~relay/DebateArgument_argument.graphql'
import '~relay/DebateArgument_argument.graphql'
import { ICON_NAME } from '~ds/Icon/Icon'
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction'
import InlineList from '~ds/InlineList/InlineList'
import DeleteDebateArgumentMutation from '~/mutations/DeleteDebateArgumentMutation'
import type { ModerateArgument } from '~/components/Debate/Page/Arguments/ModalModerateArgument'
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context'
import type { FilterArgument } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer'
import { formatConnectionPath } from '~/shared/utils/relay'
import Popover from '~ds/Popover'
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup'
import { Flex, Tag, Text, Button, toast, CapUIIcon } from '@cap-collectif/ui'
type Props = {
  readonly argument: DebateArgument_argument
  readonly setModerateArgumentModal: (argument: ModerateArgument) => void
}

const onDelete = (argumentId: string, debateId: string, intl: IntlShape, filters: FilterArgument) => {
  const connections = [
    formatConnectionPath(
      ['client', debateId],
      'ArgumentTab_debateArguments',
      `(isPublished:${(filters.state === 'PUBLISHED' || filters.state === 'TRASHED').toString()},isTrashed:${(
        filters.state === 'TRASHED'
      ).toString()})`,
    ),
  ]
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
          content: intl.formatHTMLMessage({
            id: 'global.error.server.form',
          }),
        })
      }
    })
    .catch(() => {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({
          id: 'global.error.server.form',
        }),
      })
    })
}

export const DebateArgument = ({ argument, setModerateArgumentModal }: Props) => {
  const { id, body, author, published, publishedAt, type, debate, trashedStatus } = argument
  const [hovering, setHovering] = React.useState<boolean>(false)
  const intl = useIntl()
  const { parameters, dispatch } = useProjectAdminDebateContext()
  return (
    <Flex
      p={2}
      borderTop="normal"
      borderColor="gray.150"
      direction="row"
      align="center"
      justify="space-between"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Flex direction="column" flex="3" mr={4}>
        <Text truncate={100} color="blue.900">
          {trashedStatus === 'INVISIBLE'
            ? intl.formatMessage({
                id: 'hidden-content',
              })
            : body}
        </Text>

        <InlineList separator="•" color="gray.600">
          <Text>
            {author?.username ??
              `${argument.username || ''} (${intl.formatMessage({
                id: 'global.anonymous',
              })})`}
          </Text>

          {published && (
            <Text>
              <FormattedMessage
                id="global.publishDate.publishTime.feminine"
                values={{
                  date: <FormattedDate value={moment(publishedAt)} day="numeric" month="short" year="numeric" />,
                  time: <FormattedDate value={moment(publishedAt)} hour="numeric" minute="numeric" />,
                }}
              />
            </Text>
          )}
        </InlineList>
      </Flex>

      <Flex direction="row" flex="1" align="center" justify="space-between">
        <Tag
          variantColor={type === 'FOR' ? 'success' : 'danger'}
          onClick={() =>
            dispatch({
              type: 'CHANGE_ARGUMENT_TYPE',
              payload: [type],
            })
          }
        >
          <FormattedMessage id={type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against'} />
        </Tag>

        {hovering &&
          (parameters.filters.argument.state === 'PUBLISHED' || parameters.filters.argument.state === 'WAITING') && (
            <Button
              variant="tertiary"
              variantColor="hierarchy"
              leftIcon={CapUIIcon.Moderate}
              color="gray.500"
              onClick={() =>
                setModerateArgumentModal({
                  id,
                  debateId: debate.id,
                  state: published ? 'PUBLISHED' : 'WAITING',
                  forOrAgainst: type,
                })
              }
              p={0}
            />
          )}

        {hovering && parameters.filters.argument.state === 'TRASHED' && (
          <Popover placement="left" trigger={['click']}>
            <Popover.Trigger>
              <ButtonQuickAction
                icon={ICON_NAME.TRASH}
                label={<FormattedMessage id="global.delete" />}
                variantColor="danger"
              />
            </Popover.Trigger>
            <Popover.Content>
              {({ closePopover }) => (
                <React.Fragment>
                  <Popover.Header>
                    {intl.formatMessage({
                      id: 'global.removeDefinitively',
                    })}
                  </Popover.Header>
                  <Popover.Body>
                    <Text>
                      {intl.formatMessage({
                        id: 'body-confirm-definitively-delete-argument',
                      })}
                    </Text>
                  </Popover.Body>
                  <Popover.Footer>
                    <ButtonGroup>
                      <Button onClick={closePopover} variant="secondary" variantColor="hierarchy" variantSize="small">
                        {intl.formatMessage({
                          id: 'cancel',
                        })}
                      </Button>
                      <Button
                        variant="primary"
                        variantColor="danger"
                        variantSize="small"
                        onClick={() => onDelete(argument.id, argument.debate.id, intl, parameters.filters.argument)}
                      >
                        {intl.formatMessage({
                          id: 'global.removeDefinitively',
                        })}
                      </Button>
                    </ButtonGroup>
                  </Popover.Footer>
                </React.Fragment>
              )}
            </Popover.Content>
          </Popover>
        )}
      </Flex>
    </Flex>
  )
}
export default createFragmentContainer(DebateArgument, {
  argument: graphql`
    fragment DebateArgument_argument on AbstractDebateArgument {
      id
      body
      published
      publishedAt
      type
      ... on DebateArgument {
        author {
          id
          username
        }
      }
      ... on DebateAnonymousArgument {
        username
        email
      }
      debate {
        id
      }
      ... on Trashable {
        trashedStatus
      }
    }
  `,
})

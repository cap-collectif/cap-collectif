// @flow
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import DebateArgument from '~/components/Admin/Debate/DebateArgument/DebateArgument';
import { type ArgumentTab_debate } from '~relay/ArgumentTab_debate.graphql';
import Button from '~ds/Button/Button';
import AppBox from '~ui/Primitives/AppBox';
import Menu from '~ds/Menu/Menu';
import { ICON_NAME } from '~ds/Icon/Icon';
import Spinner from '~ds/Spinner/Spinner';
import { useProjectAdminDebatePageContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebatePage/ProjectAdminDebatePage.context';
import InlineSelect from '~ds/InlineSelect';
import { baseUrl } from '~/config';
import NoResultArgument from '~/components/Admin/Debate/NoResultArgument/NoResultArgument';
import type { ArgumentState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebatePage/ProjectAdminDebatePage.reducer';
import { type ForOrAgainstValue } from '~relay/DebateArgument_argument.graphql';

export const ARGUMENT_PAGINATION = 10;

const MAX_HEIGHT_8_ARGUMENTS = 520;

type Props = {|
  debate: ArgumentTab_debate,
  +relay: RelayPaginationProp,
|};

export const ArgumentTab = ({ debate, relay }: Props) => {
  const {
    debateArguments,
    argumentsFor,
    argumentsAgainst,
    debateArgumentsPublished,
    debateArgumentsWaiting,
    debateArgumentsTrashed,
  } = debate;
  const listArgumentRef = React.useRef(null);
  const { parameters, dispatch } = useProjectAdminDebatePageContext();
  const intl = useIntl();

  const sumCountArguments: number =
    debateArgumentsPublished.totalCount +
    debateArgumentsWaiting.totalCount +
    debateArgumentsTrashed.totalCount;
  const hasArguments = sumCountArguments > 0;
  const hasArgumentForOrAgainst = argumentsFor.totalCount > 0 || argumentsAgainst.totalCount > 0;

  return hasArguments ? (
    <Flex direction="column">
      <Flex direction="row" justify="space-between" align="center">
        <InlineSelect
          value={parameters.filters.argument.state}
          onChange={value =>
            dispatch({ type: 'CHANGE_ARGUMENT_STATE', payload: ((value: any): ArgumentState) })
          }>
          <InlineSelect.Choice value="PUBLISHED">
            {intl.formatMessage(
              { id: 'filter.count.status.published' },
              { num: debateArgumentsPublished.totalCount },
            )}
          </InlineSelect.Choice>
          <InlineSelect.Choice value="WAITING">
            {intl.formatMessage(
              { id: 'filter.count.status.awaiting' },
              { count: debateArgumentsWaiting.totalCount },
            )}
          </InlineSelect.Choice>
          <InlineSelect.Choice value="TRASHED">
            {intl.formatMessage(
              { id: 'filter.count.status.trash' },
              { num: debateArgumentsTrashed.totalCount },
            )}
          </InlineSelect.Choice>
        </InlineSelect>

        <Flex direction="row" align="center" spacing={5}>
          <Menu>
            <Menu.Button as={React.Fragment}>
              <Button rightIcon={ICON_NAME.ARROW_DOWN_O} color="gray.500" p={0}>
                {intl.formatMessage({ id: 'label_filters' })}
              </Button>
            </Menu.Button>

            <Menu.List>
              <Menu.OptionGroup
                value={((parameters.filters.argument.type: any): string[])}
                onChange={value =>
                  dispatch({
                    type: 'CHANGE_ARGUMENT_TYPE',
                    payload: ((value: any): ForOrAgainstValue[]),
                  })
                }
                type="checkbox"
                title={intl.formatMessage({ id: 'filter-arguments' })}>
                <Menu.OptionItem value="FOR">
                  <Text color="gray.900">{intl.formatMessage({ id: 'global.for' })}</Text>
                </Menu.OptionItem>
                <Menu.OptionItem value="AGAINST">
                  <Text color="gray.900">{intl.formatMessage({ id: 'global.against' })}</Text>
                </Menu.OptionItem>
              </Menu.OptionGroup>
            </Menu.List>
          </Menu>

          <Button variant="primary" variantColor="primary" variantSize="small" disabled>
            {intl.formatMessage({ id: 'global.export' })}
          </Button>
        </Flex>
      </Flex>

      {parameters.filters.argument.state === 'WAITING' && hasArgumentForOrAgainst && (
        <Text color="gray.500" mt={4}>
          {intl.formatMessage({ id: 'argument-waiting-user-email-confirmation' })}
        </Text>
      )}

      {debateArguments.totalCount > 0 ? (
        <AppBox
          as="ul"
          p={0}
          m={0}
          mt={4}
          css={{ listStyle: 'none', overflow: 'auto', maxHeight: `${MAX_HEIGHT_8_ARGUMENTS}px` }}
          ref={listArgumentRef}>
          <InfiniteScroll
            key="infinite-scroll-argument"
            initialLoad={false}
            pageStart={0}
            loadMore={() => relay.loadMore(ARGUMENT_PAGINATION)}
            hasMore={debate.debateArguments?.pageInfo.hasNextPage}
            loader={
              <Flex direction="row" justify="center">
                <Spinner size="m" />
              </Flex>
            }
            getScrollParent={() => listArgumentRef.current}
            useWindow={false}>
            {debateArguments?.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .map(argument => (
                <AppBox as="li" key={argument.id}>
                  <DebateArgument argument={argument} debate={debate} />
                </AppBox>
              ))}
          </InfiniteScroll>
        </AppBox>
      ) : (
        <NoResultArgument debate={debate} />
      )}
    </Flex>
  ) : (
    <Flex direction="column" spacing={6} align="center">
      <AppBox as="img" src={`${baseUrl}/image/contribution_debate_argument.png`} />
      <Text color="gray.500">{intl.formatMessage({ id: 'debate.empty.arguments.section' })}</Text>
    </Flex>
  );
};

export default createPaginationContainer(
  ArgumentTab,
  {
    debate: graphql`
      fragment ArgumentTab_debate on Debate
        @argumentDefinitions(
          count: { type: "Int!" }
          cursor: { type: "String" }
          value: { type: "ForOrAgainstValue", defaultValue: null }
          isPublished: { type: "Boolean!" }
          isTrashed: { type: "Boolean!" }
        ) {
        id
        debateArguments: arguments(
          first: $count
          after: $cursor
          value: $value
          isPublished: $isPublished
          isTrashed: $isTrashed
        )
          @connection(
            key: "ArgumentTab_debateArguments"
            filters: ["value", "isPublished", "isTrashed"]
          ) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              ...DebateArgument_argument
            }
          }
        }
        argumentsFor: arguments(value: FOR, isPublished: $isPublished, isTrashed: $isTrashed) {
          totalCount
        }
        argumentsAgainst: arguments(
          value: AGAINST
          isPublished: $isPublished
          isTrashed: $isTrashed
        ) {
          totalCount
        }
        debateArgumentsPublished: arguments(isPublished: true, isTrashed: false) {
          totalCount
        }
        debateArgumentsWaiting: arguments(isPublished: false) {
          totalCount
        }
        debateArgumentsTrashed: arguments(isTrashed: true) {
          totalCount
        }
        ...DebateArgument_debate
        ...NoResultArgument_debate @arguments(isPublished: $isPublished, isTrashed: $isTrashed)
      }
    `,
  },
  {
    direction: 'forward',
    /*
     * Based on node_modules/react-relay/ReactRelayPaginationContainer.js.flow, when I ask something
     * in the pageInfo node, it forces me to include everything (e.g hasPrevPage, startCursor and
     * endCursor) but I only need `hasNextPage`
     * $FlowFixMe
     * */
    getConnectionFromProps(props: Props) {
      return props.debate && props.debate.debateArguments;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        debateId: props.debate.id,
      };
    },
    query: graphql`
      query ArgumentTabPaginatedQuery(
        $debateId: ID!
        $count: Int!
        $cursor: String
        $value: ForOrAgainstValue
        $isPublished: Boolean!
        $isTrashed: Boolean!
      ) {
        debate: node(id: $debateId) {
          ...ArgumentTab_debate
            @arguments(
              count: $count
              cursor: $cursor
              value: $value
              isPublished: $isPublished
              isTrashed: $isTrashed
            )
        }
      }
    `,
  },
);

// @flow
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import DebateArgument from '~/components/Admin/Debate/DebateArgument/DebateArgument';
import { type ArgumentTab_debate } from '~relay/ArgumentTab_debate.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Spinner from '~ds/Spinner/Spinner';
import NoResultArgument from '~/components/Admin/Debate/NoResultArgument/NoResultArgument';
import SpotIcon, { SPOT_ICON_NAME } from '~ds/SpotIcon/SpotIcon';
import ModalModerateArgument, {
  type ModerateArgument,
} from '~/components/Debate/Page/Arguments/ModalModerateArgument';
import { formatConnectionPath } from '~/shared/utils/relay';

export const ARGUMENT_PAGINATION = 10;

const MAX_HEIGHT_8_ARGUMENTS = 520;

type Props = {|
  debate: ArgumentTab_debate,
  +relay: RelayPaginationProp,
|};

export const ArgumentTab = ({ debate, relay }: Props) => {
  const { debateArguments, allArguments } = debate;
  const listArgumentRef = React.useRef(null);
  const [moderateArgumentModal, setModerateArgumentModal] = React.useState<?ModerateArgument>(null);
  const intl = useIntl();

  const hasArguments = allArguments.totalCount > 0;

  return hasArguments ? (
    <Flex direction="column">
      {debateArguments.totalCount > 0 ? (
        <AppBox
          as="ul"
          p={0}
          m={0}
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
              .filter(Boolean)
              .map(argument => (
                <AppBox as="li" key={argument.id}>
                  <DebateArgument
                    argument={argument}
                    setModerateArgumentModal={setModerateArgumentModal}
                  />
                </AppBox>
              ))}
          </InfiniteScroll>
        </AppBox>
      ) : (
        <NoResultArgument debate={debate} />
      )}

      {moderateArgumentModal && (
        <ModalModerateArgument
          isAdmin
          argument={moderateArgumentModal}
          onClose={() => setModerateArgumentModal(null)}
          relayConnection={[
            formatConnectionPath(
              ['client', moderateArgumentModal.debateId],
              'ArgumentTab_debateArguments',
              `(isPublished:${(
                moderateArgumentModal.state === 'PUBLISHED'
              ).toString()},isTrashed:false)`,
            ),
          ]}
        />
      )}
    </Flex>
  ) : (
    <Flex direction="column" spacing={6} align="center">
      <SpotIcon name={SPOT_ICON_NAME.PENCIL_SOFTWARE} size="lg" />
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
          isPublished: { type: "Boolean" }
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
        allArguments: arguments(first: 0, isPublished: null, isTrashed: null) {
          totalCount
        }
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
        $isPublished: Boolean
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

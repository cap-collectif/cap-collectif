// @flow
import React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import UserBox from '~/components/User/UserBox';
import type { ProposalPageFollowers_proposal } from '~relay/ProposalPageFollowers_proposal.graphql';
import { graphqlError } from '~/createRelayEnvironment';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '~/constants/ProposalConstants';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import {
  CategoryCircledIcon,
  CategoryTitle,
  SeeMoreButton,
} from '~/components/Proposal/Page/ProposalPage.style';

type State = {|
  loading: boolean,
|};
type Props = {|
  proposal: ?ProposalPageFollowers_proposal,
  relay: RelayPaginationProp,
  pageAdmin: boolean,
|};

const ProposalPageFollowersContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
  max-width: 950px;
  margin: auto;
  padding: 10px;

  .CategoryTitle {
    margin-bottom: 20px;
  }
`;

export class ProposalPageFollowers extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { proposal, relay, pageAdmin } = this.props;
    const { loading } = this.state;
    if (!proposal) return null;
    if (!proposal.followers || !proposal.followers.edges) {
      return graphqlError;
    }
    return (
      <ProposalPageFollowersContainer>
        {pageAdmin === false ? (
          <CategoryTitle>
            <CategoryCircledIcon paddingLeft={10}>
              <Icon name={ICON_NAME.bell} size={19} color={colors.secondaryGray} />
            </CategoryCircledIcon>
            <h3>
              <FormattedMessage
                values={{ num: proposal.followers.totalCount }}
                id="proposal.follower.count"
              />
            </h3>
          </CategoryTitle>
        ) : null}

        {proposal.followers.edges.length !== 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {proposal.followers.edges.filter(Boolean).map((edge, key) => (
              <UserBox id={key} key={key} user={edge.node} className="proposal__follower" />
            ))}
          </div>
        ) : (
          <div className="well well-lg text-center">
            <i className="cap-32 cap-contacts-1 " />
            <br />
            <FormattedMessage id="no-followers" />
          </div>
        )}

        {relay.hasMore() && (
          <div className="text-center">
            <SeeMoreButton
              type="button"
              disabled={loading}
              onClick={() => {
                this.setState({ loading: true });
                relay.loadMore(PROPOSAL_FOLLOWERS_TO_SHOW, () => {
                  this.setState({ loading: false });
                });
              }}>
              <FormattedMessage id={loading ? 'global.loading' : 'global.more'} />
            </SeeMoreButton>
          </div>
        )}
      </ProposalPageFollowersContainer>
    );
  }
}

export default createPaginationContainer(
  ProposalPageFollowers,
  {
    proposal: graphql`
      fragment ProposalPageFollowers_proposal on Proposal
        @argumentDefinitions(count: { type: "Int", defaultValue: 20 }, cursor: { type: "String" }) {
        id
        followers(first: $count, after: $cursor)
          @connection(key: "ProposalPageFollowers_followers") {
          edges {
            cursor
            node {
              id
              ...UserBox_user
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            endCursor
            startCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.proposal && props.proposal.followers;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props: Props, { count, cursor }) {
      return {
        count,
        cursor,
        proposalId: props.proposal?.id,
      };
    },
    query: graphql`
      query ProposalPageFollowersQuery($proposalId: ID!, $count: Int!, $cursor: String) {
        proposal: node(id: $proposalId) {
          ...ProposalPageFollowers_proposal @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);

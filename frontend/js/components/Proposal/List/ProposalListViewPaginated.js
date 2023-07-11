// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import cn from 'classnames';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ProposalListViewPaginated_step } from '~relay/ProposalListViewPaginated_step.graphql';
import type { ProposalListViewPaginated_viewer } from '~relay/ProposalListViewPaginated_viewer.graphql';
import VisibilityBox from '../../Utils/VisibilityBox';
import ProposalList from './ProposalList';
import type { ProposalViewMode } from '~/redux/modules/proposal';
import ProposalsDisplayMap from '../../Page/ProposalsDisplayMap';
import type { MapOptions } from '../Map/Map.types';
import type { GeoJson } from '~/utils/geojson';
import CookieMonster from '~/CookieMonster';

type Props = {
  relay: RelayPaginationProp,
  displayMap: boolean,
  step: ProposalListViewPaginated_step,
  displayMode: ProposalViewMode,
  defaultMapOptions: MapOptions,
  geoJsons: Array<GeoJson>,
  viewer: ?ProposalListViewPaginated_viewer,
  count: number,
};

const ProposalListViewPaginated = ({
  step,
  viewer,
  geoJsons,
  defaultMapOptions,
  displayMap,
  relay,
  displayMode,
  count,
}: Props) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const isOpinion = step.form?.objectType === 'OPINION';
  const loadMoreTradKey = isOpinion ? 'see-more-opinions' : 'see-more-proposals';

  return (
    <div
      className={cn('proposal-list-view-paginated', {
        [`displayMode-${displayMode}`]: !!displayMode,
      })}>
      {displayMap && displayMode === 'MAP' ? (
        <ProposalsDisplayMap
          className="zi-0"
          step={step}
          geoJsons={geoJsons}
          defaultMapOptions={defaultMapOptions}
        />
      ) : (
        <React.Fragment>
          <VisibilityBox enabled={step.private || false}>
            <ProposalList
              step={step}
              proposals={step.proposals}
              viewer={viewer}
              view={displayMode}
              id="proposals-list"
            />
          </VisibilityBox>
          <div id="proposal-list-pagination-footer" className="text-center">
            {relay.hasMore() && (
              <Button
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  relay.loadMore(count, () => {
                    setLoading(false);
                  });
                }}>
                <FormattedMessage id={loading ? 'global.loading' : loadMoreTradKey} />
              </Button>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const ProposalListViewPaginatedRelay = createPaginationContainer(
  ProposalListViewPaginated,
  {
    viewer: graphql`
      fragment ProposalListViewPaginated_viewer on User
      @argumentDefinitions(stepId: { type: "ID!" }) {
        ...ProposalList_viewer @arguments(stepId: $stepId)
      }
    `,
    step: graphql`
      fragment ProposalListViewPaginated_step on ProposalStep
      @argumentDefinitions(token: { type: "String" }) {
        id
        ... on CollectStep {
          private
        }
        ...ProposalsDisplayMap_step
        ...ProposalList_step
        form {
          objectType
        }
        proposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          term: $term
          district: $district
          theme: $theme
          category: $category
          status: $status
          userType: $userType
        ) @connection(key: "ProposalListViewPaginated_proposals", filters: []) {
          ...ProposalList_proposals @arguments(token: $token)
          edges {
            node {
              id
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.step && props.step.proposals;
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
        stepId: props.step.id,
        isAuthenticated: !!props.viewer,
        token: CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone(),
      };
    },
    query: graphql`
      query ProposalListViewPaginatedQuery(
        $stepId: ID!
        $cursor: String
        $orderBy: [ProposalOrder]
        $isAuthenticated: Boolean!
        $count: Int
        $term: String
        $district: ID
        $category: ID
        $status: ID
        $theme: ID
        $userType: ID
        $token: String
      ) {
        step: node(id: $stepId) {
          ...ProposalListViewPaginated_step
          ...ProposalStepPageHeader_step
        }
      }
    `,
  },
);

export default ProposalListViewPaginatedRelay;

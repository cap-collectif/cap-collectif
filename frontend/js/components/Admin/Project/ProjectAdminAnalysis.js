// @flow
import * as React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import type { ProjectAdminAnalysis_project } from '~relay/ProjectAdminAnalysis_project.graphql';
import PickableList, { usePickableList } from '~ui/List/PickableList';
import * as S from './ProjectAdminProposals.style';
import Tag from '~ui/Labels/Tag';
import Loader from '~ui/FeedbacksIndicators/Loader';
import DropdownSelect from '~ui/DropdownSelect';
import Collapsable from '~ui/Collapsable';
import type {
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  SortValues,
} from '~/components/Admin/Project/ProjectAdminPage.reducer';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';
import { getAllFormattedChoicesForProject } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.utils';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

export const PROJECT_ADMIN_PROPOSAL_PAGINATION = 30;

type Props = {|
  +relay: RelayPaginationProp,
  +project: ProjectAdminAnalysis_project,
|};

type FilterTagProps = {|
  +children: React.Node,
  +show: boolean,
  +icon?: React.Node,
  +bgColor?: string,
  +canClose?: boolean,
  +onClose?: () => void,
|};

const ProposalListHeaderContainer = styled(PickableList.Header)`
  align-items: stretch;
  & > * {
    margin: 0 1.25rem 0 0;
    justify-content: flex-start;
    & p {
      margin-bottom: 0;
    }
  }
  & > p:first-of-type {
    flex: 3;
    align-self: center;
  }
`;

const ProposalListLoader = () => (
  <S.ProposalListLoader>
    <Loader inline size={16} />
    <FormattedMessage id="synthesis.common.loading" />
  </S.ProposalListLoader>
);

const FilterTag = ({ children, show, icon, onClose, bgColor, canClose = true }: FilterTagProps) => {
  if (!show) return null;
  return (
    <S.FilterTagContainer bgColor={bgColor}>
      {icon}
      <span>{children}</span>
      {canClose && (
        <Icon onClick={onClose} name={ICON_NAME.close} className="close-icon" size="0.7rem" />
      )}
    </S.FilterTagContainer>
  );
};

const ProposalListHeader = ({ project }: { project: ProjectAdminAnalysis_project }) => {
  const { selectedRows, rowsCount } = usePickableList();
  const { parameters, dispatch } = useProjectAdminProposalsContext();
  const { categories, districts } = React.useMemo(() => getAllFormattedChoicesForProject(project), [
    project,
  ]);
  const intl = useIntl();

  const renderFilters = () => (
    <React.Fragment>
      <S.FilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="admin.fields.proposal.map.zone" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.map.zone' })}>
            <DropdownSelect
              shouldOverflow
              value={parameters.filters.district}
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_DISTRICT_FILTER',
                  payload: ((newValue: any): ProposalsDistrictValues),
                });
              }}
              title={intl.formatMessage({ id: 'admin.fields.proposal.map.zone' })}>
              <DropdownSelect.Choice value="ALL">
                {intl.formatMessage({ id: 'global.select_districts' })}
              </DropdownSelect.Choice>
              {districts.map(district => (
                <DropdownSelect.Choice key={district.id} value={district.id}>
                  {district.name}
                </DropdownSelect.Choice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
        <FilterTag
          onClose={() => {
            dispatch({ type: 'CLEAR_DISTRICT_FILTER' });
          }}
          icon={<i className="cap cap-marker-1" />}
          show={parameters.filters.district !== 'ALL'}>
          {districts.find(d => d.id === parameters.filters.district)?.name || null}
        </FilterTag>
      </S.FilterContainer>
      <S.FilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="admin.fields.proposal.category" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.category' })}>
            <DropdownSelect
              value={parameters.filters.category}
              onChange={newValue => {
                dispatch({
                  type: 'CHANGE_CATEGORY_FILTER',
                  payload: ((newValue: any): ProposalsCategoryValues),
                });
              }}
              title={intl.formatMessage({ id: 'admin.fields.proposal.category' })}>
              <DropdownSelect.Choice value="ALL">
                {intl.formatMessage({ id: 'global.select_categories' })}
              </DropdownSelect.Choice>
              {categories.map(cat => (
                <DropdownSelect.Choice key={cat.id} value={cat.id}>
                  {cat.name}
                </DropdownSelect.Choice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
        <FilterTag
          onClose={() => {
            dispatch({ type: 'CLEAR_CATEGORY_FILTER' });
          }}
          icon={<i className="cap cap-tag-1" />}
          show={parameters.filters.category !== 'ALL'}>
          {categories.find(c => c.id === parameters.filters.category)?.name || null}
        </FilterTag>
      </S.FilterContainer>
      <S.FilterContainer>
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage tagName="p" id="argument.sort.label" />
          </Collapsable.Button>
          <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'sort-by' })}>
            <DropdownSelect
              value={parameters.sort}
              onChange={newValue => {
                dispatch({ type: 'CHANGE_SORT', payload: ((newValue: any): SortValues) });
              }}
              title={intl.formatMessage({ id: 'sort-by' })}>
              <DropdownSelect.Choice value="newest">
                {intl.formatMessage({ id: 'global.filter_f_last' })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value="oldest">
                {intl.formatMessage({ id: 'global.filter_f_old' })}
              </DropdownSelect.Choice>
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      </S.FilterContainer>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {selectedRows.length > 0 ? (
        <React.Fragment>
          <FormattedMessage
            id="admin-proposals-list-selected"
            tagName="p"
            values={{
              itemCount: selectedRows.length,
            }}
          />
          <p>Action 1 quand select</p>
          <p>Action 2 quand select</p>
          <p>Action 3 quand select</p>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>
            {rowsCount} <FormattedMessage id="global.proposals" />
          </p>
          {renderFilters()}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export const ProjectAdminAnalysis = ({ project, relay }: Props) => {
  const hasProposals = !!project.firstAnalysisStep?.proposals?.totalCount && project.firstAnalysisStep?.proposals?.totalCount > 0;

  return (
    <PickableList.Provider>
      <S.ProposalPickableListContainer>
        <PickableList
          useInfiniteScroll={hasProposals}
          onScrollToBottom={() => {
            relay.loadMore(PROJECT_ADMIN_PROPOSAL_PAGINATION);
          }}
          hasMore={project.firstAnalysisStep?.proposals?.pageInfo.hasNextPage}
          loader={<ProposalListLoader key="loader" />}>
          <ProposalListHeaderContainer>
            <ProposalListHeader project={project} />
          </ProposalListHeaderContainer>
          <PickableList.Body>
            {hasProposals ? (
              project.firstAnalysisStep?.proposals?.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(proposal => (
                  <S.ProposalListRow key={proposal.id} rowId={proposal.id}>
                    <h2>
                      <a href={proposal.adminUrl}>{proposal.title}</a>
                    </h2>
                    <S.ProposalListRowInformations>
                      <p>
                        #{proposal.reference} • {proposal.author.username}
                        {proposal.publishedAt && (
                          <React.Fragment>
                            {' '}
                            • <FormattedMessage id="submited_on" />{' '}
                            <FormattedDate
                              value={moment(proposal.publishedAt)}
                              day="numeric"
                              month="long"
                              year="numeric"
                            />
                          </React.Fragment>
                        )}
                      </p>
                    </S.ProposalListRowInformations>
                    <S.ProposalListRowMeta>
                      {proposal.district && (
                        <Tag size="10px" icon="cap cap-marker-1 ">
                          {proposal.district.name}
                        </Tag>
                      )}
                      {proposal.category && (
                        <Tag size="10px" icon="cap cap-tag-1 ">
                          {proposal.category.name}
                        </Tag>
                      )}
                    </S.ProposalListRowMeta>
                  </S.ProposalListRow>
                ))
            ) : (
              <S.ProposalListNoContributions>
                <S.NoContributionIcon />
                <FormattedMessage id="global.no_proposals" tagName="p" />
              </S.ProposalListNoContributions>
            )}
          </PickableList.Body>
        </PickableList>
      </S.ProposalPickableListContainer>
    </PickableList.Provider>
  );
};

export default createPaginationContainer(
  ProjectAdminAnalysis,
  {
    project: graphql`
      fragment ProjectAdminAnalysis_project on Project
        @argumentDefinitions(
          projectId: { type: "ID!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: {
            type: "ProposalOrder!"
            defaultValue: { field: PUBLISHED_AT, direction: DESC }
          }
          category: { type: "ID", defaultValue: null }
          district: { type: "ID", defaultValue: null }
          status: { type: "ID", defaultValue: null }
          term: { type: "String", defaultValue: null }
        ) {
        id
        steps {
        __typename
        ... on ProposalStep {
          form {
            districts {
              id
              name
            }
            categories {
              id
              name
            }
          }
        }
        }
        firstAnalysisStep {
          proposals(
            first: $count
            after: $cursor
            orderBy: $orderBy
            category: $category
            district: $district
            term: $term
          )
          @connection(
            key: "ProjectAdminAnalysis_proposals"
            filters: ["orderBy", "category", "district", "term"]
          ) {
          totalCount
          pageInfo {
            hasNextPage
          }
           edges {
            node {
              author {
                id
                username
              }
              adminUrl
              publishedAt
              district {
                id
                name
              }
              category {
                id
                name
              }
              reference(full: false)
              id
              title
            }
            cursor
          }
          }
        }
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
      return props.project && props.project.firstAnalysisStep && props.project.firstAnalysisStep.proposals;
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
      };
    },
    query: graphql`
      query ProjectAdminAnalysisPaginatedQuery(
        $projectId: ID!
        $count: Int!
        $cursor: String
        $orderBy: ProposalOrder!
        $category: ID
        $district: ID
        $term: String
      ) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminAnalysis_project
            @arguments(
              projectId: $projectId
              count: $count
              cursor: $cursor
              orderBy: $orderBy
              category: $category
              district: $district
              term: $term
            )
        }
      }
    `,
  },
);

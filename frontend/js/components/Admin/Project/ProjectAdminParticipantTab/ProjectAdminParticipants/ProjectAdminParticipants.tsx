import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import type { RelayPaginationProp } from 'react-relay'
import { createFragmentContainer, createPaginationContainer, graphql } from 'react-relay'
import { useDisclosure } from '@liinkiing/react-hooks'
import { connect } from 'react-redux'
import PickableList from '~ui/List/PickableList'
import { usePickableList } from '~ui/List/PickableList/usePickableList'
import DropdownSelect from '~ui/DropdownSelect'
import Collapsable from '~ui/Collapsable'
import { getAllFormattedChoicesForProject, getDifferenceFilters } from '../ProjectAdminParticipants.utils'
import { useProjectAdminParticipantsContext } from '../ProjectAdminParticipant.context'
import type { SortValues, Action } from '../ProjectAdminParticipant.reducer'
import {
  AnalysisPickableListContainer,
  AnalysisProposalListFiltersAction,
  AnalysisProposalListFiltersContainer,
  AnalysisProposalListFiltersList,
  AnalysisProposalListHeaderContainer,
} from '~ui/Analysis/common.style'
import AnalysisProposalListLoader from '~/components/Analysis/AnalysisProposalListLoader/AnalysisProposalListLoader'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import FilterTag from '~ui/Analysis/FilterTag'
import AnalysisFilterSort from '~/components/Analysis/AnalysisFilter/AnalysisFilterSort'
import ProjectAdminParticipant from '../ProjectAdminParticipant/ProjectAdminParticipant'
import ClearableInput from '~ui/Form/Input/ClearableInput'
import { HeaderContainer, ButtonSendMail } from './ProjetAdminParticipants.style'
import NoParticipant from '~/components/Admin/Project/ProjectAdminParticipantTab/NoParticipant/NoParticipant'
import ExportButton from '~/components/Admin/Project/ExportButton/ExportButton'
import type { ProjectAdminParticipants_project } from '~relay/ProjectAdminParticipants_project.graphql'
import colors from '~/styles/modules/colors'
import ModalCreateMailingList from '~/components/Admin/Project/ProjectAdminParticipantTab/ModalCreateMailingList/ModalCreateMailingList'
import type { GlobalState } from '~/types'
import { clearToasts } from '~ds/Toast'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import Tooltip from '~ds/Tooltip/Tooltip'
import type { ProjectAdminParticipants_viewer } from '~relay/ProjectAdminParticipants_viewer.graphql'
import { Box, Flex } from '@cap-collectif/ui'

export const PROJECT_ADMIN_PARTICIPANT_PAGINATION = 30
type Props = {
  readonly relay: RelayPaginationProp
  readonly project: ProjectAdminParticipants_project
  readonly viewer: ProjectAdminParticipants_viewer
  readonly viewerIsAdmin: boolean
}
type HeaderProps = {
  readonly project: ProjectAdminParticipants_project
  readonly showModalCreateMailingList: (arg0: boolean) => void
  readonly refusingCount: number
}

const countSelectedNotConsenting = (project: ProjectAdminParticipants_project, selectedIds: string[]): number => {
  return (
    project.participants?.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(node => node && selectedIds.includes(node.id))
      .filter(node => !node.consentInternalCommunication).length ?? 0
  )
}

const DashboardHeader = ({ project, showModalCreateMailingList, refusingCount }: HeaderProps) => {
  const { selectedRows, rowsCount } = usePickableList()
  const { parameters, dispatch } = useProjectAdminParticipantsContext()
  const intl = useIntl()
  const hasFeatureEmail = useFeatureFlag('emailing')
  const hasFeaturePaperVote = useFeatureFlag('paper_vote')
  const { steps, userTypes, filtersOrdered } = React.useMemo(
    () => getAllFormattedChoicesForProject(project, parameters.filtersOrdered),
    [project, parameters.filtersOrdered],
  )
  const renderFilters = (
    <>
      <Collapsable align="right">
        <Collapsable.Button>
          <FormattedMessage id="admin.label.step" />
        </Collapsable.Button>
        <Collapsable.Element
          ariaLabel={intl.formatMessage({
            id: 'filter-by',
          })}
        >
          <DropdownSelect
            shouldOverflow
            value={parameters.filters.step}
            defaultValue="ALL"
            onChange={newValue =>
              dispatch({
                type: 'CHANGE_STEP_FILTER',
                payload: newValue,
              })
            }
            title={intl.formatMessage({
              id: 'filter-by',
            })}
          >
            <DropdownSelect.Choice value="ALL">
              {intl.formatMessage({
                id: 'every-step',
              })}
            </DropdownSelect.Choice>
            {steps.map(step => (
              <DropdownSelect.Choice key={step.id} value={step.id}>
                {step.title}
              </DropdownSelect.Choice>
            ))}
          </DropdownSelect>
        </Collapsable.Element>
      </Collapsable>

      {userTypes?.length > 0 && (
        <Collapsable align="right">
          <Collapsable.Button>
            <FormattedMessage id="admin.fields.source.category" />
          </Collapsable.Button>
          <Collapsable.Element
            ariaLabel={intl.formatMessage({
              id: 'filter-by',
            })}
          >
            <DropdownSelect
              shouldOverflow
              value={parameters.filters.type}
              defaultValue="ALL"
              onChange={newValue =>
                dispatch({
                  type: 'CHANGE_TYPE_FILTER',
                  payload: newValue,
                })
              }
              title={intl.formatMessage({
                id: 'filter-by',
              })}
            >
              <DropdownSelect.Choice value="ALL">
                {intl.formatMessage({
                  id: 'global.select_user.type',
                })}
              </DropdownSelect.Choice>
              {userTypes.map(userType => (
                <DropdownSelect.Choice value={userType.id} key={userType.id}>
                  {intl.formatMessage({
                    id: userType.name,
                  })}
                </DropdownSelect.Choice>
              ))}
            </DropdownSelect>
          </Collapsable.Element>
        </Collapsable>
      )}

      <AnalysisFilterSort
        isParticipant
        value={parameters.sort}
        onChange={newValue => {
          dispatch({
            type: 'CHANGE_SORT',
            payload: newValue as any as SortValues,
          })
        }}
      />
    </>
  )
  return (
    <React.Fragment>
      {selectedRows.length > 0 && hasFeatureEmail ? (
        <React.Fragment>
          <FormattedMessage
            id="admin-proposals-list-selected"
            tagName="p"
            values={{
              itemCount: selectedRows.length,
            }}
          />
          {selectedRows.length <= refusingCount && (
            <Tooltip
              label={intl.formatMessage({
                id: 'send-mail-no-consenting',
              })}
            >
              <ButtonSendMail type="button" onClick={() => showModalCreateMailingList(true)} disabled="true">
                <Icon name={ICON_NAME.sendMail} color={colors.blue[300]} size={16} />
                <FormattedMessage id="send-mail" />
              </ButtonSendMail>
            </Tooltip>
          )}
          {selectedRows.length > refusingCount && (
            <ButtonSendMail type="button" onClick={() => showModalCreateMailingList(true)}>
              <Icon name={ICON_NAME.sendMail} color={colors.blue[500]} size={16} />
              <FormattedMessage id="send-mail" />
            </ButtonSendMail>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Flex as="p" alignItems="center" spacing={1}>
            <span>{rowsCount} </span>
            <FormattedMessage
              id="project.preview.counters.contributors"
              values={{
                num: rowsCount,
              }}
            />{' '}
            {hasFeaturePaperVote && (
              <Tooltip
                maxWidth="200px"
                label={intl.formatMessage({
                  id: 'warning-paper-contributions-not-counted',
                })}
              >
                <span>
                  <Icon name={ICON_NAME.information} size={12} color={colors.gray[500]} />
                </span>
              </Tooltip>
            )}
          </Flex>
          <AnalysisProposalListFiltersContainer>
            <AnalysisProposalListFiltersAction>{renderFilters}</AnalysisProposalListFiltersAction>
            {filtersOrdered.length > 0 && selectedRows.length === 0 && (
              <AnalysisProposalListFiltersList>
                {filtersOrdered.map(({ id, name, action, icon, color }) => (
                  <FilterTag
                    key={id}
                    onClose={
                      action
                        ? () =>
                            dispatch({
                              type: action,
                            } as any as Action)
                        : null
                    }
                    icon={icon ? <Icon name={ICON_NAME[icon]} size="1rem" color="#fff" /> : null}
                    bgColor={color}
                  >
                    {name}
                  </FilterTag>
                ))}
              </AnalysisProposalListFiltersList>
            )}
          </AnalysisProposalListFiltersContainer>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

export const ProjectAdminParticipants = ({ project, relay, viewerIsAdmin, viewer }: Props) => {
  const { parameters, status, dispatch } = useProjectAdminParticipantsContext()
  const { selectedRows } = usePickableList()
  const refusingCount = countSelectedNotConsenting(project, selectedRows)
  const intl = useIntl()
  const hasFeatureEmail = useFeatureFlag('emailing')
  const hasParticipants = project.participants?.totalCount > 0
  const hasSelectedFilters = getDifferenceFilters(parameters.filters)
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  React.useEffect(() => {
    clearToasts()
  })
  return (
    <Box
      sx={{
        'ul.inline-list': { display: 'flex' },
        'ul.inline-list li': { display: 'flex', alignItems: 'center' },
        'ul.inline-list li > button': { display: 'flex', alignItems: 'center' },
      }}
    >
      <AnalysisPickableListContainer>
        <HeaderContainer>
          {viewerIsAdmin && project.exportableSteps && (
            <ExportButton
              hasMarginRight
              disabled={!hasParticipants}
              linkHelp="https://aide.cap-collectif.com/article/67-exporter-les-contributions-dun-projet-participatif"
              onChange={stepId => {
                window.open(`/export-step-contributors/${stepId}`, '_blank')
              }}
            >
              {project.exportableSteps.filter(Boolean).map(({ step }) => {
                if (step.contributors && step.contributors.totalCount > 0) {
                  return (
                    <DropdownSelect.Choice key={step.id} value={step.id} className="export-option">
                      {step.title}
                    </DropdownSelect.Choice>
                  )
                }

                return null
              })}
            </ExportButton>
          )}

          <ClearableInput
            id="search"
            name="search"
            disabled={!hasParticipants}
            type="text"
            icon={<i className="cap cap-magnifier" />}
            onClear={() => {
              if (parameters.filters.term !== null) {
                dispatch({
                  type: 'CLEAR_TERM',
                })
              }
            }}
            initialValue={parameters.filters.term}
            onSubmit={term => {
              if (term === '' && parameters.filters.term !== null) {
                dispatch({
                  type: 'CLEAR_TERM',
                })
              } else if (term !== '' && parameters.filters.term !== term) {
                dispatch({
                  type: 'SEARCH_TERM',
                  payload: term,
                })
              }
            }}
            placeholder={intl.formatMessage({
              id: 'global.menu.search',
            })}
          />
        </HeaderContainer>

        <PickableList
          isLoading={status === 'loading'}
          useInfiniteScroll={hasParticipants}
          onScrollToBottom={() => {
            relay.loadMore(PROJECT_ADMIN_PARTICIPANT_PAGINATION)
          }}
          hasMore={project.participants?.pageInfo.hasNextPage}
          loader={<AnalysisProposalListLoader key="loader" />}
        >
          <AnalysisProposalListHeaderContainer
            disabled={!hasSelectedFilters && !hasParticipants}
            isSelectable={hasFeatureEmail}
          >
            <DashboardHeader project={project} showModalCreateMailingList={onOpen} refusingCount={refusingCount} />
          </AnalysisProposalListHeaderContainer>

          <PickableList.Body>
            {hasParticipants ? (
              project.participants?.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(participant => (
                  <ProjectAdminParticipant
                    participant={participant}
                    key={participant.id}
                    rowId={participant.id}
                    selected={selectedRows.includes(participant.id)}
                  />
                ))
            ) : (
              <NoParticipant />
            )}
          </PickableList.Body>
        </PickableList>

        <ModalCreateMailingList
          show={isOpen}
          onClose={onClose}
          members={selectedRows}
          refusingCount={refusingCount}
          project={project}
          viewer={viewer}
        />
      </AnalysisPickableListContainer>
    </Box>
  )
}
const ProjectAdminParticipantsRelay = createPaginationContainer(
  ProjectAdminParticipants,
  {
    project: graphql`
      fragment ProjectAdminParticipants_project on Project
      @argumentDefinitions(
        viewerIsAdmin: { type: "Boolean!" }
        count: { type: "Int!" }
        cursor: { type: "String" }
        orderBy: { type: "UserOrder!", defaultValue: { field: ACTIVITY, direction: DESC } }
        term: { type: "String", defaultValue: null }
        userType: { type: "ID" }
        step: { type: "ID" }
        contribuableId: { type: "ID" }
      ) {
        id
        title
        steps {
          __typename
          id
          title
        }
        exportableSteps @include(if: $viewerIsAdmin) {
          step {
            id
            title
            ... on DebateStep {
              contributors {
                totalCount
              }
            }
            ... on ConsultationStep {
              contributors {
                totalCount
              }
            }
            ... on CollectStep {
              contributors {
                totalCount
              }
            }
            ... on SelectionStep {
              contributors {
                totalCount
              }
            }
            ... on QuestionnaireStep {
              contributors {
                totalCount
              }
            }
          }
        }
        participants: contributors(
          first: $count
          after: $cursor
          orderBy: $orderBy
          term: $term
          userType: $userType
          step: $step
        ) @connection(key: "ProjectAdminParticipants_participants", filters: ["orderBy", "term", "userType"]) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              ... on User {
                consentInternalCommunication
                userType {
                  id
                  name
                }
              }
              ...ProjectAdminParticipant_participant
                @arguments(contribuableId: $contribuableId, viewerIsAdmin: $viewerIsAdmin)
            }
          }
        }
        ...ModalCreateMailingList_project
      }
    `,
  },
  {
    direction: 'forward',

    /*
     * Based on node_modules/react-relay/ReactRelayPaginationContainer.js.flow, when I ask something
     * in the pageInfo node, it forces me to include everything (e.g hasPrevPage, startCursor and
     * endCursor) but I only need `hasNextPage`
     * @ts-expect-error
     * */
    getConnectionFromProps(props: Props) {
      return props.project && props.project.participants
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, viewerIsAdmin: props.viewerIsAdmin, count, cursor }
    },

    query: graphql`
      query ProjectAdminParticipantsPaginatedQuery(
        $projectId: ID!
        $count: Int!
        $cursor: String
        $orderBy: UserOrder!
        $term: String
        $userType: ID
        $step: ID
        $contribuableId: ID
        $viewerIsAdmin: Boolean!
      ) {
        project: node(id: $projectId) {
          id
          ...ProjectAdminParticipants_project
            @arguments(
              count: $count
              cursor: $cursor
              orderBy: $orderBy
              term: $term
              userType: $userType
              step: $step
              contribuableId: $contribuableId
              viewerIsAdmin: $viewerIsAdmin
            )
        }
      }
    `,
  },
)

const mapStateToProps = (state: GlobalState) => ({
  viewerIsAdmin: state.user.user ? state.user.user.isAdmin : false,
})

const ProjectAdminParticipantsConnected = connect(mapStateToProps)(ProjectAdminParticipantsRelay)
export default createFragmentContainer(ProjectAdminParticipantsConnected, {
  viewer: graphql`
    fragment ProjectAdminParticipants_viewer on User {
      username
      ...ModalCreateMailingList_viewer
    }
  `,
})

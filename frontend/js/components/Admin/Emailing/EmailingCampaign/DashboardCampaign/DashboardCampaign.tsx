import * as React from 'react'
import type { RelayPaginationProp } from 'react-relay'
import { createPaginationContainer, graphql } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import PickableList from '~ui/List/PickableList'
import { usePickableList } from '~ui/List/PickableList/usePickableList'
import Collapsable from '~ui/Collapsable'
import DropdownSelect from '~ui/DropdownSelect'
import { useDashboardCampaignContext } from './DashboardCampaign.context'
import type { CampaignsStateValues } from './DashboardCampaign.reducer'
import { ORDER_BY } from './DashboardCampaign.reducer'
import * as S from './DashboardCampaign.style'
import InlineSelect from '~ui/InlineSelect'
import ClearableInput from '~ui/Form/Input/ClearableInput'
import CampaignItem from '~/components/Admin/Emailing/EmailingCampaign/CampaignItem/CampaignItem'
import EmailingLoader from '../../EmailingLoader/EmailingLoader'
import ModalConfirmDelete from '~/components/Admin/Emailing/EmailingCampaign/ModalConfirmDelete/ModalConfirmDelete'
import CreateEmailingCampaignMutation from '~/mutations/CreateEmailingCampaignMutation'
import FluxDispatcher from '~/dispatchers/AppDispatcher'
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants'
import NoCampaign from '~/components/Admin/Emailing/EmailingCampaign/NoCampaign/NoCampaign'
import ModalOnboarding from '~/components/Admin/Emailing/ModalOnboarding/ModalOnboarding'
import { CAMPAIGN_PAGINATION } from '../utils'
import type { DashboardCampaign_emailingCampaignOwner } from '~relay/DashboardCampaign_emailingCampaignOwner.graphql'
import type { DashboardCampaign_viewer } from '~relay/DashboardCampaign_viewer.graphql'
type Props = {
  relay: RelayPaginationProp
  emailingCampaignOwner: DashboardCampaign_emailingCampaignOwner
  viewer: DashboardCampaign_viewer
}
type HeaderProps = {
  emailingCampaignOwner: DashboardCampaign_emailingCampaignOwner
  viewer: DashboardCampaign_viewer
  showModalDelete: (arg0: boolean) => void
}

const createCampaign = (organizationId: string | null | undefined) => {
  return CreateEmailingCampaignMutation.commit({
    input: {
      owner: organizationId,
    },
  })
    .then(response => {
      if (response.createEmailingCampaign?.error) {
        return FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'global.error.server.form',
          },
        })
      }

      if (response.createEmailingCampaign?.emailingCampaign?.id) {
        window.location.replace(`/admin/mailingCampaign/edit/${response.createEmailingCampaign.emailingCampaign.id}`)
      }
    })
    .catch(() => {
      return FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      })
    })
}

const DashboardHeader = ({ emailingCampaignOwner, showModalDelete, viewer }: HeaderProps) => {
  const { campaigns } = emailingCampaignOwner
  const { selectedRows, rowsCount } = usePickableList()
  const { dispatch, parameters } = useDashboardCampaignContext()
  const intl = useIntl()

  const canDelete = () => {
    const viewerBelongsToAnOrganization = (viewer.organizations?.length ?? 0) > 0
    if (!viewerBelongsToAnOrganization) return true
    if (viewer?.isAdminOrganization) return true
    return campaigns?.edges?.every(edge => edge?.node?.creator?.id === viewer.id) ?? false
  }

  return (
    <React.Fragment>
      {selectedRows.length > 0 ? (
        <React.Fragment>
          <FormattedMessage
            id="global.selected.feminine.dynamic"
            values={{
              num: selectedRows.length,
            }}
            tagName="p"
          />

          {canDelete() && (
            <S.ButtonDelete type="button" onClick={() => showModalDelete(true)}>
              {intl.formatMessage({
                id: 'admin.global.delete',
              })}
            </S.ButtonDelete>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>
            {rowsCount}{' '}
            <FormattedMessage
              id="global-campaign"
              values={{
                num: campaigns.totalCount,
              }}
            />
          </p>

          <Collapsable align="right">
            <Collapsable.Button>
              <FormattedMessage id="argument.sort.label" />
            </Collapsable.Button>
            <Collapsable.Element
              ariaLabel={intl.formatMessage({
                id: 'sort-by',
              })}
            >
              <DropdownSelect
                shouldOverflow
                value={parameters.sort}
                defaultValue={ORDER_BY.NEWEST}
                onChange={newValue =>
                  dispatch({
                    type: 'CHANGE_SORT',
                    payload: newValue,
                  })
                }
                title={intl.formatMessage({
                  id: 'sort-by',
                })}
              >
                <DropdownSelect.Choice value={ORDER_BY.NEWEST}>
                  {intl.formatMessage({
                    id: 'global.filter_f_last',
                  })}
                </DropdownSelect.Choice>
                <DropdownSelect.Choice value={ORDER_BY.OLDEST}>
                  {intl.formatMessage({
                    id: 'global.filter_f_old',
                  })}
                </DropdownSelect.Choice>
              </DropdownSelect>
            </Collapsable.Element>
          </Collapsable>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

export const DashboardCampaign = ({ viewer, relay, emailingCampaignOwner }: Props) => {
  const { campaigns, campaignsAll, campaignsDraft, campaignsSent, campaignsPlanned } = emailingCampaignOwner
  const intl = useIntl()
  const { selectedRows } = usePickableList()
  const { parameters, dispatch, status } = useDashboardCampaignContext()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const hasCampaigns = campaigns.totalCount > 0
  const organization = viewer?.organizations?.[0]
  return (
    <>
      <S.Header>
        <InlineSelect
          value={parameters.filters.state}
          onChange={newValue => {
            dispatch({
              type: 'CHANGE_STATE_FILTER',
              payload: newValue as any as CampaignsStateValues,
            })
          }}
        >
          <InlineSelect.Choice value="ALL">
            <FormattedMessage
              id="filter.count.status.all"
              values={{
                num: campaignsAll.totalCount,
              }}
            />
          </InlineSelect.Choice>
          <InlineSelect.Choice value="SENT">
            <FormattedMessage
              id="filter.count.status.sent"
              values={{
                num: campaignsSent.totalCount,
              }}
            />
          </InlineSelect.Choice>
          <InlineSelect.Choice value="PLANNED">
            <FormattedMessage
              id="filter.count.status.planned"
              values={{
                num: campaignsPlanned.totalCount,
              }}
            />
          </InlineSelect.Choice>
          <InlineSelect.Choice value="DRAFT">
            <FormattedMessage
              id="filter.count.status.draft"
              values={{
                num: campaignsDraft.totalCount,
              }}
            />
          </InlineSelect.Choice>
        </InlineSelect>

        <div>
          <ClearableInput
            id="search"
            name="search"
            type="text"
            icon={<i className="cap cap-magnifier" />}
            disabled={!hasCampaigns}
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

          <S.ButtonCreate
            type="button"
            onClick={() => {
              createCampaign(organization?.id)
            }}
          >
            <FormattedMessage id="create-mail" />
          </S.ButtonCreate>
        </div>
      </S.Header>

      <PickableList
        isLoading={status === 'loading'}
        useInfiniteScroll={hasCampaigns}
        onScrollToBottom={() => {
          relay.loadMore(CAMPAIGN_PAGINATION)
        }}
        hasMore={campaigns?.pageInfo.hasNextPage}
        loader={<EmailingLoader key="loader" />}
      >
        <S.DashboardCampaignHeader isSelectable={hasCampaigns} disabled={!hasCampaigns}>
          <DashboardHeader emailingCampaignOwner={emailingCampaignOwner} showModalDelete={onOpen} viewer={viewer} />
        </S.DashboardCampaignHeader>

        <PickableList.Body>
          {hasCampaigns ? (
            campaigns?.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(campaign => (
                <CampaignItem
                  campaign={campaign}
                  rowId={campaign.id}
                  key={campaign.id}
                  selected={selectedRows.includes(campaign.id)}
                />
              ))
          ) : (
            <NoCampaign />
          )}
        </PickableList.Body>
      </PickableList>

      <ModalConfirmDelete show={isOpen} onClose={onClose} campaignsIds={selectedRows} />
      <ModalOnboarding isOnlyProjectAdmin={viewer.isOnlyProjectAdmin} />
    </>
  )
}
export default createPaginationContainer(
  DashboardCampaign,
  {
    emailingCampaignOwner: graphql`
      fragment DashboardCampaign_emailingCampaignOwner on EmailingCampaignOwner
      @argumentDefinitions(
        count: { type: "Int" }
        cursor: { type: "String" }
        term: { type: "String", defaultValue: null }
        orderBy: { type: EmailingCampaignOrder, defaultValue: { field: SEND_AT, direction: DESC } }
        status: { type: EmailingCampaignStatusFilter, defaultValue: null }
        affiliations: { type: "[EmailingCampaignAffiliation!]" }
      ) {
        campaigns: emailingCampaigns(
          first: $count
          after: $cursor
          term: $term
          orderBy: $orderBy
          status: $status
          affiliations: $affiliations
        ) @connection(key: "DashboardCampaign_campaigns", filters: ["term", "orderBy", "status"]) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              status
              creator {
                id
              }
              ...CampaignItem_campaign
            }
          }
        }
        campaignsAll: emailingCampaigns(status: null, affiliations: $affiliations) {
          totalCount
        }
        campaignsDraft: emailingCampaigns(status: DRAFT, affiliations: $affiliations) {
          totalCount
        }
        campaignsSent: emailingCampaigns(status: SENT, affiliations: $affiliations) {
          totalCount
        }
        campaignsPlanned: emailingCampaigns(status: PLANNED, affiliations: $affiliations) {
          totalCount
        }
      }
    `,
    viewer: graphql`
      fragment DashboardCampaign_viewer on User {
        id
        isOnlyProjectAdmin
        isAdminOrganization
        organizations {
          id
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
     * @ts-expect-error
     * */
    getConnectionFromProps({ emailingCampaignOwner }: Props) {
      return emailingCampaignOwner?.campaigns
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor }
    },

    query: graphql`
      query DashboardCampaignPaginatedQuery(
        $count: Int
        $cursor: String
        $term: String
        $orderBy: EmailingCampaignOrder
        $status: EmailingCampaignStatusFilter
        $affiliations: [EmailingCampaignAffiliation!]
      ) {
        viewer {
          ...DashboardCampaign_viewer
          ...DashboardCampaign_emailingCampaignOwner
            @arguments(
              count: $count
              cursor: $cursor
              term: $term
              orderBy: $orderBy
              status: $status
              affiliations: $affiliations
            )
          organizations {
            ...DashboardCampaign_emailingCampaignOwner
              @arguments(
                count: $count
                cursor: $cursor
                term: $term
                orderBy: $orderBy
                status: $status
                affiliations: $affiliations
              )
          }
        }
      }
    `,
  },
)

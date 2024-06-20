import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { Text, CapUIIconSize, Menu, ButtonQuickAction, CapUIIcon } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import type { GlobalState } from '~/types'
import EventDeleteModal from './EventDeleteModal'
import type { EventReviewStatus } from '~relay/EventPageHeader_query.graphql'
import { fromGlobalId } from '~/utils/fromGlobalId'
type Props = {
  readonly id: string
  readonly status: EventReviewStatus | null | undefined
  readonly viewerDidAuthor: boolean | null | undefined
}
export const EventQuickActions = ({ id, status, viewerDidAuthor }: Props) => {
  const intl = useIntl()
  const hasProposeEventEnabled = useFeatureFlag('allow_users_to_propose_events')
  const eventIsApproved = status === 'APPROVED'
  const adminRoles = useSelector((state: GlobalState) => state.user.user?.roles ?? [])
  const isSuperAdmin = adminRoles.includes('ROLE_SUPER_ADMIN')
  const isAdmin = adminRoles.includes('ROLE_ADMIN')
  const isValid = hasProposeEventEnabled && viewerDidAuthor && eventIsApproved

  if (isSuperAdmin || isAdmin || isValid)
    return (
      <Menu
        disclosure={
          <ButtonQuickAction
            border="none"
            icon={CapUIIcon.More}
            size={CapUIIconSize.Md}
            variantColor="blue"
            label={intl.formatMessage({
              id: 'global.plus',
            })}
            height="32px"
          />
        }
      >
        <Menu.List>
          {isSuperAdmin || isAdmin || viewerDidAuthor ? (
            <Menu.Item
              as="div"
              sx={{
                cursor: 'pointer',
              }}
              onClick={() => window.open(`/export-my-event-participants/${fromGlobalId(id).id}`, '_self')}
              id="download-event-registration"
            >
              <Text>
                {' '}
                {intl.formatMessage({
                  id: 'export-registered',
                })}{' '}
              </Text>
            </Menu.Item>
          ) : null}
          {eventIsApproved || isSuperAdmin ? (
            <EventDeleteModal
              eventId={id}
              disclosure={
                <Menu.Item
                  as="div"
                  sx={{
                    cursor: 'pointer',
                  }}
                  closeOnSelect={false}
                >
                  <Text>
                    {' '}
                    {intl.formatMessage({
                      id: 'global.delete',
                    })}{' '}
                  </Text>
                </Menu.Item>
              }
            />
          ) : null}
        </Menu.List>
      </Menu>
    )
  return null
}
export default EventQuickActions

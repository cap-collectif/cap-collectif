import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import moment from 'moment'
import { FormattedMessage, useIntl } from 'react-intl'
import type { ProjectAdminParticipant_participant } from '~relay/ProjectAdminParticipant_participant.graphql'
import { Container, UsernameContainer, NameContainer, ParticipantInfo } from './ProjectAdminParticipant.style'
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy'
import InlineList from '~ui/List/InlineList'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import colors, { styleGuideColors } from '~/utils/colors'
import { translateContent } from '~/utils/ContentTranslator'
import { useProjectAdminParticipantsContext } from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipant.context'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import Tooltip from '~ds/Tooltip/Tooltip'
import Text from '~ui/Primitives/Text'
export type OwnProps = {
  readonly rowId: string
  readonly selected: boolean
}
type Props = OwnProps & {
  readonly participant: ProjectAdminParticipant_participant
}

const ProjectAdminParticipant = ({ participant, selected }: Props) => {
  const intl = useIntl()
  const { dispatch } = useProjectAdminParticipantsContext()
  const hasFeatureEmail = useFeatureFlag('emailing')
  const {
    id,
    username,
    url,
    adminUrl,
    firstname,
    lastname,
    lastLogin,
    email,
    vip,
    votes,
    contributions,
    userType,
    isEmailConfirmed,
    consentInternalCommunication,
  } = participant

  const hasCompleteName = !!firstname && !!lastname
  const hasAccountDeleted = username === 'deleted-user'
  return (
    <Container rowId={id} selected={selected} isSelectable={hasFeatureEmail}>
      <ParticipantInfo>
        <UsernameContainer>
          {
              participant.__typename === 'User' && (<a href={adminUrl ?? url}>{translateContent(username)}</a>)
          }
          {
            (participant.__typename === 'Participant') ? <Text fontWeight={600}>{intl.formatMessage({ id: 'accompanied-participants' })}</Text> : null
          }
          {vip && !hasAccountDeleted && (
            <Tooltip
              placement="top"
              label={intl.formatMessage({
                id: 'status.vip.account',
              })}
              id="tooltip-description"
              className="text-left"
              style={{
                wordBreak: 'break-word',
              }}
            >
              <div>
                <Icon name={ICON_NAME.vip} size={14} />
              </div>
            </Tooltip>
          )}

          {isEmailConfirmed && !vip && !hasAccountDeleted && (
            <Tooltip
              placement="top"
              label={intl.formatMessage({
                id: 'status.verified.account',
              })}
              id="tooltip-description"
              className="text-left"
              style={{
                wordBreak: 'break-word',
              }}
            >
              <div>
                <Icon name={ICON_NAME.verified} size={14} />
              </div>
            </Tooltip>
          )}

          {hasFeatureEmail && consentInternalCommunication && (
            <Tooltip
              placement="top"
              label={intl.formatMessage(
                {
                  id: 'has-consent-to-internal-email',
                },
                {
                  num: 1,
                },
              )}
              id="tooltip-description"
              className="text-left"
              style={{
                wordBreak: 'break-word',
              }}
            >
              <div>
                <Icon name={ICON_NAME.mail} size={14} color={styleGuideColors.gray500} />
              </div>
            </Tooltip>
          )}
        </UsernameContainer>

        {(lastLogin || hasCompleteName) && (
          <NameContainer>
            {hasCompleteName && <span>{`${firstname} ${lastname}`}</span>}
            {hasCompleteName && lastLogin && <span className="separator">•</span>}
            {lastLogin && (
              <FormattedMessage
                id="active.on.date"
                values={{
                  date: moment(lastLogin).format('ll'),
                }}
              />
            )}
          </NameContainer>
        )}

        <InlineList separator=" ">
          {!hasAccountDeleted && userType && (
            <li>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'CHANGE_TYPE_FILTER',
                    payload: userType.id,
                  })
                }
              >
                <Icon name={ICON_NAME.singleManFilled} size={12} color={colors.darkGray} />
                <span>{userType.name}</span>
              </button>
            </li>
          )}

          {email && (
            <li>
              <Icon name={ICON_NAME.paperPlane} size={12} color={colors.darkGray} />
              <span>{email}</span>
            </li>
          )}
          {
            votes?.totalCount ? (
                <li>
                  <Icon name={ICON_NAME.like} size={12} color={colors.darkGray} />
                  <FormattedMessage
                      id="global.votes"
                      values={{
                        num: votes.totalCount,
                      }}
                  />
                </li>
            ) : null
          }
          {
            contributions?.totalCount ? (
                <li>
                  <Icon name={ICON_NAME.messageBubbleFilled} size={12} color={colors.darkGray} />
                  <FormattedMessage
                      id="synthesis.common.elements.nb"
                      values={{
                        num: contributions.totalCount,
                      }}
                  />
                </li>
            ) : null
          }
        </InlineList>
      </ParticipantInfo>

      <UserAvatarLegacy user={participant} size={42} />
    </Container>
  )
}

const ProjectAdminParticipantRelay = createFragmentContainer(ProjectAdminParticipant, {
  participant: graphql`
    fragment ProjectAdminParticipant_participant on Contributor
    @argumentDefinitions(contribuableId: { type: "ID" }, viewerIsAdmin: { type: "Boolean!" }) {
      __typename
      id
      firstname
      lastname
      email
      votes(contribuableId: $contribuableId) {
          totalCount
      }
      ...on User {
        username
        adminUrl @include(if: $viewerIsAdmin)
        url
        lastLogin
        vip
        isEmailConfirmed
        consentInternalCommunication
        userType {
          id
          name
        }
        contributions(contribuableId: $contribuableId, includeTrashed: true) {
          totalCount
        }
        ...UserAvatarLegacy_user
      }
    }
  `,
})
export default ProjectAdminParticipantRelay

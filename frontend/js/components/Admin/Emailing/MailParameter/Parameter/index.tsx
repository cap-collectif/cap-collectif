import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { Field } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useSelector } from 'react-redux'
import { Container } from '../common.style'
import { InstructionContainer, ButtonMembers } from './style'
import Icon, { ICON_NAME } from '~ds/Icon/Icon'
import ModalMembers from '~/components/Admin/Emailing/ModalMembers/ModalMembers'
import ModalInternalMembers from '~/components/Admin/Emailing/ModalMembers/ModalInternalMembers'
import type { Parameter_query$data } from '~relay/Parameter_query.graphql'
import type { Parameter_emailingCampaign$data } from '~relay/Parameter_emailingCampaign.graphql'
import Text from '~ui/Primitives/Text'
import Tooltip from '~ds/Tooltip/Tooltip'
import Flex from '~ui/Primitives/Layout/Flex'
import AppBox from '~ui/Primitives/AppBox'
import { LineHeight } from '~ui/Primitives/constants'
import type { GlobalState } from '~/types'
import type { Options } from '~/components/Form/Select'
import select from '~/components/Form/Select'
import { ModalGroupMembers } from '~/components/Admin/Emailing/ModalMembers/ModalGroupMembers'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import ModalProjectContributors from '~/components/Admin/Emailing/ModalMembers/ModalProjectContributors'
import type { Parameter_projectOwner$data } from '~relay/Parameter_projectOwner.graphql'
import type { Parameter_mailingListOwner$data } from '~relay/Parameter_mailingListOwner.graphql'

export const DEFAULT_MAILING_LIST = ['REGISTERED']
type Props = {
  emailingCampaign: Parameter_emailingCampaign$data
  query: Parameter_query$data
  disabled: boolean
  showError: boolean
  projectOwner: Parameter_projectOwner$data
  mailingListOwner: Parameter_mailingListOwner$data
}
export const getWordingMailingInternal = (mailingInternal: string, intl: IntlShape) => {
  switch (mailingInternal) {
    case 'REGISTERED':
      return intl.formatMessage({
        id: 'users',
      })

    default:
      return ''
  }
}
export const ParameterPage = ({
  emailingCampaign,
  query,
  disabled,
  showError,
  mailingListOwner,
  projectOwner,
}: Props) => {
  const { mailingListFragment, mailingInternal, emailingGroup, project } = emailingCampaign
  const {
    users,
    usersRefusing,
    senderEmails,
    groups,
    participants,
    participantsRefusing,
  } = query
  const { mailingLists } = mailingListOwner
  const { projects } = projectOwner
  const { user } = useSelector((state: GlobalState) => state.user)
  const emailingGroupEnabled = useFeatureFlag('emailing_group')
  const isAdmin = user ? user.isAdmin : false
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const hasMailingList = !!mailingListFragment || !!mailingInternal || !!emailingGroup || !!project
  const [countUsers, setCountUsers] = React.useState<number>(0)
  const [countUsersRefusing, setCountUsersRefusing] = React.useState<number>(0)
  const [mailingListValue, setMailingListValue] = React.useState<Options | null | undefined>(null)
  React.useEffect(() => {
    if (mailingInternal) {
      switch (mailingInternal) {
        case 'REGISTERED':
        default:
          setCountUsers(users.totalCount + participants.totalCount)
          setCountUsersRefusing(usersRefusing.totalCount + participantsRefusing.totalCount)
          break
      }
    }

    if (mailingListFragment) {
      setCountUsers(mailingListFragment.mailingListUsers.totalCount)
      setCountUsersRefusing(
        mailingListFragment.mailingListUsers.totalCount - mailingListFragment.mailingListUsersConsenting.totalCount,
      )
    }

    if (emailingGroup?.id && emailingGroupEnabled) {
      setCountUsers(emailingGroup.groupListUsers.totalCount)
      setCountUsersRefusing(emailingGroup.groupListUsersNotConsenting.totalCount)
    }

    if (project?.id) {
      setCountUsers(project.emailableContributors.totalCount + project.emailableContributors.refusingCount)
      setCountUsersRefusing(project.emailableContributors.refusingCount)
    }
  }, [
    mailingInternal,
    mailingListFragment,
    users.totalCount,
    usersRefusing.totalCount,
    emailingGroup,
    project,
    mailingListValue,
    emailingGroupEnabled,
    participants.totalCount,
    participantsRefusing.totalCount,
  ])

  const getMailingList = () => {
    return mailingLists?.edges
      ? mailingLists?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(m => ({
            value: m.id,
            label: m.name,
            ariaLabel: m.name,
          }))
      : []
  }

  const getUserGroupList = () => {
    if (groups && groups.edges && groups.totalCount > 0) {
      return groups.edges
        ?.filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(m => ({
          value: m.id,
          label: m.title,
          ariaLabel: m.title,
        }))
    }

    return []
  }

  const getProjectList = () => {
    if (projects && projects.edges && projects.totalCount > 0) {
      return projects.edges
        ?.filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(node => ({
          value: node.id,
          label: node.title,
          ariaLabel: node.title,
        }))
    }

    return []
  }

  const adminValues = () =>
    isAdmin
      ? [
          {
            value: 'REGISTERED',
            label: getWordingMailingInternal('REGISTERED', intl),
            ariaLabel: getWordingMailingInternal('REGISTERED', intl),
          },
        ]
      : []

  const mailingListValues = () => {
    const mailList = getMailingList().concat(adminValues())
    const groupList = emailingGroupEnabled ? getUserGroupList() : []
    const groupListOptions =
      groupList.length > 0
        ? [
            {
              label: `${intl.formatMessage({
                id: 'admin.label.group',
              })}:`,
              options: groupList,
            },
          ]
        : []
    const projectList = getProjectList()
    const projectListOptions =
      projectList.length > 0
        ? [
            {
              label: `${intl.formatMessage({
                id: 'project-participants',
              })}:`,
              options: projectList,
            },
          ]
        : []
    const displaySeveralOptions = groupList.length > 0 || projectList.length > 0
    const mailListOptions = displaySeveralOptions
      ? [
          {
            label: `${intl.formatMessage({
              id: 'admin-menu-emailing-list',
            })}:`,
            options: mailList,
          },
        ]
      : mailList

    if (displaySeveralOptions) {
      return [...mailListOptions, ...projectListOptions, ...groupListOptions]
    }

    return mailList
  }

  const mailingListPlaceHolder =
    emailingGroupEnabled && groups.totalCount > 0 && projects.totalCount > 0
      ? 'select-list-project-or-group'
      : emailingGroupEnabled && groups.totalCount > 0
      ? 'select-list-or-group'
      : projects.totalCount > 0
      ? 'select-list-or-project'
      : 'select-mailing-list'
  const displayConsultMembersButton = countUsers > 0 && countUsers > countUsersRefusing
  return (
    <Container disabled={disabled}>
      <h3>
        {intl.formatMessage({
          id: 'admin-title-parameter-mailing-list',
        })}
      </h3>

      <Field
        id="senderEmail"
        name="senderEmail"
        type="select"
        clearable={false}
        component={select}
        labelClassName="none"
        selectValue={emailingCampaign.senderEmail}
        label={intl.formatMessage({
          id: 'sender-address',
        })}
        placeholder={intl.formatMessage({
          id: 'global.placeholder.email',
        })}
        displayError={showError}
        options={senderEmails.map(senderEmail => ({
          value: senderEmail.address,
          label: senderEmail.address,
          ariaLabel: senderEmail.address,
        }))}
      />

      <Field
        id="mailingList"
        name="mailingList"
        type="select"
        disabled={disabled}
        component={select}
        label={intl.formatMessage({
          id: 'recipient',
        })}
        clearable
        displayError={showError}
        grouped={(groups.totalCount > 0 && emailingGroupEnabled) || projects.totalCount > 0}
        placeholder={intl.formatMessage({
          id: mailingListPlaceHolder,
        })}
        options={mailingListValues()}
        onChange={e => setMailingListValue(e)}
      />

      {hasMailingList && countUsers > 0 && (
        <Flex direction="column" align="flex-start" spacing={2}>
          <Flex>
            <Icon name={ICON_NAME.USER_O} size="md" color="gray.500" />
            <Text as="span">
              {countUsers - countUsersRefusing}{' '}
              {intl.formatMessage(
                {
                  id: 'global.members',
                },
                {
                  num: countUsers - countUsersRefusing,
                },
              )}
            </Text>
            <Tooltip
              label={intl.formatMessage(
                {
                  id: 'has-consent-to-internal-email',
                },
                {
                  num: countUsers - countUsersRefusing,
                },
              )}
            >
              <AppBox lineHeight={LineHeight.Normal}>
                <Icon name={ICON_NAME.CIRCLE_INFO} size="md" color="blue.500" />
              </AppBox>
            </Tooltip>

            {mailingListFragment?.project && (
              <>
                <Icon name={ICON_NAME.BOOK_STAR_O} size="md" color="gray.900" />
                <Text as="span">{mailingListFragment.project.title}</Text>
              </>
            )}
          </Flex>

          {displayConsultMembersButton && (
            <ButtonMembers type="button" onClick={onOpen}>
              {intl.formatMessage({
                id: 'consult-members',
              })}
            </ButtonMembers>
          )}
        </Flex>
      )}

      <InstructionContainer>
        <p
          dangerouslySetInnerHTML={{
            __html: intl.formatHTMLMessage(
              {
                id: 'admin-help-mailing-list-access',
              },
              {
                linkProject: '/admin-next/projects',
              },
            ),
          }}
        />
      </InstructionContainer>

      {hasMailingList &&
        (mailingInternal ? (
          <ModalInternalMembers show={isOpen} onClose={onClose} type={mailingInternal} />
        ) : (
          <ModalMembers show={isOpen} onClose={onClose} mailingList={mailingListFragment} />
        ))}
      {emailingGroup && emailingGroupEnabled && (
        <ModalGroupMembers show={isOpen} onClose={onClose} groupListRef={emailingGroup} isAdmin={isAdmin} />
      )}
      {project && <ModalProjectContributors show={isOpen} onClose={onClose} projectRef={project} isAdmin={isAdmin} />}
    </Container>
  )
}
export default createFragmentContainer(ParameterPage, {
  emailingCampaign: graphql`
    fragment Parameter_emailingCampaign on EmailingCampaign {
      emailingGroup {
        id
        title
        groupListUsersNotConsenting: users(first: 0, consentInternalCommunication: false) {
          totalCount
        }
        groupListUsers: users(first: 0) {
          totalCount
        }
        ...ModalGroupMembers_groupList
      }
      senderEmail
      mailingListFragment: mailingList {
        name
        project {
          title
        }
        mailingListUsers: users(first: 0) {
          totalCount
        }
        mailingListUsersConsenting: users(first: 0, consentInternalCommunicationOnly: true) {
          totalCount
        }
        ...ModalMembers_mailingList
      }
      mailingInternal
      project {
        id
        title
        emailableContributors {
          totalCount
          refusingCount
        }
        ...ModalProjectContributors_project
      }
    }
  `,
  query: graphql`
    fragment Parameter_query on Query {
      users(first: 0) {
        totalCount
      }
      usersRefusing: users(first: 0, consentInternalCommunication: false) {
        totalCount
      }
      participants(first: 0) {
          totalCount
      }
      participantsRefusing: participants(first: 0, consentInternalCommunication: false) {
          totalCount
      }
      senderEmails {
        id
        address
      }
      groups {
        totalCount
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `,
  mailingListOwner: graphql`
    fragment Parameter_mailingListOwner on MailingListOwner
    @argumentDefinitions(mlAffiliations: { type: "[MailingListAffiliation!]" }) {
      mailingLists(affiliations: $mlAffiliations) {
        totalCount
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `,
  projectOwner: graphql`
    fragment Parameter_projectOwner on ProjectOwner
    @argumentDefinitions(projectAffiliations: { type: "[ProjectAffiliation!]" }) {
      projects(affiliations: $projectAffiliations) {
        totalCount
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `,
})

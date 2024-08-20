import * as React from 'react'
import {
  Button,
  CapUISpotIcon,
  CapUISpotIconSize,
  Card,
  Flex,
  Heading,
  InputGroup,
  SpotIcon,
  Table,
  Text,
  Tag,
  toast,
  Tooltip,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import InviteOrganizationMemberMutation from '@mutations/InviteOrganizationMember'
import { formatConnectionPath } from '@utils/relay'
import OrganizationConfigFormDeleteMemberModal from './OrganizationConfigFormDeleteMemberModal'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { graphql, useFragment } from 'react-relay'
import {
  OrganizationConfigFormMembers_organization$key,
  OrganizationMemberRole,
} from '@relay/OrganizationConfigFormMembers_organization.graphql'
import { getMemberList } from './OrganizationConfigForm.utils'

export interface OrganizationConfigFormMembersProps {
  organization: OrganizationConfigFormMembers_organization$key
}
export enum StatusEnum {
  ACCEPTED = 'ACCEPTED',
  PENDING = 'PENDING',
}

export interface Member {
  user: {
    id: string
    username: string
    email: string
  }
  role: OrganizationMemberRole
  status: StatusEnum
}
const formName = 'organization_invite_form'
const FRAGMENT = graphql`
  fragment OrganizationConfigFormMembers_organization on Organization {
    id
    members(first: 50) @connection(key: "OrgIdQuery_members") {
      __id
      totalCount
      edges {
        node {
          user {
            id
            username
            email
          }
          role
        }
      }
    }
    pendingOrganizationInvitations(first: 50) @connection(key: "OrgIdQuery_pendingOrganizationInvitations") {
      __id
      totalCount
      edges {
        node {
          id
          createdAt
          user {
            id
            username
            email
          }
          role
          email
        }
      }
    }
    ...OrganizationConfigFormDeleteMemberModal_organization
  }
`

const OrganizationConfigFormMembers: React.FC<OrganizationConfigFormMembersProps> = ({ organization: orgRef }) => {
  const intl = useIntl()
  const organization = useFragment(FRAGMENT, orgRef)
  const membersList = getMemberList(organization)
  console.log(membersList)

  const organizationRoles = [
    {
      value: 'ADMIN',
      label: intl.formatMessage({ id: 'OrganizationAffiliation.ADMIN' }),
    },
    {
      value: 'USER',
      label: intl.formatMessage({ id: 'OrganizationAffiliation.USER' }),
    },
  ]
  const hasInvitations = membersList.length > 0
  const { handleSubmit, formState, control } = useForm<{
    memberEmail: string
    memberRole: 'ADMIN' | 'USER'
  }>({
    defaultValues: { memberEmail: undefined, memberRole: undefined },
    mode: 'onChange',
  })
  const onSubmit = (values: { memberEmail: string; memberRole: 'ADMIN' | 'USER' }) => {
    const connectionId = formatConnectionPath(
      ['client', organization.id || ''],
      'OrgIdQuery_pendingOrganizationInvitations',
    )
    InviteOrganizationMemberMutation.commit({
      input: {
        email: values?.memberEmail,
        organizationId: organization.id || '',
        role: values?.memberRole,
      },
      connections: [connectionId],
    })
      .then(response => {
        if (response.inviteOrganizationMember?.errorCode === 'USER_ALREADY_MEMBER') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({
              id: 'USER_ALREADY_MEMBER',
            }),
          })
        }
        if (response.inviteOrganizationMember?.errorCode === 'USER_NOT_ONLY_ROLE_USER') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({
              id: 'organization-invitation-user-not-only-user-error',
            }),
          })
        }
        if (response.inviteOrganizationMember?.errorCode === 'USER_ALREADY_MEMBER_OF_ANOTHER_ORGANIZATION') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({
              id: 'this-user-cannot-join-the-organization',
            }),
          })
        }
        if (!response?.inviteOrganizationMember?.errorCode) {
          toast({
            variant: 'success',
            content: intl.formatMessage(
              {
                id: 'organization.member.invite.success.toast',
              },
              {
                User: response?.inviteOrganizationMember?.invitation?.user?.username || values?.memberEmail,
              },
            ),
          })
        }
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
  }

  return (
    <Flex
      as={Card}
      direction="column"
      spacing={8}
      backgroundColor="white"
      style={{
        borderRadius: '8px',
        border: 'none',
      }}
    >
      <Heading as="h4" fontWeight="semibold" color="blue.800">
        {intl.formatMessage({ id: 'organisation.members' })}
      </Heading>
      <Flex direction="column" alignItems="center" justifyContent="center" spacing={1}>
        {!hasInvitations && (
          <>
            <SpotIcon name={CapUISpotIcon.ADD_CONTACT} size={CapUISpotIconSize.Lg} />
            <Heading color="blue.900" as="h4" fontWeight="bold">
              {intl.formatMessage({ id: 'organisation.invite.title' })}
            </Heading>
            <Text color="blue.900" mb={4}>
              {intl.formatMessage({ id: 'organisation.invite.body' })}
            </Text>
          </>
        )}
        <Flex as="form" id={formName} width={hasInvitations ? '100%' : 'auto'}>
          <InputGroup wrap="nowrap" width={hasInvitations ? '100%' : 'auto'}>
            <FormControl
              name="memberEmail"
              control={control}
              style={{ minWidth: '320px', flexBasis: '60%' }}
              isRequired
            >
              <FieldInput
                id="memberEmail"
                name="memberEmail"
                control={control}
                type="text"
                placeholder={intl.formatMessage({
                  id: 'organization.invite.email.placeholder',
                })}
              />
            </FormControl>
            <FormControl name="memberRole" control={control} style={{ flexBasis: '30%', minWidth: '200px' }} isRequired>
              <FieldInput
                type="select"
                name="memberRole"
                control={control}
                placeholder="Choisir une option"
                options={organizationRoles}
              />
            </FormControl>
            <Button
              variant="primary"
              variantSize="small"
              disabled={!formState.isValid}
              onClick={e => {
                handleSubmit(onSubmit)(e)
              }}
              style={{ flexBasis: '10%', justifyContent: 'center', height: '34px' }}
            >
              {intl.formatMessage({ id: 'organization.invite' })}
            </Button>
          </InputGroup>
        </Flex>

        {hasInvitations && (
          <Table emptyMessage={<div />}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Text lineHeight="sm">
                    {intl.formatMessage({
                      id: 'organisation.members',
                    })}
                  </Text>
                </Table.Th>
                <Table.Th>
                  <Text lineHeight="sm">
                    {intl.formatMessage({
                      id: 'global.role',
                    })}
                  </Text>
                </Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {membersList &&
                membersList.map((invite, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td>
                      <Flex direction="row" spacing={1}>
                        {invite?.status === StatusEnum.PENDING ? (
                          <Text>{invite.user.email}</Text>
                        ) : (
                          <Tooltip label={invite.user.email}>
                            <Text>{invite.user.username}</Text>
                          </Tooltip>
                        )}
                        {invite?.status === StatusEnum.PENDING && (
                          <Tag variantColor="orange">{intl.formatMessage({ id: 'waiting' })}</Tag>
                        )}
                      </Flex>
                    </Table.Td>
                    <Table.Td>
                      {intl.formatMessage({
                        id: `OrganizationAffiliation.${invite?.role}`,
                      })}
                    </Table.Td>
                    <Table.Td textAlign="end">
                      <OrganizationConfigFormDeleteMemberModal
                        status={invite?.status}
                        userName={invite?.user.email ? invite?.user.email : invite?.user.username}
                        userId={invite.user.id}
                        organization={organization}
                        inviteId={invite.user.id}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        )}
      </Flex>
    </Flex>
  )
}

export default OrganizationConfigFormMembers

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { Field, formValueSelector } from 'redux-form'
import { useSelector } from 'react-redux'
import Flex from '~ui/Primitives/Layout/Flex'
import Text from '~ui/Primitives/Text'
import Select from '~/components/Form/Select'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import type { UserInviteModalStepsChooseRole_query$key } from '~relay/UserInviteModalStepsChooseRole_query.graphql'
import component from '~/components/Form/Field'
import type { Step } from '~/components/DesignSystem/ModalSteps/ModalSteps.context'
import '~/components/DesignSystem/ModalSteps/ModalSteps.context'
import type { GlobalState } from '~/types'
const FRAGMENT = graphql`
  fragment UserInviteModalStepsChooseRole_query on Query {
    groups {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`
type Props = Step & {
  readonly query: UserInviteModalStepsChooseRole_query$key
}
export const UserInviteModalStepsChooseRole = ({ query: queryFragment }: Props): JSX.Element => {
  const intl = useIntl()
  const hasProjectAdminFeature = useFeatureFlag('project_admin')
  const groupsData = useFragment(FRAGMENT, queryFragment)
  const message = useSelector((state: GlobalState) => formValueSelector('form-user-invitation')(state, 'message'))
  return (
    <Flex direction="column" spacing={2}>
      <Text>
        {intl.formatMessage({
          id: 'global.role',
        })}
      </Text>
      <Field type="radio" component={component} id="user" value="ROLE_USER" name="role">
        {intl.formatMessage({
          id: 'roles.user',
        })}
      </Field>
      {hasProjectAdminFeature && (
        <Field type="radio" component={component} id="project_admin" value="ROLE_PROJECT_ADMIN" name="role">
          {intl.formatMessage({
            id: 'roles.project_admin',
          })}
        </Field>
      )}
      <Field component={component} type="radio" id="admin" value="ROLE_ADMIN" name="role">
        {intl.formatMessage({
          id: 'roles.admin',
        })}
      </Field>
      <Flex direction="row">
        <Text mr={2}>
          {intl.formatMessage({
            id: 'admin.label.group',
          })}
        </Text>
        <Text color="gray.400">
          {intl.formatMessage({
            id: 'global.optional',
          })}
        </Text>
      </Flex>
      <Field
        name="groups"
        component={Select}
        options={
          groupsData?.groups?.edges
            ? groupsData.groups.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(g => ({
                  value: g.id,
                  label: g.title,
                }))
            : []
        }
        multi
      />
      <Flex direction="row">
        <Text mr={2}>
          {intl.formatMessage({
            id: 'invitation-custom-message.label',
          })}
        </Text>
        <Text color="gray.400">
          {intl.formatMessage({
            id: 'global.optional',
          })}
        </Text>
      </Flex>
      <Field
        type="textarea"
        rows={9}
        placeholder={intl.formatMessage({
          id: 'invitations-custom-message.placeholder',
        })}
        name="message"
        value={message}
        component={component}
        maxLength={500}
        id="custom-message"
      />
      {message.length >= 500 && (
        <Text color="gray.400">
          {intl.formatMessage({
            id: 'invitations.custom-message.maximum-length',
          })}
        </Text>
      )}
    </Flex>
  )
}
export default UserInviteModalStepsChooseRole

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import {
  Button,
  CapUIFontSize,
  CapUIIcon,
  Flex,
  FormLabel,
  Heading,
  MultiStepModal,
  Select,
  Text,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { UserInviteModalStepsChooseRole_query$key } from '@relay/UserInviteModalStepsChooseRole_query.graphql'
import { useFormContext } from 'react-hook-form'
import { getRoleOptions } from '@components/BackOffice/UserInvitation/utils'
import { useFeatureFlags } from '@shared/hooks/useFeatureFlag'

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

type Props = {
  readonly query: UserInviteModalStepsChooseRole_query$key
  readonly id: string
  readonly label: string
}

export const UserInviteModalStepsChooseRole = ({ query: queryFragment, id, label }: Props): JSX.Element => {
  const intl = useIntl()
  const groupsData = useFragment(FRAGMENT, queryFragment)
  const { goToNextStep, goToPreviousStep } = useMultiStepModal()
  const { control, setValue, watch } = useFormContext()
  const hasProjectAdminFeature = useFeatureFlags(['project_admin'])

  const roleOptions = getRoleOptions(intl, hasProjectAdminFeature['project_admin'])

  const role = watch('role')
  const groups = watch('groups')
  const message = watch('custom-message')

  return (
    <>
      <MultiStepModal.Header id={id}>
        <MultiStepModal.Header.Label closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          {intl.formatMessage({ id: 'user-invite-admin-page-title' })}
        </MultiStepModal.Header.Label>
        <Heading>{intl.formatMessage({ id: label })}</Heading>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Flex direction="column" spacing={2}>
          <FormControl control={control} name="role" key="role">
            <FormLabel
              htmlFor="role"
              id="role"
              label={intl.formatMessage({
                id: 'global.role',
              })}
            />

            <FieldInput type="radio" name="role" id="role" control={control} value={role} choices={roleOptions} />
          </FormControl>

          <FormControl control={control} name="groups" id="groups" key="groups" isRequired={false}>
            <FormLabel
              aria-required={false}
              htmlFor="groups"
              id="groups"
              label={intl.formatMessage({
                id: 'admin.label.group',
              })}
            >
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <Select
              name="groups"
              id="groups"
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
              isMulti
              value={groups}
              onChange={selected => setValue('groups', selected)}
              placeholder={intl.formatMessage({ id: 'invitations.select-groups' })}
              noOptionsMessage={() => <Text>{intl.formatMessage({ id: 'global.no-options' })}</Text>}
            />
          </FormControl>

          <FormControl name={'customMessage'} control={control} key={'customMessage'}>
            <FormLabel htmlFor={'customMessage'} label={intl.formatMessage({ id: 'invitation-custom-message.label' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FieldInput
              control={control}
              name="customMessage"
              id={'customMessage'}
              type="textarea"
              rows={3}
              placeholder={intl.formatMessage({
                id: 'invitations-custom-message.placeholder',
              })}
              value={message}
              maxLength={500}
            />
          </FormControl>
          {message?.length >= 500 && (
            <Text color="gray.400">
              {intl.formatMessage({
                id: 'invitations.custom-message.maximum-length',
              })}
            </Text>
          )}
        </Flex>
      </MultiStepModal.Body>

      <MultiStepModal.Footer>
        <Button variant="secondary" variantColor="hierarchy" variantSize="big" onClick={goToPreviousStep}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="big"
          onClick={() => goToNextStep()}
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({ id: 'organization.invite.verify-before-sending' })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}
export default UserInviteModalStepsChooseRole

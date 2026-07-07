import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, useMultiStepModal, Button, FormLabel, CapInputSize, Text, CapUIFontSize } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import ModalLayout from './ModalLayout'
import { useUpdateParticipantMutation } from '~/mutations/UpdateParticipantMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import CookieMonster from '@shared/utils/CookieMonster'
import { useUpdateProfilePersonalDataMutation } from '~/mutations/UpdateProfilePersonalDataMutation'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal'
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'

type FormValues = Pick<WorkflowFormValues, 'username'>

type Props = {
  hideGoBackArrow?: boolean
  onSuccess: (username: string) => void
}


const REGEX_USERNAME = RegExp("^[a-zA-Z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F-·' ]+$")


const UsernameRequirementModal: React.FC<Props> = ({ hideGoBackArrow, onSuccess }) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user)
  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()
  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading

  const { control, handleSubmit, setFocus } = useFormContext<FormValues>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus('username')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  const updateUser = (username: string) => {
    const input = {
      username,
    }
    updateProfilePersonalDataMutation.commit({
      variables: {
        input,
      },
      onCompleted: async (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        onSuccess(username)
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const updateParticipant = (username: string) => {
    const input = {
      username,
      token: CookieMonster.getParticipantCookie(),
    }
    updateParticipantMutation.commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        onSuccess(username)
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const onSubmit = ({ username }: FormValues) => {
    if (!username) {
      return goToNextStep()
    }
    if (isAuthenticated) {
      updateUser(username)
      return
    }
    updateParticipant(username)
  }

  return (
    <>
      <ModalLayout
        optional
        header={
          hideGoBackArrow
            ? ({ intl, onClose, goBackCallback, logo, isMobile }) => (
                <HideBackArrowLayout
                  intl={intl}
                  onClose={onClose}
                  goBackCallback={goBackCallback}
                  logo={logo}
                  isMobile={isMobile}
                  optional
                />
              )
            : null
        }
        onClose={() => {}}
        title={intl.formatMessage({ id: 'participation-workflow.username' })}
        info={intl.formatMessage({ id: 'participation-workflow.username_helptext' })}
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="username" control={control}>
            <FormLabel fontWeight={[400, 600]} htmlFor="username" label={intl.formatMessage({ id: 'global.username' })}>
              <Text fontSize={CapUIFontSize.Caption} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FieldInput
              id="username"
              name="username"
              control={control}
              type="text"
              variantSize={CapInputSize.Md}
              minLength={2}
              rules={{
                validate: value =>
                  !value ||
                  value.length <= 255 ||
                  intl.formatMessage({ id: 'characters-maximum-required' }, { length: 255 }),
                pattern: {
                  value: REGEX_USERNAME,
                  message: intl.formatMessage({ id: 'registration.constraints.username.symbol' }),
                },
              }}
            />
          </FormControl>
          <Button variantSize="big" justifyContent="center" width="100%" type="submit" isLoading={isLoading}>
            {intl.formatMessage({ id: 'global.continue' })}
          </Button>
        </Box>
      </ModalLayout>
    </>
  )
}

export default UsernameRequirementModal

import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Box,
  Button,
  CapInputSize,
  CapUIFontSize,
  FormLabel,
  Text,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import CookieMonster from '@shared/utils/CookieMonster'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { HideBackArrowLayout } from './ModalLayoutHeader'
import ModalLayout from './ModalLayout'
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal'
import { useUpdateParticipantMutation } from './mutations/UpdateParticipantMutation'
import { useUpdateProfilePersonalDataMutation } from './mutations/UpdateProfilePersonalDataMutation'

type FormValues = Pick<WorkflowFormValues, 'username'>

type Props = {
  hideGoBackArrow?: boolean
  onSuccess: (username: string) => void
}

const REGEX_USERNAME = RegExp("^[a-zA-Z0-9_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u024F-·' ]+$")

const UsernameRequirementModal: React.FC<Props> = ({ hideGoBackArrow, onSuccess }) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const isAuthenticated = !!viewerSession?.id
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
    updateProfilePersonalDataMutation.commit({
      variables: {
        input: {
          username,
        },
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }

        onSuccess(username)
        goToNextStep()
      },
      onError: () => mutationErrorToast(intl),
    })
  }

  const updateParticipant = (username: string) => {
    updateParticipantMutation.commit({
      variables: {
        input: {
          username,
          token: CookieMonster.getParticipantCookie(),
        },
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }

        onSuccess(username)
        goToNextStep()
      },
      onError: () => mutationErrorToast(intl),
    })
  }

  const onSubmit = ({ username }: FormValues) => {
    if (!username) {
      goToNextStep()
      return
    }

    if (isAuthenticated) {
      updateUser(username)
      return
    }

    updateParticipant(username)
  }

  return (
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
          <FormLabel htmlFor="username" label={intl.formatMessage({ id: 'global.username' })}>
            <Text fontSize={CapUIFontSize.Caption} color="gray.500" mb={2}>
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
  )
}

export default UsernameRequirementModal

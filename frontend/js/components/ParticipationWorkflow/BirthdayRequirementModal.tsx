import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, useMultiStepModal, Button, FormLabel, CapInputSize } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import ModalLayout from './ModalLayout'
import { useUpdateParticipantMutation } from '~/mutations/UpdateParticipantMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import CookieMonster from '@shared/utils/CookieMonster'
import moment from 'moment'
import { useUpdateProfilePersonalDataMutation } from '~/mutations/UpdateProfilePersonalDataMutation'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal'
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'

type FormValues = Pick<WorkflowFormValues, 'birthday'>

type Props = {
  hideGoBackArrow: boolean
}

const BirthdayRequirementModal: React.FC<Props> = ({ hideGoBackArrow }) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user)
  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()
  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading

  const { control, handleSubmit, setFocus } = useFormContext<FormValues>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus('birthday')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  const updateUser = (dateOfBirth: string) => {
    const input = {
      dateOfBirth,
    }
    updateProfilePersonalDataMutation.commit({
      variables: {
        input,
      },
      onCompleted: async (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const updateParticipant = (dateOfBirth: string) => {
    const input = {
      dateOfBirth,
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
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const onSubmit = (values: FormValues) => {
    const dateOfBirth = moment(values.birthday).format('YYYY-MM-DD HH:mm:ss')
    if (isAuthenticated) {
      updateUser(dateOfBirth)
      return
    }
    updateParticipant(dateOfBirth)
  }

  return (
    <>
      <ModalLayout
        header={
          hideGoBackArrow
            ? ({ intl, onClose, goBackCallback, logo, isMobile }) => (
                <HideBackArrowLayout
                  intl={intl}
                  onClose={onClose}
                  goBackCallback={goBackCallback}
                  logo={logo}
                  isMobile={isMobile}
                />
              )
            : null
        }
        onClose={() => {}}
        title={intl.formatMessage({ id: 'participation-workflow.birthday' })}
        info={intl.formatMessage({ id: 'participation-workflow.birthday_helptext' })}
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="birthday" control={control} isRequired>
            <FormLabel htmlFor="birthday" label={intl.formatMessage({ id: 'form.label_date_of_birth' })} />
            <FieldInput
              id="birthday"
              name="birthday"
              control={control}
              type="date"
              max={moment().format('YYYY-MM-DD')}
              variantSize={CapInputSize.Md}
              placeholder={intl.formatMessage({ id: 'date.placeholder' })}
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

export default BirthdayRequirementModal

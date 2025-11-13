import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, CapInputSize, FormLabel, useMultiStepModal } from '@cap-collectif/ui'
import CookieMonster from '@shared/utils/CookieMonster'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout'
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { useUpdateParticipantMutation } from '~/mutations/UpdateParticipantMutation'
import { useUpdateProfilePersonalDataMutation } from '~/mutations/UpdateProfilePersonalDataMutation'
import type { GlobalState } from '~/types'
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal'

type FormValues = Pick<WorkflowFormValues, 'zipCode'>

type Props = {
  hideGoBackArrow: boolean
}

const ZIP_CODE_LENGTH = 5

const ZipCodeRequirement: React.FC<Props> = ({ hideGoBackArrow }) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user)
  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()
  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading

  const { control, handleSubmit, setFocus } = useFormContext<FormValues>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus('zipCode')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  const updateUser = (zipCode: string) => {
    const input = {
      zipCode,
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

  const updateParticipant = (zipCode: string) => {
    const input = {
      zipCode,
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
    const zipCode = values.zipCode.toString()
    if (isAuthenticated) {
      updateUser(zipCode)
    } else {
      updateParticipant(zipCode)
    }
  }

  const ONLY_NUMBER_REGEX = /^(0|[1-9]\d*)(\.\d+)?$/

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
        title={intl.formatMessage({ id: 'participation-workflow.zipCode' })}
        info={intl.formatMessage({ id: 'participation-workflow.zipCode_helptext' })}
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="zipCode" control={control} isRequired>
            <FormLabel htmlFor="zipCode" label={intl.formatMessage({ id: 'user_zipCode' })} />
            <FieldInput
              id="zipCode"
              name="zipCode"
              control={control}
              type="text"
              variantSize={CapInputSize.Md}
              variantColor="hierarchy"
              placeholder="75100"
              maxLength={ZIP_CODE_LENGTH}
              rules={{
                pattern: {
                  value: ONLY_NUMBER_REGEX,
                  message: intl.formatMessage({
                    id: 'field-must-contains-number',
                  }),
                },
                validate: {
                  exact: v =>
                    v.length === ZIP_CODE_LENGTH ||
                    intl.formatMessage({ id: 'characters-required' }, { length: ZIP_CODE_LENGTH }),
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

export default ZipCodeRequirement

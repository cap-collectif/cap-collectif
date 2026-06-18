import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, CapInputSize, FormLabel, useMultiStepModal } from '@cap-collectif/ui'
import { useJsApiLoader } from '@react-google-maps/api'
import CookieMonster from '@shared/utils/CookieMonster'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'

const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places']
import { HideBackArrowLayout } from './ModalLayoutHeader'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useUpdateParticipantMutation } from './mutations/UpdateParticipantMutation'
import { useUpdateProfilePersonalDataMutation } from './mutations/UpdateProfilePersonalDataMutation'
import ModalLayout from './ModalLayout'
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

type FormValues = Pick<WorkflowFormValues, 'address' | 'realAddress'>

type Props = {
  hideGoBackArrow: boolean
}

const AddressRequirementModal: React.FC<Props> = ({ hideGoBackArrow }) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const isAuthenticated = !!viewerSession?.id

  const isAlreadyLoaded = typeof window !== 'undefined' && !!window.google?.maps?.places

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const isMapsReady = isAlreadyLoaded || isLoaded

  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()
  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading

  const { control, handleSubmit, setValue, setFocus, setError } = useFormContext<FormValues>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus('address')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  const updateUser = (address: string) => {
    const input = {
      postalAddress: address,
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

  const updateParticipant = (address: string) => {
    const input = {
      postalAddress: address,
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
    const address = JSON.stringify([values.realAddress])

    if (!values.realAddress) {
      setError('address', {
        type: 'value',
        message: intl.formatMessage({
          id: 'fill-address-error',
        }),
      })
      return
    }

    if (isAuthenticated) {
      updateUser(address)
      return
    }

    updateParticipant(address)
  }

  return (
    <>
      <ModalLayout
        onClose={() => {}}
        title={intl.formatMessage({ id: 'participation-workflow.address' })}
        info={intl.formatMessage({ id: 'participation-workflow.address_helptext' })}
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
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="address" control={control} isRequired>
            <FormLabel htmlFor="address" label={intl.formatMessage({ id: 'form.label-postal-Address' })} />
            {isMapsReady && (
              <FieldInput
                id="address"
                name="address"
                required
                control={control}
                type="address"
                getAddress={add => {
                  setValue('realAddress', add)
                }}
                variantSize={CapInputSize.Md}
                variantColor="hierarchy"
                placeholder={intl.formatMessage({ id: 'searchbar.placeholder' })}
                width="100%"
              />
            )}
          </FormControl>
          <Button variantSize="big" justifyContent="center" width="100%" type="submit" isLoading={isLoading}>
            {intl.formatMessage({ id: 'global.continue' })}
          </Button>
        </Box>
      </ModalLayout>
    </>
  )
}

export default AddressRequirementModal

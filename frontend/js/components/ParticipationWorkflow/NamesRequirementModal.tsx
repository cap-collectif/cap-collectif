import * as React from 'react'
import {useIntl} from 'react-intl'
import { Box, useMultiStepModal, Button, FormLabel, CapInputSize } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import ModalLayout from './ModalLayout'
import { useUpdateParticipantMutation } from '~/mutations/UpdateParticipantMutation'
import {mutationErrorToast} from "~/components/Utils/MutationErrorToast";
import CookieMonster from '@shared/utils/CookieMonster';
import {
  useUpdateProfilePersonalDataMutation,
} from '~/mutations/UpdateProfilePersonalDataMutation'
import {useSelector} from "react-redux";
import type {GlobalState} from "~/types";
import {FormValues as WorkflowFormValues} from './ParticipationWorkflowModal'
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'

type FormValues = Pick<WorkflowFormValues, 'firstname' | 'lastname'>



type Props = {
  hideGoBackArrow: boolean
  showFirstname: boolean
  showLastname: boolean
}

const NamesRequirementModal: React.FC<Props> = ({hideGoBackArrow, showFirstname, showLastname}) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user);
  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()
  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading
  const {control, handleSubmit, setFocus} = useFormContext<FormValues>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus("firstname")
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  const updateUser = (firstname: string, lastname: string) => {
    const input = {
      firstname,
      lastname
    }
    updateProfilePersonalDataMutation.commit({
      variables: {
        input
      },
      onCompleted: async (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      }
    });
  }

  const updateParticipant = (firstname: string, lastname: string) => {
    const input = {
      firstname,
      lastname,
      token: CookieMonster.getParticipantCookie(),
    }
    updateParticipantMutation.commit({
      variables: {
        input
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      }
    });
  }

  const onSubmit = ({firstname, lastname}: FormValues) => {
    if (isAuthenticated) {
      updateUser(firstname, lastname)
      return;
    }
    updateParticipant(firstname, lastname)
  }

  return (
    <>
      <ModalLayout
        header={hideGoBackArrow ? ({intl, onClose, goBackCallback, logo, isMobile }) => (
          <HideBackArrowLayout intl={intl} onClose={onClose} goBackCallback={goBackCallback} logo={logo} isMobile={isMobile} />
        ) : null}
        onClose={() => {}}
        title={intl.formatMessage({ id: 'participation-workflow.names' })}
        info={intl.formatMessage({ id: 'participation-workflow.names_helptext' })}
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          {
            showFirstname && (
              <FormControl name="firstname" control={control} isRequired>
                <FormLabel htmlFor="firstname" label={intl.formatMessage({ id: 'form.label_firstname' })} />
                <FieldInput id="firstname" name="firstname" control={control} type="text" variantSize={CapInputSize.Md} />
              </FormControl>
            )
          }
          {
            showLastname && (
              <FormControl name="lastname" control={control} isRequired>
                <FormLabel htmlFor="lastname" label={intl.formatMessage({ id: 'form.label_lastname' })} />
                <FieldInput id="lastname" name="lastname" control={control} type="text" variantSize={CapInputSize.Md} />
              </FormControl>
            )
          }
          <Button variantSize="big" justifyContent="center" width="100%" type="submit" isLoading={isLoading}>
            {intl.formatMessage({ id: 'global.continue' })}
          </Button>
        </Box>
      </ModalLayout>
    </>
  )
}

export default NamesRequirementModal

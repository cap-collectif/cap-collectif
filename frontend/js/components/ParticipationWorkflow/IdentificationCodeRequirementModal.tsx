import * as React from 'react';
import { useIntl } from 'react-intl';
import { Box, useMultiStepModal, Button, FormLabel, CapInputSize } from '@cap-collectif/ui';
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form';
import ModalLayout from './ModalLayout';
import { useUpdateParticipantMutation } from '~/mutations/UpdateParticipantMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import CookieMonster from '@shared/utils/CookieMonster'
import { useUpdateProfilePersonalDataMutation } from '~/mutations/UpdateProfilePersonalDataMutation';
import { useSelector } from 'react-redux';
import type { GlobalState } from '~/types';
import {FormValues as WorkflowFormValues} from './ParticipationWorkflowModal'
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'

type FormValues = Pick<WorkflowFormValues, 'userIdentificationCode'>

type Props = {
  hideGoBackArrow: boolean
}

type ValidationErrors = {
  'userIdentificationCode': 'CODE_ALREADY_USED' | 'BAD_CODE'
}

const IdentificationCodeRequirementModal: React.FC<Props> = ({hideGoBackArrow}) => {
  const { goToNextStep } = useMultiStepModal();
  const intl = useIntl();
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user);
  const updateParticipantMutation = useUpdateParticipantMutation();
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation();
  const isLoading =
    updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading;

  const {control, handleSubmit, setFocus, setError} = useFormContext<FormValues>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus("userIdentificationCode")
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  const updateUser = (userIdentificationCode: string) => {
    const input = {
      userIdentificationCode,
    };
    updateProfilePersonalDataMutation.commit({
      variables: {
        input,
      },
      onCompleted: async (response, errors) => {
        const errorCode = response.updateProfilePersonalData?.errorCode;

        if (['BAD_CODE', 'CODE_ALREADY_USED'].includes(errorCode)) {
          setError('userIdentificationCode', {
            type: 'manual',
            message: intl.formatMessage({ id: errorCode })
          })
          return;
        }

        if (errors && errors.length > 0) {
          return mutationErrorToast(intl);
        }
        goToNextStep();
      },
      onError: () => {
        return mutationErrorToast(intl);
      },
    });
  };

  const updateParticipant = (userIdentificationCode: string) => {
    const input = {
      userIdentificationCode,
      token: CookieMonster.getParticipantCookie(),
    };
    updateParticipantMutation.commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        const validationErrors: ValidationErrors = JSON.parse(response.updateParticipant?.validationErrors) ?? {};

        if (Object.keys(validationErrors).length > 0) {
          for (const [formKey, error] of Object.entries(validationErrors) as [keyof ValidationErrors, ValidationErrors[keyof ValidationErrors]][]) {
            setError(formKey, {
              type: 'manual',
              message: intl.formatMessage({ id: error })
            })
          }
          return;
        }

        if (errors && errors.length > 0) {
          return mutationErrorToast(intl);
        }
        goToNextStep();
      },
      onError: () => {
        return mutationErrorToast(intl);
      },
    });
  };

  const onSubmit = (values: FormValues) => {
    const {userIdentificationCode} = values;
    if (isAuthenticated) {
      updateUser(userIdentificationCode);
      return;
    }
    updateParticipant(userIdentificationCode);
  };

  return (
    <>
      <ModalLayout
        header={hideGoBackArrow ? ({intl, onClose, goBackCallback, logo, isMobile }) => (
          <HideBackArrowLayout intl={intl} onClose={onClose} goBackCallback={goBackCallback} logo={logo} isMobile={isMobile} />
        ) : null}
        onClose={() => {}}
        title={intl.formatMessage({ id: 'identification_code' })}
        info={intl.formatMessage({ id: 'participation-workflow.userIdentificationCode_helptext' })}>
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="userIdentificationCode" control={control} isRequired>
            <FormLabel
              htmlFor="userIdentificationCode"
              label={intl.formatMessage({ id: 'participation-workflow.code_label' })}
            />
            <FieldInput
              id="userIdentificationCode"
              name="userIdentificationCode"
              control={control}
              type="text"
              variantSize={CapInputSize.Md}
            />
          </FormControl>
          <Button
            variantSize="big"
            justifyContent="center"
            width="100%"
            type="submit"
            isLoading={isLoading}>
            {intl.formatMessage({ id: 'global.continue' })}
          </Button>
        </Box>
      </ModalLayout>
    </>
  );
};

export default IdentificationCodeRequirementModal;

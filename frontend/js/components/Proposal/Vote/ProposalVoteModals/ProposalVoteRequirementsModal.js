// @flow
import React from 'react';
import { Flex } from '@cap-collectif/ui';
import type { IntlShape } from 'react-intl';
import moment from 'moment';
import { fetchQuery_DEPRECATED } from 'react-relay';
import RequirementsForm from '~/components/Requirements/RequirementsForm';
import UpdateProfilePersonalDataMutation from '~/mutations/UpdateProfilePersonalDataMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import SendSmsPhoneValidationCodeMutation from '~/mutations/SendSmsPhoneValidationCodeMutation';
import type { SendSmsPhoneValidationCodeMutationResponse } from '~relay/SendSmsPhoneValidationCodeMutation.graphql';
import type { UpdateProfilePersonalDataMutationResponse } from '~/mutations/UpdateProfilePersonalDataMutation';
import type { Uuid } from '~/types';
import CheckIdentificationCodeMutation from '~/mutations/CheckIdentificationCodeMutation';
import UpdateRequirementMutation from '~/mutations/UpdateRequirementMutation';
import { refetchViewer } from '~/components/Requirements/RequirementsFormLegacy';
import environment from '~/createRelayEnvironment';

export const formName = 'vote-requirements-form';
export type onRequirementsSubmitDataProps = {|
  +PhoneVerifiedRequirement?: {
    CountryCode: string,
    phoneNumber: string,
  },
  +PhoneRequirement?: {
    CountryCode: string,
    phoneNumber: string,
  },
  +FranceConnectRequirement?: boolean,
  +franceConnect_: boolean,
  +FirstnameRequirement?: string,
  +LastnameRequirement?: string,
  +DateOfBirthRequirement?: moment,
  +IdentificationCodeRequirement?: string,
  +PostalAddressRequirement?: string,
  +realAddress?: {|
    address_components: Array<{
      long_name: string,
      short_name: string,
      types: string[],
    }>,
    formatted_address: string,
    geometry: {
      location: {|
        +lat: number,
        +lng: number,
      |},
      location_type: string,
      viewport?: {
        Va: {
          i: number,
          j: number,
        },
        Za: {
          i: number,
          j: number,
        },
      },
    },
    place_id?: string,
    plus_code?: {
      compound_code: string,
      global_code: string,
    },
    types: string[],
  |},
  +CheckboxRequirement: {
    viewerMeetsTheRequirement: boolean,
    label: string,
    id: Uuid,
  },
|};

const getPhone = (requirement: { CountryCode: string, phoneNumber: string }) => {
  return `${requirement.CountryCode}${
    requirement?.phoneNumber.split('')[0] === '0'
      ? requirement.phoneNumber.slice(1)
      : requirement.phoneNumber
  }`;
};

export const onRequirementsSubmit = async (
  data: onRequirementsSubmitDataProps,
  goToNextStep: () => void,
  isPhoneVerificationOnly: boolean,
  intl: IntlShape,
  setIsLoading: (value: boolean) => void,
  needToVerifyPhone: boolean,
  setError: any,
  stepId: string,
  isAuthenticated: boolean,
) => {
  if (data.IdentificationCodeRequirement && data.IdentificationCodeRequirement !== '') {
    try {
      // Check the identification code
      const CheckIdentificationCodeResponse = await CheckIdentificationCodeMutation.commit({
        input: { identificationCode: data.IdentificationCodeRequirement },
      });
      if (CheckIdentificationCodeResponse.checkIdentificationCode?.errorCode) {
        setError('IdentificationCodeRequirement', {
          type: 'value',
          message: intl.formatMessage({
            id: CheckIdentificationCodeResponse.checkIdentificationCode.errorCode || '',
          }),
        });
        return false;
      }
    } catch (e) {
      mutationErrorToast(intl);
    }
  }
  if (!!data.CheckboxRequirement && data.CheckboxRequirement.id) {
    try {
      const UpdateRequirementResponse = await UpdateRequirementMutation.commit({
        input: {
          requirement: data.CheckboxRequirement.id,
          value: data.CheckboxRequirement.viewerMeetsTheRequirement,
        },
      });
      if (
        UpdateRequirementResponse.updateRequirement &&
        UpdateRequirementResponse.updateRequirement.requirement
      ) {
        if (stepId) {
          await fetchQuery_DEPRECATED(environment, refetchViewer, {
            stepId,
            isAuthenticated,
          });
        }
      }
    } catch (e) {
      mutationErrorToast(intl);
    }
  }

  const phone = data.PhoneVerifiedRequirement
    ? getPhone(data.PhoneVerifiedRequirement)
    : data.PhoneRequirement
    ? getPhone(data.PhoneRequirement)
    : undefined;

  let input;
  if (isPhoneVerificationOnly) {
    input = { phone };
  } else {
    input = {
      phone,
      firstname: data.FirstnameRequirement,
      lastname: data.LastnameRequirement,
      dateOfBirth: data.DateOfBirthRequirement
        ? moment(data.DateOfBirthRequirement).format()
        : undefined,
      userIdentificationCode: data.IdentificationCodeRequirement,
      postalAddress: data.realAddress ? JSON.stringify([data.realAddress]) : undefined,
    };
  }

  try {
    setIsLoading(true);
    const updateResponse: UpdateProfilePersonalDataMutationResponse =
      await UpdateProfilePersonalDataMutation.commit({ input });

    if (updateResponse) {
      if (
        updateResponse.updateProfilePersonalData?.errorCode === 'PHONE_ALREADY_USED_BY_ANOTHER_USER'
      ) {
        if (data.PhoneVerifiedRequirement) {
          setError('PhoneVerifiedRequirement.phoneNumber', {
            type: 'value',
            message: intl.formatMessage({
              id: updateResponse.updateProfilePersonalData?.errorCode,
            }),
          });
          setIsLoading(false);
          return false;
        }

        setError('PhoneRequirement.phoneNumber', {
          type: 'value',
          message: intl.formatMessage({
            id: updateResponse.updateProfilePersonalData?.errorCode,
          }),
        });
        setIsLoading(false);
        return false;
      }

      try {
        if (needToVerifyPhone) {
          const smsResponse: SendSmsPhoneValidationCodeMutationResponse =
            await SendSmsPhoneValidationCodeMutation.commit({ input: {} });
          if (smsResponse) {
            setIsLoading(false);
            goToNextStep();
          }
        } else {
          setIsLoading(false);
          goToNextStep();
        }
      } catch (e) {
        setIsLoading(false);

        mutationErrorToast(intl);
      }
    }
  } catch (e) {
    setIsLoading(false);

    mutationErrorToast(intl);
  }
};
export type ProposalVoteRequirementsModalProps = {|
  +initialValues: { [key: string]: any },
  +isPhoneVerificationOnly: boolean,
  +control: any,
  +formState: any,
  +trigger: any,
  +setValue: any,
  +id: string,
  +label: React$Node,
  +validationLabel: React$Node,
|};

const ProposalVoteRequirementsModal = ({
  initialValues,
  isPhoneVerificationOnly,
  control,
  formState,
  trigger,
  setValue,
}: ProposalVoteRequirementsModalProps) => {
  return (
    <Flex align="flex-start" justify="center">
      <RequirementsForm
        control={control}
        formState={formState}
        isPhoneVerificationOnly={isPhoneVerificationOnly}
        initialValues={initialValues}
        trigger={trigger}
        setValue={setValue}
      />
    </Flex>
  );
};

export default ProposalVoteRequirementsModal;

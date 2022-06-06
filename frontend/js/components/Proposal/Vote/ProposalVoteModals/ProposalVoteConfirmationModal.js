// @flow
import * as React from 'react';
import {
  Button,
  CapUIFontFamily,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  SpotIcon,
  Text,
  Tooltip,
} from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { graphql, useFragment } from 'react-relay';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import type { Control } from 'react-hook-form';
import type { IntlShape } from 'react-intl';
import formatPhoneNumber from '~/utils/formatPhoneNumber';
import phoneSplitter from '~/utils/phoneSplitter';
import VerifyUserPhoneNumberMutation from '~/mutations/VerifyUserPhoneNumberMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import SendSmsPhoneValidationCodeMutation from '~/mutations/SendSmsPhoneValidationCodeMutation';
import type { VerifyUserPhoneNumberMutationResponse } from '~relay/VerifyUserPhoneNumberMutation.graphql';
import type { SendSmsPhoneValidationCodeMutationResponse } from '~relay/SendSmsPhoneValidationCodeMutation.graphql';
import type { ProposalVoteConfirmationModal_viewer$key } from '~relay/ProposalVoteConfirmationModal_viewer.graphql';

export const formName = 'vote-sms-validation-form';

export type FormValues = {
  code: string,
};

export type ProposalVoteConfirmationModalProps = {|
  +control: Control<FormValues>,
  +isSubmitting: boolean,
  +viewer: ProposalVoteConfirmationModal_viewer$key,
  +register: any,
  +handleSubmit: any,
  +goToNextStep: () => void,
  +setIsLoading: (isLoading: boolean) => void,
  +reset: any,
  +id: string,
  +label: React$Node,
  +validationLabel: React$Node,
|};

export const onVoteConfirmationSubmit = async (
  values: FormValues,
  goToNextStep: () => void,
  intl: IntlShape,
  fromValidation: boolean,
  setIsLoading: boolean => void,
) => {
  if (fromValidation) {
    goToNextStep();
    return true;
  }
  try {
    setIsLoading(true);
    const response = await VerifyUserPhoneNumberMutation.commit({ input: { code: values.code } });
    if (response) {
      setIsLoading(false);
      goToNextStep();
    }
  } catch (e) {
    mutationErrorToast(intl);
  }
};

const FRAGMENT = graphql`
  fragment ProposalVoteConfirmationModal_viewer on User {
    phone
  }
`;

const ProposalVoteConfirmationModal = ({
  control,
  isSubmitting,
  viewer: viewerFragment,
  register,
  handleSubmit,
  goToNextStep,
  setIsLoading,
  reset,
}: ProposalVoteConfirmationModalProps) => {
  const intl = useIntl();
  const viewer = useFragment(FRAGMENT, viewerFragment);

  const [verified, setVerified] = React.useState<boolean>(false);
  const [limitReached, setLimitReached] = React.useState<boolean>(false);

  const validateCode = async (value: $PropertyType<FormValues, 'code'>) => {
    if (!verified) {
      try {
        setIsLoading(true);

        const response: VerifyUserPhoneNumberMutationResponse =
          await VerifyUserPhoneNumberMutation.commit({ input: { code: value } });

        if (
          response.verifyUserPhoneNumber?.user ||
          response.verifyUserPhoneNumber?.errorCode === 'PHONE_ALREADY_CONFIRMED'
        ) {
          setVerified(true);
          handleSubmit(data => {
            onVoteConfirmationSubmit(data, goToNextStep, intl, true, setIsLoading);
          })();
          setIsLoading(false);
          return true;
        }

        if (response.verifyUserPhoneNumber?.errorCode === 'CODE_EXPIRED') {
          setIsLoading(false);
          return intl.formatMessage({ id: 'CODE_EXPIRED' });
        }

        if (response.verifyUserPhoneNumber?.errorCode === 'CODE_NOT_VALID') {
          setIsLoading(false);
          return intl.formatMessage({ id: 'CODE_NOT_VALID' });
        }
      } catch (e) {
        mutationErrorToast(intl);
      }
    }

    return true;
  };

  const sendNewPhoneValidationCode = async () => {
    try {
      const response: SendSmsPhoneValidationCodeMutationResponse =
        await SendSmsPhoneValidationCodeMutation.commit({ input: {} });
      if (response.sendSmsPhoneValidationCode?.errorCode === 'RETRY_LIMIT_REACHED') {
        setLimitReached(true);
      }
    } catch (e) {
      mutationErrorToast(intl);
    }
  };

  React.useEffect(() => {
    reset({ code: 0 });
  }, [reset]);

  return (
    <Flex as="form" direction="column" spacing={3} align="center" justify="center">
      <SpotIcon name={CapUISpotIcon.ADD_CONTACT} size={CapUISpotIconSize.Lg} />
      <Text textAlign="center" fontSize="18px" lineHeight="24px">
        <FormattedHTMLMessage
          id="confirmation.code.header.title"
          values={{ phoneNumber: phoneSplitter(formatPhoneNumber(viewer.phone)) }}
        />
      </Text>

      <FormControl
        name="code"
        control={control}
        isRequired
        isDisabled={isSubmitting}
        align="center">
        <FieldInput
          control={control}
          {...register('code', {
            validate: {
              validateCode,
            },
          })}
          type="codeInput"
          name="code"
          isVerified={verified}
        />
        {verified && (
          <Text
            color="green.500"
            fontFamily={CapUIFontFamily.Body}
            lineHeight="normal"
            fontSize={3}
            textAlign="center">
            {intl.formatMessage({ id: 'code.validation.success' })}
          </Text>
        )}
      </FormControl>

      {limitReached ? (
        <Tooltip
          zIndex={1500}
          id="tooltip"
          label={intl.formatMessage({ id: 'code.limit.reached' })}>
          <Button variant="link" variantColor="hierarchy">
            {intl.formatMessage({ id: 'get.new.code' })}
          </Button>
        </Tooltip>
      ) : (
        <Button variant="link" onClick={sendNewPhoneValidationCode}>
          {intl.formatMessage({ id: 'get.new.code' })}
        </Button>
      )}
    </Flex>
  );
};

export default ProposalVoteConfirmationModal;

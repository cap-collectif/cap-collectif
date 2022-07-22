// @flow
import * as React from 'react';
import {
  Button,
  CapUIFontFamily,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  Heading,
  MultiStepModal,
  SpotIcon,
  Text,
  Tooltip,
  useMultiStepModal,
  CapUIIcon,
} from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import {useForm} from "react-hook-form";
import {graphql, useFragment} from "react-relay";
import formatPhoneNumber from '~/utils/formatPhoneNumber';
import phoneSplitter from '~/utils/phoneSplitter';
import AddProposalSmsVoteMutation from '~/mutations/AddProposalSmsVoteMutation';
import VerifySmsVotePhoneNumberMutation from '~/mutations/VerifySmsVotePhoneNumberMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import SendSmsProposalVoteMutation from '~/mutations/SendSmsProposalVoteMutation';
import type { AddProposalSmsVoteMutationResponse } from '~relay/AddProposalSmsVoteMutation.graphql';
import type { VerifySmsVotePhoneNumberMutationResponse } from '~relay/VerifySmsVotePhoneNumberMutation.graphql';
import type { SendSmsProposalVoteMutationResponse } from '~relay/SendSmsProposalVoteMutation.graphql';
import CookieMonster from '~/CookieMonster';
import type {Status} from "~/components/Proposal/Vote/ProposalSmsVoteModal";
import ResetCss from '~/utils/ResetCss';
import type {ProposalVoteSmsConfirmationModal_step$key} from '~relay/ProposalVoteSmsConfirmationModal_step.graphql';
import type {ProposalVoteSmsConfirmationModal_proposal$key} from '~relay/ProposalVoteSmsConfirmationModal_proposal.graphql';


export const formName = 'vote-sms-validation-form';

export type FormValues = {
  code: string,
};

export type ProposalVoteSmsConfirmationModalProps = {|
  +countryCode: string,
  +phone: string,
  +proposal: ProposalVoteSmsConfirmationModal_proposal$key,
  +step: ProposalVoteSmsConfirmationModal_step$key,
  +consentSmsCommunication: boolean,
  +setIsLoading: (isLoading: boolean) => void,
  +setStatus: (status: Status) => void,
  +isLoading: boolean,
|};

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteSmsConfirmationModal_proposal on Proposal {
    id
  }
`;

const STEP_FRAGMENT = graphql`
  fragment ProposalVoteSmsConfirmationModal_step on ProposalStep {
    id
  }
`;

const getPhone = (countryCode: string, phoneNumber: string) => {
  return `${countryCode}${
    phoneNumber.split('')[0] === '0'
      ? phoneNumber.slice(1)
      : phoneNumber
  }`;
};

const ProposalVoteSmsConfirmationModal = ({
  countryCode,
  phone,
  proposal: proposalRef,
  step: stepRef,
  consentSmsCommunication,
  setIsLoading,
  setStatus,
  isLoading
 }: ProposalVoteSmsConfirmationModalProps) => {
  const intl = useIntl();

  const [verified, setVerified] = React.useState<boolean>(false);
  const [limitReached, setLimitReached] = React.useState<boolean>(false);
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef);
  const step = useFragment(STEP_FRAGMENT, stepRef);
  const parsedPhone = getPhone(countryCode, phone);
  const { goToNextStep, goToPreviousStep } = useMultiStepModal();

  const form = useForm<any>({
    mode: 'onChange',
    defaultValues: { code: 0 },
  });

  const { control, formState, register } = form;
  const hasErrors = Object.keys(formState.errors).length > 0;

  const validateCode = async (code: $PropertyType<FormValues, 'code'>) => {
    if (!verified) {
      try {
        setIsLoading(true);

        const verifyCodeResponse: VerifySmsVotePhoneNumberMutationResponse = await VerifySmsVotePhoneNumberMutation.commit({
          input: {
            code,
            phone: parsedPhone,
            proposalId: proposal?.id,
            stepId: step?.id,
          }
        });
        const verifyCodeErrorCode = verifyCodeResponse.verifySmsVotePhoneNumber?.errorCode;

        if (verifyCodeErrorCode !== null) {
          setIsLoading(false);
        }

        if (verifyCodeErrorCode === 'CODE_EXPIRED') {
          return intl.formatMessage({ id: 'CODE_EXPIRED' });
        }

        if (verifyCodeErrorCode === 'CODE_NOT_VALID') {
          return intl.formatMessage({ id: 'CODE_NOT_VALID' });
        }

        if (verifyCodeErrorCode === 'TWILIO_API_ERROR') {
          mutationErrorToast(intl);
        }

        const token = verifyCodeResponse.verifySmsVotePhoneNumber?.token ?? '';
        if (token) {
          CookieMonster.addAnonymousAuthenticatedWithConfirmedPhone(token);
        }

        const addProposalSmsVoteResponse: AddProposalSmsVoteMutationResponse = await AddProposalSmsVoteMutation.commit(
          {
            input: {
              token,
              proposalId: proposal?.id,
              stepId: step?.id,
              consentSmsCommunication
            },
            token
          }
        )

        const addSmsVoteErrorCode = addProposalSmsVoteResponse.addProposalSmsVote?.errorCode ?? null;
        if (addSmsVoteErrorCode !== null) {
          setIsLoading(false);
        }

        if (addSmsVoteErrorCode === 'PHONE_NOT_FOUND') {
          return mutationErrorToast(intl);
        }

        if (['VOTE_LIMIT_REACHED', 'PROPOSAL_ALREADY_VOTED'].includes(addSmsVoteErrorCode)) {
          setStatus(addSmsVoteErrorCode);
          goToNextStep();
          return;
        }

        setVerified(true);
        setIsLoading(false);
        setStatus('SUCCESS');
        goToNextStep();
      } catch (e) {
        mutationErrorToast(intl);
      }
    }

    return true;
  };

  const sendNewPhoneValidationCode = async () => {
    try {
      const input = {
        phone: parsedPhone,
        proposalId: proposal?.id,
        stepId: step?.id,
      }
      const response: SendSmsProposalVoteMutationResponse = await SendSmsProposalVoteMutation.commit({ input });
      const errorCode = response.sendSmsProposalVote?.errorCode;
      if (errorCode === 'RETRY_LIMIT_REACHED') {
        setLimitReached(true);
      }
    } catch (e) {
      mutationErrorToast(intl);
    }
  };

  return (
    <>
      <ResetCss>
        <MultiStepModal.Header>
          <Text uppercase color="neutral-gray.500" fontWeight={700} fontSize={1} lineHeight="sm">{intl.formatMessage({ id: 'proposal.validate.vote' })}</Text>
          <Heading>{intl.formatMessage({id: 'number-verification'})}</Heading>
        </MultiStepModal.Header>
      </ResetCss>
      <MultiStepModal.Body>
        <Flex as="form" direction="column" spacing={3} align="center" justify="center">
          <SpotIcon name={CapUISpotIcon.ADD_CONTACT} size={CapUISpotIconSize.Lg} />
          <Text textAlign="center" fontSize="18px" lineHeight="24px">
            <FormattedHTMLMessage
              id="confirmation.code.header.title"
              values={{ phoneNumber: phoneSplitter(formatPhoneNumber(phone)) }}
            />
          </Text>
          <FormControl
            name="code"
            control={control}
            isRequired
            isDisabled={formState.isSubmitting}
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
      </MultiStepModal.Body>
      <MultiStepModal.Footer>
        <Button
          onClick={goToPreviousStep}
          variant="secondary"
          variantColor="hierarchy"
          variantSize="medium"
        >
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="medium"
          rightIcon={CapUIIcon.LongArrowRight}
          onClick={goToNextStep}
          isLoading={isLoading}
          disabled={form.watch('code') === 0 || hasErrors}
        >
          {intl.formatMessage({ id: 'proposal.validate.vote' })}
        </Button>
      </MultiStepModal.Footer>
    </>
  );
};

export default ProposalVoteSmsConfirmationModal;

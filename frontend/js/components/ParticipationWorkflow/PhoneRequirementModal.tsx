import * as React from 'react';
import { useIntl } from 'react-intl';
import { Box, useMultiStepModal, Button, FormLabel, Flex, InputGroup } from '@cap-collectif/ui';
import { useFormContext } from 'react-hook-form';
import { COUNTRY_CODES, FieldInput, FormControl } from '@cap-collectif/form';
import ModalLayout from './ModalLayout';
import { useSendParticipantPhoneValidationCodeMutation } from '~/mutations/SendParticipantPhoneValidationCodeMutation';
import { useSendSmsPhoneValidationCodeMutation } from '~/mutations/SendSmsPhoneValidationCodeMutation';
import { useUpdateProfilePersonalDataMutation } from '~/mutations/UpdateProfilePersonalDataMutation';
import CookieMonster from '@shared/utils/CookieMonster';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { useSelector } from 'react-redux';
import type { GlobalState } from '~/types';
import { useUpdateParticipantMutation } from '~/mutations/UpdateParticipantMutation';
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal';
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext';
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader';

type FormValues = Pick<WorkflowFormValues, 'phone' | 'countryCode'>;

type Props = {
    isPhoneVerifiedRequired: boolean,
    hideGoBackArrow: boolean,
};

const PHONE_LENGTH = 10;

const PhoneRequirementModal: React.FC<Props> = ({ isPhoneVerifiedRequired, hideGoBackArrow }) => {
    const { goToNextStep } = useMultiStepModal();
    const intl = useIntl();
    const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user);
    const updateParticipantMutation = useUpdateParticipantMutation();
    const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation();
    const sendParticipantPhoneValidationCodeMutation =
        useSendParticipantPhoneValidationCodeMutation();
    const sendSmsPhoneValidationCodeMutation = useSendSmsPhoneValidationCodeMutation();

    const { control, handleSubmit, setFocus, setError } = useFormContext();

    const { stepId } = useParticipationWorkflow();

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setFocus('phone');
        }, 100);
        return () => clearTimeout(timeout);
    }, [setFocus]);

    const isLoading =
        updateParticipantMutation.isLoading ||
        updateProfilePersonalDataMutation.isLoading ||
        sendParticipantPhoneValidationCodeMutation.isLoading ||
        sendSmsPhoneValidationCodeMutation.isLoading;

    const updateParticipantPhone = (phone: string) => {
        const input = {
            phone,
            token: CookieMonster.getParticipantCookie(),
        };
        updateParticipantMutation.commit({
            variables: {
                input,
            },
            onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                    if (errors?.[0]?.message === 'PHONE_SHOULD_BE_MOBILE_NUMBER') {
                        setError('phone', {
                            type: 'manual',
                            message: intl.formatMessage({
                                id: 'number-must-start-with-zero-six-or-seven',
                            }),
                        });
                        return;
                    }

                    return mutationErrorToast(intl);
                }
                if (isPhoneVerifiedRequired) {
                    sendCodeToParticipant(phone);
                    return;
                }
                goToNextStep();
            },
            onError: () => {
                return mutationErrorToast(intl);
            },
        });
    };
    const sendCodeToParticipant = (phone: string) => {
        const input = {
            phone: phone,
            token: CookieMonster.getParticipantCookie(),
        };

        sendParticipantPhoneValidationCodeMutation.commit({
            variables: {
                input,
            },
            onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                    return mutationErrorToast(intl);
                }
                const errorCode = response?.sendParticipantPhoneValidationCode?.errorCode;

                if (!errorCode) {
                    goToNextStep();
                }

                switch (errorCode) {
                    case null:
                        break;
                    case 'INVALID_NUMBER':
                        setError('phone', {
                            type: 'manual',
                            message: intl.formatMessage({
                                id: 'profile.constraints.phone.invalid',
                            }),
                        });
                        return;
                    case 'RETRY_LIMIT_REACHED':
                        setError('phone', {
                            type: 'manual',
                            message: intl.formatMessage({
                                id: 'participant-email-verification-retry-limit-error',
                            }),
                        });
                        return;
                    case 'SERVER_ERROR':
                    default:
                        return mutationErrorToast(intl);
                }
            },
            onError: () => {
                return mutationErrorToast(intl);
            },
        });
    };

    const updateUserPhone = (phone: string) => {
        const input = {
            phone,
            stepId,
        };
        updateProfilePersonalDataMutation.commit({
            variables: {
                input,
            },
            onCompleted: async (response, errors) => {
                if (errors && errors.length > 0) {
                    if (errors?.[0]?.message === 'PHONE_SHOULD_BE_MOBILE_NUMBER') {
                        setError('phone', {
                            type: 'manual',
                            message: intl.formatMessage({
                                id: 'number-must-start-with-zero-six-or-seven',
                            }),
                        });
                        return;
                    }
                    return mutationErrorToast(intl);
                }
                if (isPhoneVerifiedRequired) {
                    sendCodeToUser();
                    return;
                }
                goToNextStep();
            },
            onError: () => {
                return mutationErrorToast(intl);
            },
        });
    };

    const sendCodeToUser = () => {
        const input = {};
        sendSmsPhoneValidationCodeMutation.commit({
            variables: {
                input,
            },
            onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                    return mutationErrorToast(intl);
                }
                const errorCode = response?.sendSmsPhoneValidationCode?.errorCode;

                if (!errorCode) {
                    goToNextStep();
                }

                switch (errorCode) {
                    case null:
                        break;
                    case 'INVALID_NUMBER':
                        setError('phone', {
                            type: 'manual',
                            message: intl.formatMessage({
                                id: 'profile.constraints.phone.invalid',
                            }),
                        });
                        return;
                    case 'RETRY_LIMIT_REACHED':
                        setError('phone', {
                            type: 'manual',
                            message: intl.formatMessage({
                                id: 'participant-email-verification-retry-limit-error',
                            }),
                        });
                        return;
                    case 'SERVER_ERROR':
                    default:
                        return mutationErrorToast(intl);
                }
            },
            onError: () => {
                return mutationErrorToast(intl);
            },
        });
    };

    const onSubmit = async (values: FormValues) => {
        const getPhone = () => {
            const phone = values.phone.startsWith('0') ? values.phone.slice(1) : values.phone;
            return `${values.countryCode}${phone}`;
        };

        if (isAuthenticated) {
            updateUserPhone(getPhone());
        } else {
            updateParticipantPhone(getPhone());
        }
    };

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
                title={intl.formatMessage({ id: 'participation-workflow.phone_number' })}
                info={intl.formatMessage({ id: 'participation-workflow.phone_helptext' })}>
                <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
                    <FormLabel
                        htmlFor="phone"
                        label={intl.formatMessage({ id: 'form.label_phone' })}
                    />
                    <Flex>
                        <InputGroup width="100%">
                            <FormControl
                                name="countryCode"
                                control={control}
                                isDisabled
                                width="max-content">
                                <FieldInput
                                    uniqueCountry={COUNTRY_CODES.FR}
                                    type="flagSelect"
                                    name="countryCode"
                                    control={control}
                                    placeholder={intl.formatMessage({
                                        id: 'select.country.placeholder',
                                    })}
                                    defaultValue="+33"
                                />
                            </FormControl>
                            <FormControl
                                name="phone"
                                control={control}
                                isRequired
                                width="auto"
                                flex={1}>
                                <FieldInput
                                    id="phone"
                                    name="phone"
                                    control={control}
                                    type="tel"
                                    rules={{
                                        pattern: {
                                            value: /^\d*$/,
                                            message: intl.formatMessage({
                                                id: 'field-must-contains-number',
                                            }),
                                        },
                                        validate: {
                                            exact: v =>
                                                v.length === PHONE_LENGTH ||
                                                intl.formatMessage(
                                                    { id: 'characters-required' },
                                                    { length: PHONE_LENGTH },
                                                ),
                                            startWithZero: v => {
                                                return (
                                                    v.startsWith('06') ||
                                                    v.startsWith('07') ||
                                                    intl.formatMessage({
                                                        id: 'number-must-start-with-zero-six-or-seven',
                                                    })
                                                );
                                            },
                                        },
                                    }}
                                />
                            </FormControl>
                        </InputGroup>
                    </Flex>
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

export default PhoneRequirementModal;

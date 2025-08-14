import React from 'react';
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout';
import {
    Box,
    Button,
    CapInputSize,
    Flex,
    FormLabel,
    Text,
    useMultiStepModal,
    toast,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useIntl, FormattedHTMLMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import useIsMobile from '~/utils/hooks/useIsMobile';
import RetryLoginModal from '~/components/ParticipationWorkflow/RetryLoginModal';
import ForgotPassword from '~/components/ParticipationWorkflow/ForgotPassword';
import { MAGIC_LINK_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailMagicLinkForm';
import { PARTICIPANT_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailParticipantForm';
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext';

type FormValues = { email: string, password: string };

type Props = {
    children: React.ReactNode,
};

type FormState = 'LOADING' | 'ERROR';

export const ACCOUNT_LOGIN_FORM_INDEX = 3;

const EmailAccountLoginForm: React.FC<Props> = ({ children }) => {
    const intl = useIntl();
    const { setCurrentStep } = useMultiStepModal();
    const { requirementsUrl } = useParticipationWorkflow();

    const isMobile = useIsMobile();
    const isDesktop = !isMobile;

    const [formState, setFormState] = React.useState<FormState>(null);
    const isLoading = formState === 'LOADING';
    const hasError = formState === 'ERROR';
    const resetFormState = () => setFormState(null);

    const { handleSubmit, control, watch, setValue, setError, clearErrors } =
        useFormContext<FormValues>();

    const email = watch('email');
    const clearPassword = () => setValue('password', '');

    const goToMagicLinkForm = () => setCurrentStep(MAGIC_LINK_FORM_INDEX);
    const goToParticipantForm = () => setCurrentStep(PARTICIPANT_FORM_INDEX);

    React.useEffect(() => {
        clearErrors('email');
    }, [clearErrors]);

    const login = async ({ email, password }: FormValues) => {
        const body = {
            username: email,
            password,
            displayCaptcha: false,
            captcha: null,
        };

        setFormState('LOADING');

        const response = await fetch(`${window.location.origin}/login_check`, {
            method: 'POST',
            body: JSON.stringify(body),
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            setFormState('ERROR');
            if (isDesktop) {
                setError('email', {
                    type: 'manual',
                    message: '',
                });
                setError('password', {
                    type: 'manual',
                    message: intl.formatMessage({ id: 'login-informations-incorrect' }),
                });
            }
            return;
        }

        resetFormState();

        window.location.href = requirementsUrl;
    };

    const showDesktopError = hasError && isDesktop;
    const title = showDesktopError ? 'impossible-to-login' : 'happy-to-see-you-again';
    const info = showDesktopError ? <FormattedHTMLMessage id="modal-login-failure-body" /> : null;

    return (
        <>
            <RetryLoginModal
                show={hasError && isMobile}
                email={email}
                clearPassword={clearPassword}
                onClose={resetFormState}
            />
            <ModalLayout
                onClose={() => {}}
                title={intl.formatMessage({ id: title })}
                info={info}
                onBack={goToParticipantForm}>
                <Box as="form" width="100%" onSubmit={handleSubmit(login)}>
                    <FormControl name="email" control={control} isRequired>
                        <FormLabel
                            htmlFor="email"
                            label={intl.formatMessage({ id: 'user_email' })}
                        />
                        <FieldInput
                            id="email"
                            name="email"
                            control={control}
                            type="email"
                            variantSize={CapInputSize.Md}
                            placeholder={intl.formatMessage({ id: 'email.placeholder' })}
                        />
                    </FormControl>
                    <FormControl name="password" control={control} isRequired>
                        <FormLabel
                            htmlFor="password"
                            label={intl.formatMessage({ id: 'global.password' })}
                        />
                        <FieldInput
                            id="password"
                            name="password"
                            control={control}
                            type="password"
                            variantSize={CapInputSize.Md}
                        />
                    </FormControl>
                    <Flex direction="column">
                        <Button
                            variantSize="big"
                            justifyContent="center"
                            width="100%"
                            type="submit"
                            isLoading={isLoading}>
                            {intl.formatMessage({ id: 'global.login_me' })}
                        </Button>
                        {showDesktopError && (
                            <ForgotPassword email={email}
                                onSuccess={() => {
                                    toast({
                                        variant: 'success',
                                        content: intl.formatMessage({ id: 'reinit-password-email-sent' })
                                    })
                                }}
                            >
                                {({ sendForgotPasswordEmail, isLoading }) => (
                                    <Button
                                        display="flex"
                                        justifyContent="center"
                                        my={4}
                                        variant="tertiary"
                                        onClick={sendForgotPasswordEmail}
                                        isLoading={isLoading}>
                                        {intl.formatMessage({ id: 'global.forgot_password' })}
                                    </Button>
                                )}
                            </ForgotPassword>
                        )}
                        <Flex alignItems="center" my={3}>
                            <Text border="1px solid #EBEBEB" width="100%" m={0} />
                            <Text px={2} m={0}>
                                {intl.formatMessage({ id: 'global.or' })}
                            </Text>
                            <Text border="1px solid #EBEBEB" width="100%" m={0} />
                        </Flex>
                        <Button
                            variantSize="big"
                            justifyContent="center"
                            width="100%"
                            type="button"
                            variant="secondary"
                            onClick={goToMagicLinkForm}>
                            {intl.formatMessage({ id: 'get-connection-link' })}
                        </Button>
                        {children}
                    </Flex>
                </Box>
            </ModalLayout>
        </>
    );
};

export default EmailAccountLoginForm;

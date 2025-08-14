// import React from 'react';
// import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout';
// import { Box, Button, toast } from '@cap-collectif/ui';
// import { useIntl } from 'react-intl';
// import { useForm, useFormContext } from 'react-hook-form';
// import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext';
// import { useRegisterMutation } from '@mutations/RegisterMutation';
//
// import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
// import CookieMonster from '@shared/utils/CookieMonster';
// import Password from '@shared/form/Password';
//
// type FormValues = {
//     plainPassword: string,
// };
//
// type Props = {
//     email: string,
// };
//
// const CreateAccountModal: React.FC<Props> = ({ email }) => {
//     const { contributionUrl } = useParticipationWorkflow();
//     const intl = useIntl();
//
//     const { handleSubmit } = useFormContext<FormValues>();
//     const { setError, setFocus } = useForm();
//
//     const registerMutation = useRegisterMutation();
//
//     React.useEffect(() => {
//         const timeout = setTimeout(() => {
//             setFocus('plainPassword');
//         }, 100);
//         return () => clearTimeout(timeout);
//     }, [setFocus]);
//
//     const redirect = () => {
//         window.location.href = contributionUrl;
//     };
//     const onSubmit = (values: FormValues) => {
//         const { plainPassword } = values;
//         const username = `Participant${Math.floor(1000000000 + Math.random() * 9000000000)}`;
//
//         const input = {
//             email,
//             plainPassword,
//             username,
//             responses: [],
//         };
//         registerMutation.commit({
//             variables: {
//                 input,
//             },
//             onCompleted: async (response, errors) => {
//                 if (errors && errors.length > 0) {
//                     debugger;
//                     return mutationErrorToast(intl);
//                 }
//
//                 const errorsCode = response?.register?.errorsCode;
//
//                 if (errorsCode) {
//                     errorsCode.forEach(errorCode => {
//                         if (
//                             errorCode === 'CAPTCHA_INVALID' &&
//                             window &&
//                             window.location.host !== 'capco.test'
//                         )
//                             setError('_error', {
//                                 message: 'registration.constraints.captcha.invalid',
//                             });
//                         if (errorCode === 'EMAIL_ALREADY_USED')
//                             setError('email', {
//                                 message: intl.formatMessage({
//                                     id: 'registration.constraints.email.already_used',
//                                 }),
//                             });
//                         if (errorCode === 'EMAIL_DOMAIN_NOT_AUTHORIZED')
//                             setError('email', {
//                                 message: intl.formatMessage({
//                                     id: 'registration.constraints.email.not_authorized',
//                                 }),
//                             });
//                         if (errorCode === 'RATE_LIMIT_REACHED')
//                             setError('email', {
//                                 message: intl.formatMessage({
//                                     id: 'registration.constraints.rate.limit.reached',
//                                 }),
//                             });
//                     });
//                     return;
//                 }
//
//                 toast({
//                     content: intl.formatMessage({ id: 'alert.success.add.user' }),
//                     variant: 'success',
//                 });
//
//                 const adCookie = !(
//                     typeof CookieMonster.adCookieConsentValue() === 'undefined' ||
//                     CookieMonster.adCookieConsentValue() === false
//                 );
//
//                 if (adCookie) {
//                     // @ts-expect-error call to window function not currently well typed
//                     window.App.dangerouslyExecuteHtml(query.registrationScript);
//                 }
//
//                 return fetch(`${window.location.origin}/login_check`, {
//                     method: 'POST',
//                     body: JSON.stringify({ username: email, password: plainPassword }),
//                     credentials: 'include',
//                     headers: {
//                         Accept: 'application/json',
//                         'Content-Type': 'application/json',
//                         'X-Requested-With': 'XMLHttpRequest',
//                     },
//                 })
//                     .then(response => {
//                         if (response.status >= 500) mutationErrorToast(intl);
//                         return response.json();
//                     })
//                     .then((response: { success?: boolean }) => {
//                         if (response.success) {
//                             return (window.location.href = `${contributionUrl}?toast={"variant":"success","message":"account-created-welcome"}`);
//                         }
//                     })
//                     .catch(() => {
//                         return mutationErrorToast(intl);
//                     });
//             },
//             onError: () => {
//                 debugger;
//                 return mutationErrorToast(intl);
//             },
//         });
//     };
//
//     return (
//         <>
//             <ModalLayout
//                 onClose={() => {}}
//                 title={intl.formatMessage({ id: 'vote_step.participation_validated' })}
//                 info={intl.formatMessage({ id: 'participation-workflow.create-account-helptext' })}>
//                 <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
//                     <Password id="plainPassword" name="plainPassword" />
//                     <Button
//                         variantSize="big"
//                         justifyContent="center"
//                         width="100%"
//                         type="submit"
//                         isLoading={registerMutation.isLoading}>
//                         {intl.formatMessage({ id: 'create-account' })}
//                     </Button>
//                     <Button
//                         mt={2}
//                         variant="tertiary"
//                         variantSize="big"
//                         justifyContent="center"
//                         width="100%"
//                         onClick={redirect}>
//                         {intl.formatMessage({ id: 'back-to-platform' })}
//                     </Button>
//                 </Box>
//             </ModalLayout>
//         </>
//     );
// };
//
// export default CreateAccountModal;

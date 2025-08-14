import * as React from 'react';
import { useIntl } from 'react-intl';
import { Button, toast, Text, Flex, useMultiStepModal } from '@cap-collectif/ui'
import ModalLayout from './ModalLayout';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { getSniperLink } from '~/components/ParticipationWorkflow/utils'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { graphql, useFragment } from 'react-relay'
import CookieMonster from '@shared/utils/CookieMonster'
import { useSendParticipantEmailWorkflowMutation } from '~/mutations/SendParticipantEmailWorkflowMutation'
import { MAGIC_LINK_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailMagicLinkForm'
import { EmailMagicLinkCheckEmail_query$key } from '~relay/EmailMagicLinkCheckEmail_query.graphql'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import EmailInboxSVG from '~/components/ParticipationWorkflow/assets/EmailInboxSVG'



type Props = {
  query: EmailMagicLinkCheckEmail_query$key,
};

const QUERY_FRAGMENT = graphql`
    fragment EmailMagicLinkCheckEmail_query on Query {
        senderEmails {
            address
            isDefault
        }
    }
`

export const MAGIC_LINK_CHECK_EMAIL_INDEX= 8

const EmailMagicLinkCheckEmail: React.FC<Props> = ({ query: queryRef }) => {
  const query = useFragment(QUERY_FRAGMENT, queryRef);
  const isMobile = useIsMobile();
  const intl = useIntl();
  const { requirementsUrl } = useParticipationWorkflow()
  const sendParticipantEmailWorkflowMutation = useSendParticipantEmailWorkflowMutation();
  const {setCurrentStep} = useMultiStepModal();

  const [hasRetryError, setHasRetryError] = React.useState(false);
  const [remainingSecondsUntilRetry, setRemainingSecondsUntilRetry] = React.useState(60);

  const { watch } = useFormContext();

  const email = watch('email');

  const fromEmail = query.senderEmails.find(email => email.isDefault === true)?.address;

  const sniperLink = getSniperLink({
    userEmail: email,
    fromEmail
  });

  const goToMagicLinkForm = () => setCurrentStep(MAGIC_LINK_FORM_INDEX);

    const receiveNewMail = () => {
        const input = {
            email,
            participantToken: CookieMonster.getParticipantCookie(),
            redirectUrl: requirementsUrl,
            emailType: 'MAGIC_LINK'
        } as const;

        sendParticipantEmailWorkflowMutation.commit({
            variables: {
                input,
            },
            onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                    return mutationErrorToast(intl);
                }

                const errorCode = response.sendParticipantEmailWorkflow?.errorCode;

                if (errorCode === 'EMAIL_RECENTLY_SENT') {
                    setRemainingSecondsUntilRetry(60);
                    setHasRetryError(true);
                    return;
                }

                toast({
                    variant: 'success',
                    content: intl.formatMessage({ id: 'user.confirm.sent' }),
                });
            },
            onError: () => {
                return mutationErrorToast(intl);
            },
        });
    };

  useEffect(() => {
    if (!hasRetryError) {
      return;
    }

    const intervalId = setInterval(() => {
      if (remainingSecondsUntilRetry > 0) {
        setRemainingSecondsUntilRetry(prevSeconds => prevSeconds - 1);
      } else {
        clearInterval(intervalId);
        setHasRetryError(false);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingSecondsUntilRetry, hasRetryError]);

    const showSniperLink = sniperLink !== null && !isMobile

    return (
    <>
      <ModalLayout
        onBack={goToMagicLinkForm}
        title={intl.formatMessage({ id: 'please-verify-your-email' })}
        info={
          <Flex direction="column">
              <Text>{intl.formatMessage({ id: 'participation-workflow.magic_link_helptext' })}</Text>
              <Text fontWeight={600}>{email}</Text>
              <Text>{intl.formatMessage({ id: 'dont-forget-to-check-spams' })}</Text>
          </Flex>
        }
        onClose={() => {}}
      >
        <Flex direction="column" mt={showSniperLink ? 4 : 0} width="100%" alignItems="center">
          <Flex order={[0, 1]} justifyContent="center">
            <EmailInboxSVG isMobile={isMobile} />
          </Flex>
          <Flex direction="column" width="100%" alignItems="center" mb={2}>
            {
              showSniperLink && (
                <Button as="a" target="_blank" href={sniperLink} variantSize="big" justifyContent="center" width="100%" type="submit" sx={{
                    '&:before': {
                        content: 'none'
                    }
                }}>
                    {intl.formatMessage({ id: 'open-my-inbox' })}
                </Button>
              )
            }
            {hasRetryError ? (
              <Text mt={showSniperLink ? 2 : 0}>
                {intl.formatMessage(
                  { id: 'resend-email-in-x-seconds' },
                  { x: remainingSecondsUntilRetry },
                )}
              </Text>
            ) : (
              <Button
                mt={showSniperLink ? 2 : 0}
                variant="link"
                variantSize="big"
                justifyContent="center"
                width="100%"
                type="button"
                onClick={receiveNewMail}
                isLoading={sendParticipantEmailWorkflowMutation.isLoading}>
                {intl.formatMessage({ id: 'not-received-receive-a-new-mail' })}
              </Button>
            )}
          </Flex>
        </Flex>
      </ModalLayout>
    </>
  );
};

export default EmailMagicLinkCheckEmail;

<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\ParticipationWorkflowParticipantEmailType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\ParticipationWorkflow\ConfirmationParticipationParticipantEmailSender;
use Capco\AppBundle\Service\ParticipationWorkflow\MagicLinkEmailSender;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class SendParticipantEmailWorkflowMutation implements MutationInterface
{
    use MutationTrait;

    public const EMAIL_RECENTLY_SENT = 'EMAIL_RECENTLY_SENT';

    public function __construct(
        private UserRepository $userRepository,
        private MagicLinkEmailSender $magicLinkEmailSender,
        private ConfirmationParticipationParticipantEmailSender $confirmationParticipationParticipantEmailSender
    ) {
    }

    /**
     * @return array{'errorCode': string|null, 'redirectUrl'?: string|null}
     */
    public function __invoke(Argument $argument): array
    {
        $this->formatInput($argument);

        $participantToken = $argument->offsetGet('participantToken');
        $email = $argument->offsetGet('email');
        $redirectUrl = $argument->offsetGet('redirectUrl');
        $emailType = $argument->offsetGet('emailType');

        $user = $this->userRepository->findOneBy(['email' => $email, 'confirmationToken' => null]);
        $participantAlreadyHasAnAccount = $user && $user->getEmail() === $email;

        if ($participantAlreadyHasAnAccount) {
            return $this->sendMagicLink($emailType, $email, $redirectUrl);
        }

        if (ParticipationWorkflowParticipantEmailType::MAGIC_LINK === $emailType) {
            return ['errorCode' => null];
        }

        return $this->sendParticipantConfirmationEmail($email, $participantToken, $redirectUrl);
    }

    /**
     * @return array{'errorCode': string|null, 'redirectUrl': string|null}
     */
    private function sendMagicLink(string $emailType, string $email, string $redirectUrl): array
    {
        $magicLinkTemplateVariant = ParticipationWorkflowParticipantEmailType::MAGIC_LINK === $emailType ? MagicLinkEmailSender::DEFAULT : MagicLinkEmailSender::ACCOUNT_DETECTED;
        $response = $this->magicLinkEmailSender->send($email, $redirectUrl, $magicLinkTemplateVariant);

        return ['errorCode' => $response['errorCode'], 'redirectUrl' => $response['confirmationUrl']];
    }

    /**
     * @return array{'errorCode': string|null, 'redirectUrl': string|null}
     */
    private function sendParticipantConfirmationEmail(string $email, string $participantToken, string $redirectUrl): array
    {
        $response = $this->confirmationParticipationParticipantEmailSender->send($participantToken, $email, $redirectUrl);

        return ['errorCode' => $response['errorCode'], 'redirectUrl' => $response['confirmationUrl']];
    }
}

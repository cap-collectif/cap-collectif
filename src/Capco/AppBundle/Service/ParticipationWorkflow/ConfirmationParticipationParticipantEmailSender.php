<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Exception\RecentlySentException;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantConfirmNewEmailUrlResolver;
use Capco\AppBundle\Service\EmailRateLimiter;
use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\HttpKernel\KernelInterface;

class ConfirmationParticipationParticipantEmailSender implements MutationInterface
{
    public const EMAIL_ALREADY_CONFIRMED = 'EMAIL_ALREADY_CONFIRMED';
    public const EMAIL_RECENTLY_SENT = 'EMAIL_RECENTLY_SENT';

    public function __construct(private readonly EntityManagerInterface $em, private readonly LoggerInterface $logger, private readonly Publisher $publisher, private readonly TokenGeneratorInterface $tokenGenerator, private readonly ParticipantHelper $participantHelper, private readonly EmailRateLimiter $emailRateLimiter, private readonly ParticipantConfirmNewEmailUrlResolver $participantConfirmNewEmailUrlResolver, private readonly KernelInterface $kernel, private readonly ParticipationCookieManager $participationCookieManager)
    {
    }

    /**
     * @return array{'errorCode': string|null}
     */
    public function send(string $token, string $email, string $redirectUrl): array
    {
        $participant = $this->participantHelper->getParticipantByToken($token);

        $currentEmail = $participant->getEmail();
        if ($currentEmail !== $email) {
            $confirmationToken = $this->tokenGenerator->generateToken();
            $participant->setConfirmationToken($confirmationToken);
            $participant->setNewEmailToConfirm($email);
            $participant->setNewEmailConfirmationToken($confirmationToken);
        }

        if ($participant->isEmailConfirmed() && !$participant->getNewEmailToConfirm()) {
            $this->logger->warning('Already confirmed.');

            return ['errorCode' => self::EMAIL_ALREADY_CONFIRMED, 'confirmationUrl' => null];
        }

        try {
            $this->rateLimit($email);
        } catch (RecentlySentException) {
            return ['errorCode' => self::EMAIL_RECENTLY_SENT, 'confirmationUrl' => null];
        }

        $participationCookies = $this->participationCookieManager->all();
        if ($participant->getNewEmailToConfirm()) {
            $payload = json_encode([
                'participantId' => $participant->getId(),
                'redirectUrl' => $redirectUrl,
                'participationCookies' => $participationCookies,
            ]);

            if ($payload) {
                $this->publisher->publish(
                    CapcoAppBundleMessagesTypes::PARTICIPANT_CONFIRMATION_EMAIL,
                    new Message(
                        $payload
                    )
                );
            }
        }

        $participant->setEmailConfirmationSentAt(new \DateTime());
        $this->em->flush();

        $confirmationUrl = null;
        if ('test' === $this->kernel->getEnvironment()) {
            $confirmationUrl = $this->participantConfirmNewEmailUrlResolver->__invoke($participant, $redirectUrl, $participationCookies);
        }

        return ['errorCode' => null, 'confirmationUrl' => $confirmationUrl];
    }

    private function rateLimit(string $email): void
    {
        $encodedEmail = base64_encode($email);
        $cacheKey = "participant.confirmation.email.{$encodedEmail}";
        $this->emailRateLimiter->rateLimit($cacheKey);
    }
}

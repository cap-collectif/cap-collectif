<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class ResendEmailConfirmationMutation implements MutationInterface
{
    use ResolverTrait;

    public const EMAIL_ALREADY_CONFIRMED = 'EMAIL_ALREADY_CONFIRMED';
    public const EMAIL_RECENTLY_SENT = 'EMAIL_RECENTLY_SENT';

    private EntityManagerInterface $em;
    private LoggerInterface $logger;
    private FOSNotifier $notifier;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        FOSNotifier $notifier,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->notifier = $notifier;
        $this->publisher = $publisher;
    }

    public function __invoke($user): array
    {
        $user = $this->preventNullableViewer($user);

        if ($user->isEmailConfirmed() && !$user->getNewEmailToConfirm()) {
            $this->logger->warning('Already confirmed.');

            return ['errorCode' => self::EMAIL_ALREADY_CONFIRMED];
        }

        // security against mass click email resend
        if ($user->getEmailConfirmationSentAt() > (new \DateTime())->modify('- 1 minutes')) {
            $this->logger->warning('Email already sent less than a minute ago.');

            return ['errorCode' => self::EMAIL_RECENTLY_SENT];
        }

        if ($user->getNewEmailToConfirm()) {
            $this->publisher->publish(
                'user.email',
                new Message(
                    json_encode([
                        'userId' => $user->getId(),
                    ])
                )
            );
        } else {
            $this->notifier->sendConfirmationEmailMessage($user);
        }

        $user->setEmailConfirmationSentAt(new \DateTime());
        $this->em->flush();

        return ['errorCode' => null];
    }
}

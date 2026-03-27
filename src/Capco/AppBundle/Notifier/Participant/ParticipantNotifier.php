<?php

namespace Capco\AppBundle\Notifier\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantConfirmNewEmailUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Participant\ParticipantConfirmEmailMessage;
use Capco\AppBundle\Notifier\BaseNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

final class ParticipantNotifier extends BaseNotifier
{
    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        private readonly ParticipantConfirmNewEmailUrlResolver $participantConfirmNewEmailUrlResolver,
        private readonly LoggerInterface $logger,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function sendEmailConfirmation(Participant $participant, string $redirectUrl, string $participationCookies): void
    {
        if (null === $participant->getNewEmailToConfirm()) {
            $this->logger->error(__METHOD__ . ' participant new email must exist');

            return;
        }

        if (null === $participant->getNewEmailConfirmationToken()) {
            $this->logger->error(__METHOD__ . ' participant new email confirmation token must exist');

            return;
        }

        $this->mailer->createAndSendMessage(
            ParticipantConfirmEmailMessage::class,
            $participant,
            ['confirmationURL' => $this->participantConfirmNewEmailUrlResolver->__invoke($participant, $redirectUrl, $participationCookies)],
            $participant,
            $participant->getNewEmailToConfirm()
        );
    }
}

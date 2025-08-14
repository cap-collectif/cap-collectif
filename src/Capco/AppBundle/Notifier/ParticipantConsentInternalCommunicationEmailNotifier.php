<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\ParticipantConsentInternalCommunicationEmailMessage;
use Capco\AppBundle\Mailer\Message\ParticipantConsentInternalCommunicationRegisterEmailMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

class ParticipantConsentInternalCommunicationEmailNotifier extends BaseNotifier
{
    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function sendConfirmConsentInternalCommunicationEmail(string $email, string $confirmationUrl): void
    {
        $params = ['confirmationUrl' => $confirmationUrl];

        $this->mailer->createAndSendMessage(
            ParticipantConsentInternalCommunicationEmailMessage::class,
            null,
            $params,
            null,
            $email
        );
    }

    public function sendRegisterEmail(string $email, string $redirectUrl): void
    {
        $params = ['redirectUrl' => $redirectUrl];

        $this->mailer->createAndSendMessage(
            ParticipantConsentInternalCommunicationRegisterEmailMessage::class,
            null,
            $params,
            null,
            $email
        );
    }
}

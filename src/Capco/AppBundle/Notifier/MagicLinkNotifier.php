<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\MagicLinkMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;

class MagicLinkNotifier extends BaseNotifier
{
    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function sendEmail(User $user, string $magicLinkUrl, string $variant): void
    {
        $params = ['magicLinkUrl' => $magicLinkUrl, 'variant' => $variant];

        $this->mailer->createAndSendMessage(
            MagicLinkMessage::class,
            $user,
            $params,
            $user
        );
    }
}

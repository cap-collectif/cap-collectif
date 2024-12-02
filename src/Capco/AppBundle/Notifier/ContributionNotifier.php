<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Contribution\ContributionModerationMessage;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

final class ContributionNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        protected UrlResolver $urlResolver,
        RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onModeration(Contribution $contribution)
    {
        if ($contribution->getAuthor()) {
            $this->mailer->createAndSendMessage(
                ContributionModerationMessage::class,
                $contribution,
                ['trashURL' => $this->urlResolver->getObjectUrl($contribution, true)],
                $contribution->getAuthor()
            );
        }
    }
}

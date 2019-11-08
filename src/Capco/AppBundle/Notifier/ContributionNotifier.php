<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Contribution\ContributionModerationMessage;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

final class ContributionNotifier extends BaseNotifier
{
    protected $urlResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UrlResolver $urlResolver,
        RouterInterface $router
    ) {
        parent::__construct($mailer, $siteParams, $router);
        $this->urlResolver = $urlResolver;
    }

    public function onModeration(Contribution $contribution)
    {
        if ($contribution->getAuthor()) {
            $this->mailer->sendMessage(
                ContributionModerationMessage::create(
                    $contribution,
                    $this->urlResolver->getObjectUrl($contribution, true),
                    $contribution->getAuthor()->getEmail()
                )
            );
        }
    }
}

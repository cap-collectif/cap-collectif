<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Contribution\ContributionModerationMessage;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;

final class ContributionNotifier extends BaseNotifier
{
    protected $urlResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        UrlResolver $urlResolver
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->urlResolver = $urlResolver;
    }

    public function onModeration(Contribution $contribution)
    {
        if ($contribution->getAuthor()) {
            $this->mailer->sendMessage(
                ContributionModerationMessage::create(
                    $contribution,
                    $this->urlResolver->getAdminObjectUrl($contribution, true),
                    $contribution->getAuthor()->getEmail()
                )
            );
        }
    }
}

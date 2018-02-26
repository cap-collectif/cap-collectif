<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Follower\FollowerActivitiesMessage;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Psr\Log\LoggerInterface;

final class FollowerNotifier extends BaseNotifier
{
    protected $urlResolver;

    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver, UrlResolver $urlResolver, LoggerInterface $logger)
    {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->urlResolver = $urlResolver;
    }

    public function onReportActivities(UserActivity $userActivity, string $sendAt)
    {
        $this->mailer->sendMessage(
            FollowerActivitiesMessage::create(
                $userActivity->getEmail(),
                $userActivity->getUsername(),
                'notifier@cap-collectif.com',
                $userActivity->getUserProjects(),
                $sendAt
            )
        );
    }
}

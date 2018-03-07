<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Follower\FollowerActivitiesMessage;
use Capco\AppBundle\Model\UserActivity;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Psr\Log\LoggerInterface;

final class FollowerNotifier extends BaseNotifier
{
    protected $urlResolver;
    protected $logger;

    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver, UrlResolver $urlResolver, LoggerInterface $logger)
    {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->urlResolver = $urlResolver;
        $this->logger = $logger;
    }

    public function onReportActivities(UserActivity $userActivity, \DateTime $sendAt, string $siteName, $siteUrl)
    {
        $this->mailer->sendMessage(
            FollowerActivitiesMessage::create(
                $userActivity->getEmail(),
                $userActivity->getUsername(),
                $userActivity->getUserProjects(),
                $sendAt,
                $siteName,
                $siteUrl,
                $userActivity->getUrlManagingFollowings()
            )
        );
    }

    public function onReportActivities(\stdClass $userActivities)
    {
        $this->mailer->sendMessage(
            FollowerActivitiesMessage::create(
                $userActivity->getEmail(),
                $userActivity->getUsername(),
                'notifier@cap-collectif.com',
                $userActivity->getUserProjects(),
                $sendAt,
                $siteName,
                $siteUrl,
                $userActivity->getUrlManagingFollowings()
            )
        );
    }
}

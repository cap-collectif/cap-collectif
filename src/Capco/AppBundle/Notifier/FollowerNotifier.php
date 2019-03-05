<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Follower\FollowerActivitiesMessage;
use Capco\AppBundle\Model\UserActivity;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Routing\Router;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

final class FollowerNotifier extends BaseNotifier
{
    protected $urlResolver;
    protected $siteParams;
    protected $logger;
    protected $router;
    protected $siteName;
    protected $siteUrl;
    protected $sendAt;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        UrlResolver $urlResolver,
        LoggerInterface $logger,
        Router $router
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->urlResolver = $urlResolver;
        $this->logger = $logger;
        $this->siteParams = $siteParams;
        $this->router = $router;

        $this->siteName = $siteParams->getValue('global.site.fullname');
        $this->siteUrl = $router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL);
        $this->sendAt = (new \DateTime('yesterday'))->setTimezone(
            new \DateTimeZone('Europe/Paris')
        );
    }

    public function onReportActivities(UserActivity $userActivity)
    {
        $this->mailer->sendMessage(
            FollowerActivitiesMessage::create(
                $userActivity->getEmail(),
                $userActivity->getUsername(),
                $userActivity->getUserProjects(),
                $this->sendAt,
                $this->siteName,
                $this->siteUrl,
                $userActivity->getUrlManagingFollowings()
            )
        );
    }
}

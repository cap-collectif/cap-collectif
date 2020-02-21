<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Follower\FollowerActivitiesMessage;
use Capco\AppBundle\Model\UserActivity;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

final class FollowerNotifier extends BaseNotifier
{
    protected $urlResolver;
    protected $siteParams;
    protected $logger;
    protected $sendAt;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        UrlResolver $urlResolver,
        LoggerInterface $logger,
        RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->urlResolver = $urlResolver;
        $this->logger = $logger;
        $this->siteParams = $siteParams;
    }

    public function setSendAt(string $relativeTime)
    {
        $this->sendAt = (new \DateTime($relativeTime))->setTimezone(
            new \DateTimeZone('Europe/Paris')
        );
    }

    public function onReportActivities(UserActivity $userActivity)
    {
        $recipient = new User();
        $recipient->setUsername($userActivity->getUsername());
        $recipient->setEmail($userActivity->getEmail());
        $recipient->setLocale($userActivity->getLocale());

        $this->mailer->createAndSendMessage(
            FollowerActivitiesMessage::class,
            $userActivity,
            ['sendAt' => $this->sendAt],
            $recipient
        );
    }
}

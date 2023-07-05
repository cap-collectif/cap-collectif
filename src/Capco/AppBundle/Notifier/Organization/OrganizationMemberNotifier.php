<?php

namespace Capco\AppBundle\Notifier\Organization;

use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Organization\InvitationMessage;
use Capco\AppBundle\Notifier\BaseNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\RouterInterface;

final class OrganizationMemberNotifier extends BaseNotifier
{
    protected Publisher $publisher;
    protected EntityManagerInterface $entityManager;
    protected LoggerInterface $logger;
    private UrlResolver $urlResolver;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        UrlResolver $urlResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->urlResolver = $urlResolver;
    }

    public function onNewInvitation(PendingOrganizationInvitation $invitation): bool
    {
        return $this->mailer->createAndSendMessage(
            InvitationMessage::class,
            $invitation,
            [
                'organizationName' => $this->organizationName,
                'invitationUrl' => $this->urlResolver->getObjectUrl($invitation, true),
                'plateformName' => $this->siteName,
                'siteName' => $this->siteName,
                'baseUrl' => $this->baseUrl,
                'siteUrl' => $this->siteUrl,
            ],
            $invitation->getUser()
        );
    }
}

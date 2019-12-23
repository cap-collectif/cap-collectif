<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\GraphQL\Resolver\User\UserLoginAndShowDataUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\UserArchive\UserArchiveGeneratedMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

final class UserArchiveNotifier extends BaseNotifier
{
    private $userLoginAndShowDataUrlResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserLoginAndShowDataUrlResolver $userLoginAndShowDataUrlResolver,
        RouterInterface $router
    ) {
        parent::__construct($mailer, $siteParams, $router);
        $this->router = $router;
        $this->userLoginAndShowDataUrlResolver = $userLoginAndShowDataUrlResolver;
    }

    public function onUserArchiveGenerated(UserArchive $archive): void
    {
        $this->mailer->sendMessage(
            UserArchiveGeneratedMessage::create(
                $archive,
                $this->baseUrl,
                $this->siteParams->getValue('global.site.fullname'),
                $this->userLoginAndShowDataUrlResolver->__invoke($archive->getUser()),
                $archive->getUser()->getEmail(),
                $this->baseUrl
            )
        );
    }
}

<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\UserArchive\UserArchiveGeneratedMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

final class UserArchiveNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        RouterInterface $router
    ) {
        parent::__construct($mailer, $siteParams, $userResolver, $router);
        $this->router = $router;
    }

    public function onUserArchiveGenerated(UserArchive $archive): void
    {
        $this->mailer->sendMessage(
            UserArchiveGeneratedMessage::create(
                $archive,
                $this->baseUrl,
                $this->siteParams->getValue('global.site.fullname'),
                $this->userResolver->resolveLoginAndShowDataUrl($archive->getUser()),
                $archive->getUser()->getEmail()
            )
        );
    }
}

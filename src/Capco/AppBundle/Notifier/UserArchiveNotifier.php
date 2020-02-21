<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\GraphQL\Resolver\User\UserLoginAndShowDataUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\UserArchive\UserArchiveGeneratedMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

final class UserArchiveNotifier extends BaseNotifier
{
    private $userLoginAndShowDataUrlResolver;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        UserLoginAndShowDataUrlResolver $userLoginAndShowDataUrlResolver,
        RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->router = $router;
        $this->userLoginAndShowDataUrlResolver = $userLoginAndShowDataUrlResolver;
    }

    public function onUserArchiveGenerated(UserArchive $archive): void
    {
        $this->mailer->createAndSendMessage(
            UserArchiveGeneratedMessage::class,
            $archive,
            [
                'downloadURL' => $this->userLoginAndShowDataUrlResolver->__invoke(
                    $archive->getUser()
                )
            ],
            $archive->getUser()
        );
    }
}

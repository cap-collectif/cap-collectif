<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\SiteParameter\Resolver;

final class UserArchiveNotifier extends BaseNotifier
{
    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver)
    {
        parent::__construct($mailer, $siteParams, $userResolver);
    }

    public function onUserArchiveRequested(UserArchive $archive): void
    {
    }
}

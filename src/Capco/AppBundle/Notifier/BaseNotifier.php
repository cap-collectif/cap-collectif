<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\SiteParameter\Resolver;

abstract class BaseNotifier
{
    protected $mailer;
    protected $siteParams;
    protected $userResolver;
    protected $message;

    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver)
    {
        $this->mailer = $mailer;
        $this->siteParams = $siteParams;
        $this->userResolver = $userResolver;
    }
}

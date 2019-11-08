<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

abstract class BaseNotifier
{
    protected $mailer;
    protected $siteParams;
    protected $message;
    protected $baseUrl;
    protected $router;
    protected $siteName;
    protected $siteUrl;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        RouterInterface $router
    ) {
        $this->mailer = $mailer;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->baseUrl = $router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
        $this->siteUrl = $siteParams->getValue('global.site.url');
        $this->siteName = $siteParams->getValue('global.site.fullname');
    }
}

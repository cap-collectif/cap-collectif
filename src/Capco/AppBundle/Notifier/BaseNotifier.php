<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
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
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        $this->mailer = $mailer;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->baseUrl = $router->generate(
            'app_homepage',
            ['_locale' => $localeResolver->getDefaultLocaleCodeForRequest()],
            RouterInterface::ABSOLUTE_URL
        );
        $this->siteUrl = $siteParams->getValue('global.site.url');
        $this->siteName = $siteParams->getValue('global.site.fullname');
    }
}

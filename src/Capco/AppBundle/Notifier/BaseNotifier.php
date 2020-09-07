<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

abstract class BaseNotifier
{
    protected MailerService $mailer;
    protected SiteParameterResolver $siteParams;
    protected string $baseUrl;
    protected RouterInterface $router;
    protected ?string $siteName;
    protected string $siteUrl;

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

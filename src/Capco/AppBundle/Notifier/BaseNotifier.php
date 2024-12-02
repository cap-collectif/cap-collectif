<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

abstract class BaseNotifier
{
    protected string $baseUrl;
    protected ?string $siteName;
    protected string $siteUrl;
    protected ?string $organizationName;

    public function __construct(
        protected MailerService $mailer,
        protected SiteParameterResolver $siteParams,
        protected RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        $this->baseUrl = $this->router->generate(
            'app_homepage',
            ['_locale' => $localeResolver->getDefaultLocaleCodeForRequest()],
            RouterInterface::ABSOLUTE_URL
        );
        $this->siteUrl = $this->siteParams->getValue('global.site.url');
        $this->siteName = $this->siteParams->getValue('global.site.fullname');
        $this->organizationName = $this->siteParams->getValue('global.site.organization_name');
    }
}

<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

abstract class BaseNotifier
{
    private ?string $baseUrl = null;
    private ?string $siteName = null;
    private ?string $siteUrl = null;
    private ?string $organizationName = null;

    public function __construct(
        protected MailerService $mailer,
        protected SiteParameterResolver $siteParams,
        protected RouterInterface $router,
        protected LocaleResolver $localeResolver
    ) {
    }

    protected function getBaseUrl(): ?string
    {
        if (null === $this->baseUrl) {
            $this->baseUrl = $this->router->generate(
                'app_homepage',
                ['_locale' => $this->localeResolver->getDefaultLocaleCodeForRequest()],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        return $this->baseUrl;
    }

    protected function getSiteName(): ?string
    {
        if (null === $this->siteName) {
            $this->siteName = $this->siteParams->getValue('global.site.fullname');
        }

        return $this->siteName;
    }

    protected function getSiteUrl(): ?string
    {
        if (null === $this->siteUrl) {
            $this->siteUrl = $this->siteParams->getValue('global.site.url');
        }

        return $this->siteUrl;
    }

    protected function getOrganizationName(): ?string
    {
        if (null === $this->organizationName) {
            $this->organizationName = $this->siteParams->getValue('global.site.organization_name');
        }

        return $this->organizationName;
    }
}

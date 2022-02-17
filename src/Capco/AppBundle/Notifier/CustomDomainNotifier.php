<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\GraphQL\Resolver\Argument\ArgumentUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\CustomDomain\CreateCustomDomainMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class CustomDomainNotifier extends BaseNotifier
{
    protected ArgumentUrlResolver $argumentUrlResolver;
    protected TranslatorInterface $translator;
    protected UserUrlResolver $userUrlResolver;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        ArgumentUrlResolver $argumentUrlResolver,
        RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->argumentUrlResolver = $argumentUrlResolver;
    }

    public function onCreation(SiteSettings $siteSettings, User $user): void
    {
        $this->mailer->createAndSendMessage(
            CreateCustomDomainMessage::class,
            $siteSettings,
            [
                'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
                'platformName' => $this->siteParams->getValue('global.site.fullname'),
            ],
            $user
        );
    }


}

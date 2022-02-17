<?php

namespace Capco\AppBundle\Mailer\Message\CustomDomain;

use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CreateCustomDomainMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'create.custom.domain.email.subject';
    public const TEMPLATE = '@CapcoMail/createCustomDomain.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(SiteSettings $siteSettings, array $params): array
    {
        return [
            "baseUrl" => $params['baseURL'],
            "organizationName" => $params['organizationName'],
            "siteName" => $params['siteName'],
            "capcoDomain" => $siteSettings->getCapcoDomain(),
            "customDomain" => $siteSettings->getCustomDomain(),
        ];
    }

    public static function getMySubjectVars(SiteSettings $siteSettings, array $params): array
    {
        return [
            'platformName' => $params['platformName']
        ];
    }

    public static function mockData()
    {
        return [
            "baseUrl" => "/capco",
            "organizationName" => "capco",
            "siteName" => "capco",
            "capcoDomain" => "domain.cap-collectif.com",
            "customDomain" => "custom.domain.cap-collectif.com",
            "user_locale" => "fr"
        ];
    }

}
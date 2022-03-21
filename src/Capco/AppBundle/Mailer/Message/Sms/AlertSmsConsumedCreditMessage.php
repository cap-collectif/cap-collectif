<?php

namespace Capco\AppBundle\Mailer\Message\Sms;

use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class AlertSmsConsumedCreditMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'sms.credit.consumed.email.subject';
    public const TEMPLATE = '@CapcoMail/Sms/alertSmsConsumedCredit.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars($element, array $params): array
    {
        return [
            "platformName" => $params["platformName"],
            "amount" => $params['remainingCredits'],
            "adminUrl" => $params['adminUrl'],
            "baseUrl" => $params['baseURL'],
            "remainingCreditsPercent" => $params['remainingCreditsPercent'],
        ];
    }

    public static function getMySubjectVars($element, array $params): array
    {
        return [
            'platformName' => $params['platformName'],
            "remainingCreditsPercent" => $params['remainingCreditsPercent'],
        ];
    }

    public static function mockData()
    {
        return [
            "amount" => 1000,
            "remainingCreditsPercent" => "75",
            "baseUrl" => "/capco",
            "platformName" => "capco",
            "adminUrl" => "/admin",
            'platformLink' => 'https://cap-collectif.com',
            "user_locale" => "fr",
        ];
    }

}
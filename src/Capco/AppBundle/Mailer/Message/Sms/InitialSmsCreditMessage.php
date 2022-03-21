<?php

namespace Capco\AppBundle\Mailer\Message\Sms;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class InitialSmsCreditMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'initial.sms.credit.email.subject';
    public const TEMPLATE = '@CapcoMail/Sms/initialSmsCredit.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(SmsCredit $smsCredit, array $params): array
    {
        return [
            "amount" => $smsCredit->getAmount(),
            "baseUrl" => $params['baseURL'],
            "platformName" => $params['platformName'],
            'platformLink' => $params['platformLink'],
            "projectsUrl" => $params['projectsUrl'],
        ];
    }

    public static function getMySubjectVars(SmsCredit $smsCredit, array $params): array
    {
        return [
            'platformName' => $params['platformName']
        ];
    }

    public static function mockData()
    {
        return [
            "amount" => 1000,
            "baseUrl" => "/capco",
            "platformName" => "capco",
            'platformLink' => 'https://cap-collectif.com',
            "user_locale" => "fr",
            "projectsUrl" => "/projects",
        ];
    }

}
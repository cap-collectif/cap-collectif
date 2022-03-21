<?php

namespace Capco\AppBundle\Mailer\Message\Sms;

use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class CreateSmsOrderMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'create.sms.order.email.subject';
    public const TEMPLATE = '@CapcoMail/Sms/createSmsOrder.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(SmsOrder $smsOrder, array $params): array
    {
        return [
            "amount" => $smsOrder->getAmount(),
            "baseUrl" => $params['baseURL'],
            "platformName" => $params['platformName'],
            'platformLink' => $params['platformLink'],
        ];
    }

    public static function getMySubjectVars(SmsOrder $smsOrder, array $params): array
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
        ];
    }

}
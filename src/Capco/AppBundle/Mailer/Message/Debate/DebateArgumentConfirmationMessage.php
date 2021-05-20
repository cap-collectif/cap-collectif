<?php

namespace Capco\AppBundle\Mailer\Message\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class DebateArgumentConfirmationMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'argument.publication.email.title';
    public const TEMPLATE = '@CapcoMail/Debate/debateArgumentConfirmation.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(DebateAnonymousArgument $argument, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(DebateAnonymousArgument $argument, array $params): array
    {
        return [
            "confirmationUrl" => $params["confirmationUrl"],
            "organizationName" => $params["organizationName"],
            "username" => $argument->getUsername() ?? "",
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
        ];
    }
}

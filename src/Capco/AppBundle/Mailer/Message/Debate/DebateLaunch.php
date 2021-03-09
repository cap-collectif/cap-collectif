<?php

namespace Capco\AppBundle\Mailer\Message\Debate;

use Capco\AppBundle\Entity\Debate\DebateVoteToken;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class DebateLaunch extends AbstractExternalMessage
{
    public const SUBJECT = 'email-debate-launch-subject';
    public const TEMPLATE = '@CapcoMail/Debate/debateLaunch.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(DebateVoteToken $voteToken, array $params): array
    {
        return [
            'debateName' => $voteToken->getDebate()->getStep()
                ? $voteToken
                    ->getDebate()
                    ->getStep()
                    ->getTitle()
                : '',
        ];
    }

    public static function getMyTemplateVars(DebateVoteToken $voteToken, array $params): array
    {
        return self::filterParams($params) + [
            'username' => $voteToken->getUser()->getDisplayName(),
            'debate' => $voteToken->getDebate(),
            'isReminder' => false,
        ];
    }

    protected static function filterParams(array $params): array
    {
        return [
            'debateUrl' => $params['debateUrl'],
            'coverUrl' => $params['coverUrl'],
            'forUrl' => $params['forUrl'],
            'forAuthorImgUrl' => $params['forAuthorImgUrl'],
            'againstAuthorImgUrl' => $params['againstAuthorImgUrl'],
            'againstUrl' => $params['againstUrl'],
            'organizationName' => $params['organizationName'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'participantsCount' => $params['participantsCount'],
        ];
    }
}

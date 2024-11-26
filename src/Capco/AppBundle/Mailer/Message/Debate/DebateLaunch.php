<?php

namespace Capco\AppBundle\Mailer\Message\Debate;

use Capco\AppBundle\Entity\Debate\DebateVoteToken;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Repository\DebateRepository;
use Psr\Container\ContainerInterface;

class DebateLaunch extends AbstractExternalMessage
{
    public const SUBJECT = 'email-debate-launch-subject';
    final public const TEMPLATE = '@CapcoMail/Debate/debateLaunch.html.twig';
    final public const FOOTER = '';

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

    public static function mockData(ContainerInterface $container)
    {
        $debate = $container->get(DebateRepository::class)->find('debateCannabis');

        return [
            'debateUrl' => 'http://capco.dev',
            'coverUrl' => 'https://source.unsplash.com/random/800x600',
            'unsubscribeUrl' => 'http://capco.dev',
            'forUrl' => 'test',
            'forAuthorImgUrl' => 'https://source.unsplash.com/random/64x64',
            'againstAuthorImgUrl' => 'https://source.unsplash.com/random/64x64',
            'againstUrl' => 'test',
            'participantsCount' => 5496,
            'organizationName' => 'Cap Collectif',
            'siteName' => 'Cap Collectif',
            'baseUrl' => 'http://capco.dev',
            'siteUrl' => 'http://capco.dev',
            'user_locale' => 'fr_FR',
            'template' => self::TEMPLATE,
            'username' => 'Juliette',
            'debate' => $debate,
            'isReminder' => true,
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
            'unsubscribeUrl' => $params['unsubscribeUrl'],
        ];
    }
}

<?php

namespace Capco\AppBundle\Mailer\Message\Contribution;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Model\Contribution;

final class ContributionModerationMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'moderation.notification.subject';
    public const TEMPLATE = '@CapcoMail/notifyModeration.html.twig';

    public  static function getMyTemplateVars(Contribution $contribution, array $params): array {
        return [
            'contribution' => $contribution,
            'trashUrl' => $params['trashURL'],
            'username' => $contribution->getAuthor()->getUsername()
        ];
    }


    public static function getMySubjectVars(Contribution $contribution, array $params): array
    {
        return [];
    }
}
